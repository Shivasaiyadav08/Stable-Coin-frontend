// components/Liquidate.tsx
"use client";
import { useState } from "react";
import { useTokenOperations } from "@/hooks/useTokenOperations";
import { useDscEngine } from "@/hooks/useDscEngine";
import { DSCENGINEABI, DSENGINECONTRACTADDRESS, ERC20ABI, ERC20ADDRESS } from "@/constants";
import { InputForm } from "./ui/Input";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { isValidAddress, isValidAmount } from "@/utils/validators";
import { readContract } from "wagmi/actions";
import { useConfig } from "wagmi";

export default function Liquidate() {
  const { loading, setLoading, checkAndApprove, executeContractWrite, isConnected } = useTokenOperations();
  const { getHealthFactor } = useDscEngine();
  const config = useConfig();
  
  const [liquidateData, setLiquidateData] = useState({
    tokenAddress: "",
    userAddress: "",
    debtToCover: ""
  });
  const [healthFactorAddress, setHealthFactorAddress] = useState("");
  const [healthFactor, setHealthFactor] = useState<string>("--");
  const [message, setMessage] = useState("");

  // Simple health factor formatter
  const formatHealthFactor = (hf: bigint | null): string => {
    if (!hf) return '--';
    
    const hfString = hf.toString();
    
    // If it's a very large number (like 1e59), show as "Very High"
    if (hfString.length > 20) {
      return "Very High";
    }
    
    try {
      const hfNumber = Number(hf) / 1e18;
      
      // Cut to 3 decimal places
      return hfNumber.toFixed(3);
    } catch {
      return '--';
    }
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleCheckHealthFactor = async () => {
    if (!isValidAddress(healthFactorAddress)) {
      showMessage("Invalid address!");
      return;
    }

    try {
      const hf = await getHealthFactor(healthFactorAddress);
      setHealthFactor(formatHealthFactor(hf));
      showMessage(`Health Factor: ${formatHealthFactor(hf)}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch health factor";
      showMessage(errorMessage);
      setHealthFactor("--");
    }
  };

  const getLiquidationAmount = async (): Promise<bigint> => {
    const valueInCollateral = await readContract(config, {
      abi: DSCENGINEABI,
      address: DSENGINECONTRACTADDRESS,
      functionName: "getTokenAmountFromUsd",
      args: [liquidateData.tokenAddress as `0x${string}`, BigInt(liquidateData.debtToCover)],
    }) as bigint;

    const bonus = await readContract(config, {
      abi: DSCENGINEABI,
      address: DSENGINECONTRACTADDRESS,
      functionName: "getLiquidationBonus",
    }) as bigint;

    const precision = await readContract(config, {
      abi: DSCENGINEABI,
      address: DSENGINECONTRACTADDRESS,
      functionName: "getLiquidationPrecision",
    }) as bigint;

    const bonusCollateral = (valueInCollateral * bonus) / precision;
    return valueInCollateral + bonusCollateral;
  };

  const handleLiquidate = async () => {
    if (!isConnected) {
      showMessage("Please connect your wallet!");
      return;
    }

    if (!isValidAddress(liquidateData.tokenAddress) || !isValidAddress(liquidateData.userAddress)) {
      showMessage("Invalid addresses!");
      return;
    }

    if (!isValidAmount(liquidateData.debtToCover)) {
      showMessage("Invalid debt amount!");
      return;
    }

    setLoading(true);
    try {
      const userHf = await getHealthFactor(liquidateData.userAddress);
      
      // Simple health factor check
      if (userHf && Number(userHf) / 1e18 >= 1) {
        showMessage("User is healthy - cannot liquidate!");
        return;
      }

      const toBeApproved = await getLiquidationAmount();
      
      await checkAndApprove({
        tokenAddress: ERC20ADDRESS as `0x${string}`,
        tokenABI: ERC20ABI,
        spender: DSENGINECONTRACTADDRESS as `0x${string}`,
        amount: toBeApproved
      });

      await executeContractWrite({
        abi: DSCENGINEABI,
        address: DSENGINECONTRACTADDRESS,
        functionName: "liquidate",
        args: [
          liquidateData.tokenAddress as `0x${string}`, 
          liquidateData.userAddress as `0x${string}`, 
          BigInt(liquidateData.debtToCover)
        ],
      });

      showMessage("Liquidation successful!");
      setLiquidateData({ tokenAddress: "", userAddress: "", debtToCover: "" });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Liquidation failed";
      showMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Liquidation Dashboard</h2>

      {message && (
        <div className={`p-4 rounded-xl mb-6 ${
          message.includes("failed") || message.includes("Invalid") || message.includes("cannot") || message.includes("Please")
            ? "bg-red-500/20 border border-red-500/30 text-red-300"
            : "bg-green-500/20 border border-green-500/30 text-green-300"
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Health Factor Check */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Check Health Factor</h3>
          <InputForm
            label="Account Address"
            placeholder="0x..."
            value={healthFactorAddress}
            onChange={(e) => setHealthFactorAddress(e.target.value)}
          />
          <Button onClick={handleCheckHealthFactor} variant="secondary">
            Get Health Factor
          </Button>
          
          {/* Health Factor Display */}
          <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl">
            <p className="text-blue-300 font-semibold">Health Factor: {healthFactor}</p>
          </div>
        </div>

        {/* Liquidation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Liquidate Position</h3>
          <InputForm
            label="Collateral Token"
            placeholder="0x..."
            value={liquidateData.tokenAddress}
            onChange={(e) => setLiquidateData(prev => ({ ...prev, tokenAddress: e.target.value }))}
          />
          <InputForm
            label="User Address"
            placeholder="0x..."
            value={liquidateData.userAddress}
            onChange={(e) => setLiquidateData(prev => ({ ...prev, userAddress: e.target.value }))}
          />
          <InputForm
            label="Debt to Cover"
            placeholder="1000000000000000000"
            value={liquidateData.debtToCover}
            onChange={(e) => setLiquidateData(prev => ({ ...prev, debtToCover: e.target.value }))}
          />
          <Button onClick={handleLiquidate} loading={loading} variant="danger">
            Liquidate Position
          </Button>
        </div>
      </div>
    </Card>
  );
}