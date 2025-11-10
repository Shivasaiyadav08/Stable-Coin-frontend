// components/AccountDetails.tsx
"use client";
import { DSCENGINEABI, DSENGINECONTRACTADDRESS, WETHADDRESS } from "@/constants";
import { useState } from "react";
import { useAccount, useConfig } from "wagmi";
import { readContract } from "wagmi/actions";
import { InputForm } from "./ui/Input";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { isValidAddress } from "@/utils/validators";

export default function AccountDetails() {
  const [accountAddress, setAccountAddress] = useState<string>("");
  const [accountInfo, setAccountInfo] = useState<[bigint, bigint] | null>(null);
  const [healthFactor, setHealthFactor] = useState<bigint | null>(null);
  const [totalCollateralInEth, setTotalCollateralInEth] = useState<number>(0);
  const [accountCollateralBalances, setAccountCollateralBalances] = useState<{token: string, balance: string}[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { isConnected } = useAccount();
  const config = useConfig();

  // Format large numbers properly
  const formatHealthFactor = (hf: bigint | null): string => {
    if (!hf) return '--';
    
    const hfNumber = Number(hf) / 1e18;
    
    if (hfNumber > 1e9) {
      return hfNumber.toExponential(4);
    }
    
    return hfNumber.toFixed(2);
  };

  const formatDSC = (dsc: bigint | null): string => {
    if (!dsc) return '--';
    
    const dscNumber = Number(dsc) / 1e18;
    
    if (dscNumber > 1e9) {
      return dscNumber.toExponential(4);
    }
    
    return dscNumber.toFixed(4);
  };

  const formatUSD = (value: bigint | null): string => {
    if (!value) return '--';
    
    const usdNumber = Number(value) / 1e18;
    
    if (usdNumber > 1e9) {
      return `$${usdNumber.toExponential(4)}`;
    }
    
    return `$${usdNumber.toFixed(2)}`;
  };

  const formatETH = (value: number): string => {
    if (value === 0) return '--';
    
    if (value > 1e9) {
      return value.toExponential(4);
    }
    
    return value.toFixed(4);
  };

  // Calculate ETH value using getTokenAmountFromUsd function
  const calculateEthValue = async (usdValue: bigint) => {
    try {
      const wethAmount = await readContract(config,{
        abi: DSCENGINEABI,
        address: DSENGINECONTRACTADDRESS,
        functionName: "getTokenAmountFromUsd",
        args: [WETHADDRESS, usdValue],
      }) as bigint;

      const ethValue = Number(wethAmount) / 1e18;
      setTotalCollateralInEth(ethValue);
    } catch (error) {
      console.error("Error calculating ETH value:", error);
      // Fallback calculation
      const collateralUsd = Number(usdValue) / 1e18;
      const ethValue = collateralUsd / 2000;
      setTotalCollateralInEth(ethValue);
    }
  };

  // Get collateral tokens and balances for the account
  const fetchAccountCollateralData = async (userAddress: string) => {
    try {
      // Get all collateral tokens
      const tokens = await readContract(config,{
        abi: DSCENGINEABI,
        address: DSENGINECONTRACTADDRESS,
        functionName: "getCollateralTokens",
      }) as string[];

      // Get balances for each token
      const balances = await Promise.all(
        tokens.map(async (token) => {
          try {
            const balance = await readContract(config,{
              abi: DSCENGINEABI,
              address: DSENGINECONTRACTADDRESS,
              functionName: "getCollateralBalanceOfUser",
              args: [userAddress as `0x${string}`, token as `0x${string}`],
            }) as bigint;

            return {
              token,
              balance: (Number(balance) / 1e18).toFixed(6)
            };
          } catch (error) {
            console.error(`Error fetching balance for token ${token}:`, error);
            return {
              token,
              balance: '0'
            };
          }
        })
      );

      setAccountCollateralBalances(balances);
    } catch (error) {
      console.error("Error fetching collateral data:", error);
    }
  };

  const handleDetails = async () => {
    if (!isConnected) {
      setError("Please connect your wallet!");
      return;
    }

    if (!isValidAddress(accountAddress)) {
      setError("Invalid account address!");
      return;
    }

    setLoading(true);
    setError("");
    setAccountInfo(null);
    setHealthFactor(null);
    setTotalCollateralInEth(0);
    setAccountCollateralBalances([]);

    try {
      // Get account info (returns [totalDscMinted, collateralValueInUsd])
      const info = await readContract(config,{
        abi: DSCENGINEABI,
        address: DSENGINECONTRACTADDRESS,
        functionName: "getAccountInformation",
        args: [accountAddress],
      }) as [bigint, bigint];

      // Get health factor
      const hf = await readContract(config,{
        abi: DSCENGINEABI,
        address: DSENGINECONTRACTADDRESS,
        functionName: "getHealthFactor",
        args: [accountAddress],
      }) as bigint;

      setAccountInfo(info);
      setHealthFactor(hf);

      // Calculate ETH value
      await calculateEthValue(info[1]);

      // Fetch collateral tokens and balances
      await fetchAccountCollateralData(accountAddress);
    } catch (error) {
      console.error("Error fetching account details:", error);
      setError("Failed to fetch account details. Please check the address and try again.");
    } finally {
      setLoading(false);
    }
  };

  const healthFactorValue = healthFactor ? Number(healthFactor) / 1e18 : 0;
  const isUnsafe = healthFactorValue > 0 && healthFactorValue < 1;

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Account Lookup</h2>
      
      <div className="space-y-4">
        <InputForm
          label="User Address"
          placeholder="0x..."
          value={accountAddress}
          onChange={(e) => setAccountAddress(e.target.value)}
        />
        
        <Button 
          onClick={handleDetails} 
          disabled={loading}
          variant="secondary"
        >
          {loading ? "Fetching..." : "Get Account Details"}
        </Button>

        {error && (
          <div className="p-4 bg-red-900/30 border border-red-700 text-red-300 rounded-xl">
            {error}
          </div>
        )}

        {accountInfo && healthFactor && (
          <div className="mt-6 space-y-6">
            {/* Account Overview */}
            <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Account Overview</h3>
              
              {/* FIXED GRID - REMOVED TRUNCATE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1 p-3 bg-gray-600/30 rounded-lg">
                  <p className="text-gray-400 text-xs font-medium">DSC Minted</p>
                  <p className="text-base font-bold text-white break-all">
                    {formatDSC(accountInfo[0])}
                  </p>
                  <p className="text-gray-400 text-xs">DSC</p>
                </div>
                
                <div className="space-y-1 p-3 bg-gray-600/30 rounded-lg">
                  <p className="text-gray-400 text-xs font-medium">Health Factor</p>
                  <p className={`text-base font-bold break-all ${
                    isUnsafe ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {formatHealthFactor(healthFactor)}
                  </p>
                </div>
                
                <div className="space-y-1 p-3 bg-gray-600/30 rounded-lg">
                  <p className="text-gray-400 text-xs font-medium">Collateral (USD)</p>
                  <p className="text-base font-bold text-white break-all">
                    {formatUSD(accountInfo[1])}
                  </p>
                  <p className="text-gray-400 text-xs">USD Value</p>
                </div>

                <div className="space-y-1 p-3 bg-gray-600/30 rounded-lg">
                  <p className="text-gray-400 text-xs font-medium">Collateral (ETH)</p>
                  <p className="text-base font-bold text-white break-all">
                    {formatETH(totalCollateralInEth)}
                  </p>
                  <p className="text-gray-400 text-xs">ETH Value</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 mt-4 border-t border-gray-600">
                <div className="space-y-1">
                  <p className="text-gray-400 text-sm">Account Status</p>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold w-fit ${
                    isUnsafe 
                      ? 'bg-red-900/50 text-red-300 border border-red-700' 
                      : 'bg-green-900/50 text-green-300 border border-green-700'
                  }`}>
                    {isUnsafe ? 'At Risk - Can be Liquidated' : 'Healthy'}
                  </div>
                </div>
              </div>

              {isUnsafe && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse flex-shrink-0" />
                    <p className="text-red-300 font-semibold text-sm">
                      This account is undercollateralized and can be liquidated
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Collateral Tokens */}
            {accountCollateralBalances.length > 0 && (
              <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-3">Collateral Tokens</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {accountCollateralBalances.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-600/30 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="text-blue-300 text-sm font-mono break-all">
                          {item.token}
                        </p>
                        <p className="text-gray-400 text-xs">Token Address</p>
                      </div>
                      <div className="text-right ml-3 flex-shrink-0">
                        <p className="text-white font-semibold text-md whitespace-nowrap">
                          {item.balance}
                        </p>
                        <p className="text-gray-400 text-xs">Balance</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}