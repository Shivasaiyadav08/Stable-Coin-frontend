// components/DSCActions.tsx
"use client";
import { useState } from "react";
import { useTokenOperations } from "@/hooks/useTokenOperations";
import { useDscEngine } from "@/hooks/useDscEngine";
import { WETHABI, WETHADDRESS, DSENGINECONTRACTADDRESS, DSCENGINEABI, ERC20ABI, ERC20ADDRESS } from "@/constants";
import { InputForm } from "./ui/Input";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { isValidAddress, isValidAmount } from "@/utils/validators";

export default function DSCActions() {
  const { loading, setLoading, checkAndApprove, executeContractWrite, isConnected } = useTokenOperations();
  const { refetchUserData } = useDscEngine();
  
  const [depositData, setDepositData] = useState({ tokenAddress: "", amount: "" });
  const [mintAmount, setMintAmount] = useState("");
  const [burnAmount, setBurnAmount] = useState("");
  const [redeemData, setRedeemData] = useState({ tokenAddress: "", amount: "" });
  const [message, setMessage] = useState("");

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleTransaction = async (transactionFn: () => Promise<void>, successMessage: string) => {
    if (!isConnected) {
      showMessage("Please connect your wallet!");
      return;
    }

    setLoading(true);
    try {
      await transactionFn();
      showMessage(successMessage);
      
      // Refresh user data after successful transaction
      setTimeout(() => {
        refetchUserData();
      }, 2000);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Transaction failed";
      showMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!isValidAddress(depositData.tokenAddress)) {
      showMessage("Invalid token address!");
      return;
    }

    if (!isValidAmount(depositData.amount)) {
      showMessage("Invalid deposit amount!");
      return;
    }

    await handleTransaction(async () => {
      const amount = BigInt(depositData.amount);
      
      await checkAndApprove({
        tokenAddress: WETHADDRESS as `0x${string}`,
        tokenABI: WETHABI,
        spender: DSENGINECONTRACTADDRESS as `0x${string}`,
        amount
      });
      
      await executeContractWrite({
        abi: DSCENGINEABI,
        address: DSENGINECONTRACTADDRESS,
        functionName: "depositCollateral",
        args: [depositData.tokenAddress as `0x${string}`, amount],
      });
    }, "Collateral deposited successfully!");

    setDepositData({ tokenAddress: "", amount: "" });
  };

  const handleMint = async () => {
    if (!isValidAmount(mintAmount)) {
      showMessage("Invalid mint amount!");
      return;
    }

    await handleTransaction(async () => {
      await executeContractWrite({
        abi: DSCENGINEABI,
        address: DSENGINECONTRACTADDRESS,
        functionName: "mintDsc",
        args: [BigInt(mintAmount)],
      });
    }, "DSC minted successfully!");

    setMintAmount("");
  };

  const handleBurn = async () => {
    if (!isValidAmount(burnAmount)) {
      showMessage("Invalid burn amount!");
      return;
    }

    await handleTransaction(async () => {
      const amount = BigInt(burnAmount);
      await checkAndApprove({
        tokenAddress: ERC20ADDRESS as `0x${string}`,
        tokenABI: ERC20ABI,
        spender: DSENGINECONTRACTADDRESS as `0x${string}`,
        amount
      });
      
      await executeContractWrite({
        abi: DSCENGINEABI,
        address: DSENGINECONTRACTADDRESS,
        functionName: "burnDsc",
        args: [amount],
      });
    }, "DSC burned successfully!");

    setBurnAmount("");
  };

  const handleRedeem = async () => {
    if (!isValidAddress(redeemData.tokenAddress)) {
      showMessage("Invalid token address!");
      return;
    }

    if (!isValidAmount(redeemData.amount)) {
      showMessage("Invalid redeem amount!");
      return;
    }

    await handleTransaction(async () => {
      await executeContractWrite({
        abi: DSCENGINEABI,
        address: DSENGINECONTRACTADDRESS,
        functionName: "redeemCollateral",
        args: [redeemData.tokenAddress as `0x${string}`, BigInt(redeemData.amount)],
      });
    }, "Collateral redeemed successfully!");

    setRedeemData({ tokenAddress: "", amount: "" });
  };

  

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Manage Your DSC</h2>

      {message && (
        <div className={`p-4 rounded-xl mb-6 ${
          message.includes("failed") || message.includes("Invalid") || message.includes("Please")
            ? "bg-red-500/20 border border-red-500/30 text-red-300"
            : "bg-green-500/20 border border-green-500/30 text-green-300"
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Deposit */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Deposit Collateral</h3>
          <InputForm
            label="Token Address"
            placeholder="0x..."
            value={depositData.tokenAddress}
            onChange={(e) => setDepositData(prev => ({ ...prev, tokenAddress: e.target.value }))}
          />
          <InputForm
            label="Amount (wei)"
            placeholder="1000000000000000000"
            value={depositData.amount}
            onChange={(e) => setDepositData(prev => ({ ...prev, amount: e.target.value }))}
          />
          <Button onClick={handleDeposit} loading={loading}>
            Deposit Collateral
          </Button>
        </div>

        {/* Mint */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Mint DSC</h3>
          <InputForm
            label="Amount to Mint"
            placeholder="1000000000000000000"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
          />
          <Button onClick={handleMint} loading={loading} variant="secondary">
            Mint DSC
          </Button>
        </div>

        {/* Burn */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Burn DSC</h3>
          <InputForm
            label="Amount to Burn"
            placeholder="1000000000000000000"
            value={burnAmount}
            onChange={(e) => setBurnAmount(e.target.value)}
          />
          <Button onClick={handleBurn} loading={loading} variant="secondary">
            Burn DSC
          </Button>
        </div>

        {/* Redeem */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Redeem Collateral</h3>
          <InputForm
            label="Token Address"
            placeholder="0x..."
            value={redeemData.tokenAddress}
            onChange={(e) => setRedeemData(prev => ({ ...prev, tokenAddress: e.target.value }))}
          />
          <InputForm
            label="Amount (wei)"
            placeholder="1000000000000000000"
            value={redeemData.amount}
            onChange={(e) => setRedeemData(prev => ({ ...prev, amount: e.target.value }))}
          />
          <Button onClick={handleRedeem} loading={loading}>
            Redeem Collateral
          </Button>
        </div>
      </div>
    </Card>
  );
}