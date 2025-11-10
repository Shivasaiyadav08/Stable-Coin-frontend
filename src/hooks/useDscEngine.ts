// hooks/useDSCEngine.ts
"use client";
import { DSCENGINEABI, DSENGINECONTRACTADDRESS } from "@/constants";
import { useReadContracts, useAccount, useConfig } from "wagmi";
import { readContract } from "wagmi/actions";
import { useCallback } from "react";

export const useDscEngine = () => {
  const config = useConfig();
  const { address, isConnected } = useAccount();

  // Properly typed contract reads with refetch capability
  const { data: contractData, refetch: refetchUserData } = useReadContracts({
    contracts: [
      {
        abi: DSCENGINEABI,
        address: DSENGINECONTRACTADDRESS,
        functionName: "getHealthFactor",
        args: [address!],
      },
      {
        abi: DSCENGINEABI,
        address: DSENGINECONTRACTADDRESS,
        functionName: "getAccountInformation",
        args: [address!],
      },
      {
        abi: DSCENGINEABI,
        address: DSENGINECONTRACTADDRESS,
        functionName: "getCollateralTokens",
      },
      {
        abi: DSCENGINEABI,
        address: DSENGINECONTRACTADDRESS,
        functionName: "getLiquidationThreshold",
      },
      {
        abi: DSCENGINEABI,
        address: DSENGINECONTRACTADDRESS,
        functionName: "getPrecision",
      },
    ],
    query: {
      enabled: isConnected && !!address,
      
    },
  });

  // Reusable function to get any user's health factor
  const getHealthFactor = useCallback(async (userAddress: `0x${string}`): Promise<bigint> => {
    try {
      const hf = await readContract(config, {
        abi: DSCENGINEABI,
        address: DSENGINECONTRACTADDRESS,
        functionName: "getHealthFactor",
        args: [userAddress],
      });
      return hf as bigint;
    } catch (error) {
      console.error("Error getting health factor:", error);
      return 0n;
    }
  }, [config]);

  // Reusable function to get account information
  const getAccountInformation = useCallback(async (userAddress: `0x${string}`): Promise<[bigint, bigint]> => {
    try {
      const info = await readContract(config, {
        abi: DSCENGINEABI,
        address: DSENGINECONTRACTADDRESS,
        functionName: "getAccountInformation",
        args: [userAddress],
      });
      return info as [bigint, bigint];
    } catch (error) {
      console.error("Error getting account info:", error);
      return [0n, 0n];
    }
  }, [config]);

  // Helper to extract data with proper typing
  const getHealthFactorData = (): bigint | null => {
    if (contractData?.[0]?.status === 'success') {
      return contractData[0].result as bigint;
    }
    return null;
  };

  const getAccountInfoData = (): [bigint, bigint] | null => {
    if (contractData?.[1]?.status === 'success') {
      return contractData[1].result as [bigint, bigint];
    }
    return null;
  };

  const getCollateralTokensData = (): string[] | null => {
    if (contractData?.[2]?.status === 'success') {
      return contractData[2].result as string[];
    }
    return null;
  };

  const getLiquidationThreshold = (): bigint | null => {
    if (contractData?.[3]?.status === 'success') {
      return contractData[3].result as bigint;
    }
    return null;
  };

  const getPrecision = (): bigint | null => {
    if (contractData?.[4]?.status === 'success') {
      return contractData[4].result as bigint;
    }
    return null;
  };

  return {
    contractData,
    refetchUserData,
    getHealthFactor,
    getAccountInformation,
    getHealthFactorData,
    getAccountInfoData,
    getCollateralTokensData,
    getLiquidationThreshold,
    getPrecision,
    isConnected,
    address
  };
};