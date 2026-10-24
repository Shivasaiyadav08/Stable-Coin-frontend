'use client';

import { useQuery } from '@tanstack/react-query';
import { erc20Abi, type Address } from 'viem';
import { useConfig } from 'wagmi';
import { getPublicClient } from 'wagmi/actions';
import { chain, engineAbi, engineAddress } from '@/lib/contracts';

export function useProtocol() {
  const config = useConfig();
  return useQuery({
    queryKey: ['protocol', chain.id],
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    queryFn: async () => {
      const client = getPublicClient(config, { chainId: chain.id });
      if (!client) throw new Error('RPC client unavailable');
      const contract = { address: engineAddress, abi: engineAbi };
      const [tokens, dscAddress, threshold, liquidationPrecision, bonus, minimumHealth, precision] =
        await Promise.all([
          client.readContract({ ...contract, functionName: 'getCollateralTokens' }),
          client.readContract({ ...contract, functionName: 'getDsc' }),
          client.readContract({ ...contract, functionName: 'getLiquidationThreshold' }),
          client.readContract({ ...contract, functionName: 'getLiquidationPrecision' }),
          client.readContract({ ...contract, functionName: 'getLiquidationBonus' }),
          client.readContract({ ...contract, functionName: 'getMinHealthFactor' }),
          client.readContract({ ...contract, functionName: 'getPrecision' }),
        ]);
      if (!precision || !liquidationPrecision || !minimumHealth || !threshold)
        throw new Error('Invalid protocol parameters');

      const readToken = async (address: Address) => {
        const [symbol, decimals] = await Promise.all([
          client.readContract({ address, abi: erc20Abi, functionName: 'symbol' }),
          client.readContract({ address, abi: erc20Abi, functionName: 'decimals' }),
        ]);
        return { address, symbol, decimals };
      };
      const [tokenResults, dsc] = await Promise.all([
        Promise.allSettled(tokens.map(readToken)),
        readToken(dscAddress),
      ]);
      // A broken collateral deployment must not hide other readable assets.
      // Its balance stays unknown; it is never replaced with zero or guessed decimals.
      const collateralTokens = tokenResults.flatMap((result) =>
        result.status === 'fulfilled' ? [result.value] : [],
      );
      return {
        collateralTokens,
        dsc,
        threshold,
        liquidationPrecision,
        bonus,
        minimumHealth,
        precision,
      };
    },
  });
}

export function usePosition(address?: Address) {
  const config = useConfig();
  const protocol = useProtocol();
  const settings = protocol.data;

  return useQuery({
    queryKey: [
      'position',
      chain.id,
      address?.toLowerCase(),
      settings?.dsc.address,
      settings?.collateralTokens.map((token) => token.address).join(','),
    ],
    enabled: !!address && !!settings && !protocol.isError,
    staleTime: 5_000,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
    queryFn: async () => {
      if (!address || !settings) throw new Error('An account and protocol settings are required');
      const client = getPublicClient(config, { chainId: chain.id });
      if (!client) throw new Error('RPC client unavailable');
      // A single block keeps balances and risk values internally consistent.
      const blockNumber = await client.getBlockNumber({ cacheTime: 0 });
      const contract = { address: engineAddress, abi: engineAbi, blockNumber };
      const [account, health, dscBalance, tokens] = await Promise.all([
        client.readContract({
          ...contract,
          functionName: 'getAccountInformation',
          args: [address],
        }),
        client.readContract({ ...contract, functionName: 'getHealthFactor', args: [address] }),
        client.readContract({
          address: settings.dsc.address,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [address],
          blockNumber,
        }),
        Promise.all(
          settings.collateralTokens.map(async (token) => {
            const [deposited, walletBalance] = await Promise.all([
              client.readContract({
                ...contract,
                functionName: 'getCollateralBalanceOfUser',
                args: [address, token.address],
              }),
              client.readContract({
                address: token.address,
                abi: erc20Abi,
                functionName: 'balanceOf',
                args: [address],
                blockNumber,
              }),
            ]);
            return { ...token, deposited, walletBalance };
          }),
        ),
      ]);
      return {
        debt: account[0],
        collateralUsd: account[1],
        health,
        dscBalance,
        tokens,
        blockNumber,
      };
    },
  });
}
