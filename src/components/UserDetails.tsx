// components/UserDetails.tsx
"use client";
import { useDscEngine } from "@/hooks/useDscEngine";
import { Card } from "./ui/Card";
import { useState, useEffect, useCallback } from "react";
import { readContract } from "wagmi/actions";
import { DSCENGINEABI, DSENGINECONTRACTADDRESS, WETHADDRESS } from "@/constants";
import { useConfig } from "wagmi";

export default function UserDetails() {
  const { 
    getHealthFactorData, 
    getAccountInfoData, 
    getCollateralTokensData,
    refetchUserData,
    isConnected,
    address 
  } = useDscEngine();
  const config = useConfig();

  const [totalCollateralInEth, setTotalCollateralInEth] = useState<number>(0);
  const [userCollateralBalances, setUserCollateralBalances] = useState<{token: string, balance: string}[]>([]);
  const [maxMintableDSC, setMaxMintableDSC] = useState<string>('0');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Format large numbers properly
  const formatHealthFactor = (hf: bigint | null): string => {
    if (!hf) return '--';
    
    const hfNumber = Number(hf) / 1e18;
    
    if (hfNumber > 1e9) {
      return hfNumber.toExponential(4);
    }
    
    return hfNumber.toFixed(4);
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

  // Calculate max mintable DSC based on health factor
  const calculateMaxMintableDSC = (accountInfo: [bigint, bigint] | null, healthFactor: bigint | null): string => {
    if (!accountInfo || !healthFactor) return '0';
    
    const currentDSC = Number(accountInfo[0]) / 1e18;
    const collateralValue = Number(accountInfo[1]) / 1e18;
    const currentHF = Number(healthFactor) / 1e18;
    
    // If health factor is already below 1, cannot mint more
    if (currentHF < 1) return '0';
    
    // Assuming liquidation threshold of 0.8 (80%) for calculation
    const liquidationThreshold = 0.5;
    const maxTotalDSC = collateralValue * liquidationThreshold;
    const additionalDSC = maxTotalDSC - currentDSC;
    
    return Math.max(0, additionalDSC).toFixed(4);
  };

  // Update all data - use ref to prevent infinite re-renders
  const updateAllData = useCallback(async () => {
    if (!isConnected || !address) return;

    setIsRefreshing(true);
    try {
      const accountInfo = getAccountInfoData();
      
      // Calculate ETH value
      if (accountInfo) {
        try {
          const wethAmount = await readContract(config,{
            abi: DSCENGINEABI,
            address: DSENGINECONTRACTADDRESS,
            functionName: "getTokenAmountFromUsd",
            args: [WETHADDRESS, accountInfo[1]],
          }) as bigint;

          const ethValue = Number(wethAmount) / 1e18;
          setTotalCollateralInEth(ethValue);
        } catch (error) {
          console.error("Error calculating ETH value:", error);
          const collateralUsd = Number(accountInfo[1]) / 1e18;
          const ethValue = collateralUsd / 2000;
          setTotalCollateralInEth(ethValue);
        }
      }

      // Get user's collateral balances
      const collateralTokens = getCollateralTokensData();
      if (collateralTokens && address) {
        const balances = await Promise.all(
          collateralTokens.map(async (token) => {
            try {
              const balance = await readContract(config,{
                abi: DSCENGINEABI,
                address: DSENGINECONTRACTADDRESS,
                functionName: "getCollateralBalanceOfUser",
                args: [address, token as `0x${string}`],
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
        setUserCollateralBalances(balances);
      }

      // Calculate max mintable DSC
      const healthFactor = getHealthFactorData();
      const maxMintable = calculateMaxMintableDSC(accountInfo, healthFactor);
      setMaxMintableDSC(maxMintable);
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error updating data:", error);
    } finally {
      setIsRefreshing(false);
    }
  // Only include stable dependencies - remove config if it changes frequently
  }, [isConnected, address, getAccountInfoData, getCollateralTokensData, getHealthFactorData]);

  // Initial data load only - use a ref to track if we've already loaded
  let hasLoadedRef = useState(false)[0];
  
  useEffect(() => {
    if (isConnected && address && !hasLoadedRef) {
      updateAllData();
      // Mark as loaded
      hasLoadedRef = true;
    }
  }, [isConnected, address]); // Remove updateAllData from dependencies

  const handleManualRefresh = async () => {
    await refetchUserData();
    await updateAllData();
  };

  if (!isConnected) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">User Details</h2>
        <p className="text-gray-400">Please connect your wallet to view your details</p>
      </Card>
    );
  }

  const healthFactor = getHealthFactorData();
  const accountInfo = getAccountInfoData();

  const healthFactorValue = healthFactor ? Number(healthFactor) / 1e18 : 0;
  const isUnsafe = healthFactorValue > 0 && healthFactorValue < 1;

  return (
    <Card gradient className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Your Position</h2>
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
            isUnsafe 
              ? 'bg-red-900/50 text-red-300 border border-red-700' 
              : healthFactorValue === 0
              ? 'bg-gray-700 text-gray-300 border border-gray-600'
              : 'bg-green-900/50 text-green-300 border border-green-700'
          }`}>
            {isUnsafe ? 'At Risk' : healthFactorValue === 0 ? 'Loading...' : 'Healthy'}
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="text-blue-400 hover:text-blue-300 transition-colors text-sm disabled:opacity-50"
            title="Refresh data"
          >
            {isRefreshing ? '⏳' : '🔄'}
          </button>
        </div>
      </div>

      {/* Last update time */}
      <div className="text-right mb-4">
        <p className="text-gray-400 text-xs">
          Last updated: {lastUpdate.toLocaleTimeString()}
          {isRefreshing && ' (Refreshing...)'}
        </p>
      </div>

      {/* User Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="space-y-1 p-3 bg-gray-600/30 rounded-lg">
          <p className="text-gray-400 text-xs font-medium">Health Factor</p>
          <p className={`text-base font-bold break-all ${
            isUnsafe ? 'text-red-400' : 'text-green-400'
          }`}>
            {formatHealthFactor(healthFactor)}
          </p>
        </div>

        <div className="space-y-1 p-3 bg-gray-600/30 rounded-lg">
          <p className="text-gray-400 text-xs font-medium">DSC Minted</p>
          <p className="text-base font-bold text-white break-all">
            {formatDSC(accountInfo ? accountInfo[0] : null)}
          </p>
          <p className="text-gray-400 text-xs">DSC</p>
        </div>

        <div className="space-y-1 p-3 bg-gray-600/30 rounded-lg">
          <p className="text-gray-400 text-xs font-medium">Collateral (USD)</p>
          <p className="text-base font-bold text-white break-all">
            {formatUSD(accountInfo ? accountInfo[1] : null)}
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

        <div className="space-y-1 p-3 bg-blue-600/30 rounded-lg border border-blue-500/50">
          <p className="text-blue-300 text-xs font-medium">Max Mintable DSC</p>
          <p className="text-base font-bold text-white break-all">
            {maxMintableDSC}
          </p>
          <p className="text-blue-300 text-xs">Safe to Mint</p>
        </div>
      </div>

      {userCollateralBalances.length > 0 && (
        <div className="mt-6 p-4 bg-gray-700/50 border border-gray-600 rounded-xl">
          <p className="text-gray-400 text-sm font-medium mb-3">Your Collateral Tokens</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userCollateralBalances.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-600/30 rounded-lg">
                <span className="text-blue-300 text-sm font-mono">
                  {item.token.substring(0, 8)}...{item.token.substring(36)}
                </span>
                <span className="text-white font-semibold">
                  {item.balance}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isUnsafe && (
        <div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-xl">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <p className="text-red-300 font-semibold">
              Warning: Your position is undercollateralized and may be liquidated
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}