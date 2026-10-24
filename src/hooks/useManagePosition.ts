'use client';

import { useState, type FormEvent } from 'react';
import { formatUnits, type Address } from 'viem';
import { useAccount, useConfig } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { useTransaction } from '@/components/TransactionProvider';
import { healthAfter, mintCapacity, parseAmount } from '@/lib/amounts';
import { chain, engineAbi, engineAddress } from '@/lib/contracts';
import { errorMessage } from '@/lib/errors';
import type { TransactionRequest } from '@/lib/transactions';
import { usePosition, useProtocol } from './useProtocol';

export const positionActions = {
  deposit: {
    label: 'Deposit',
    title: 'Add collateral',
    description: 'Deposit an approved token to build or strengthen your position.',
    functionName: 'depositCollateral',
    balanceLabel: 'Available',
  },
  mint: {
    label: 'Mint',
    title: 'Mint DSC',
    description: 'Mint DSC against your collateral within the contract’s limit.',
    functionName: 'mintDsc',
    balanceLabel: 'Theoretical capacity',
  },
  burn: {
    label: 'Burn',
    title: 'Burn DSC to repay',
    description: 'Burn DSC from your wallet to reduce your outstanding debt.',
    functionName: 'burnDsc',
    balanceLabel: 'Available',
  },
  redeem: {
    label: 'Redeem',
    title: 'Redeem collateral',
    description: 'Release collateral while meeting the minimum health factor.',
    functionName: 'redeemCollateral',
    balanceLabel: 'Deposited',
  },
} as const;

export type PositionAction = keyof typeof positionActions;
type PositionPreview = { health: bigint | null; collateralUsd: bigint; debt: bigint };

export function useManagePosition() {
  const { address, chainId } = useAccount();
  const config = useConfig();
  const protocolQuery = useProtocol();
  const positionQuery = usePosition(address);
  const { busy, run } = useTransaction();

  const [action, setAction] = useState<PositionAction>('deposit');
  const [tokenAddress, setTokenAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [preparing, setPreparing] = useState(false);
  const [preview, setPreview] = useState<PositionPreview | null>(null);

  const settings = protocolQuery.data;
  const position = positionQuery.data;
  const tokens = position?.tokens ?? [];
  const token = tokens.find((item) => item.address === tokenAddress) ?? tokens[0];
  const usesCollateral = action === 'deposit' || action === 'redeem';
  const asset = usesCollateral ? token : settings?.dsc;
  const actionDetails = positionActions[action];
  const capacity =
    position && settings
      ? mintCapacity(
          position.collateralUsd,
          position.debt,
          settings.threshold,
          settings.liquidationPrecision,
          settings.precision,
          settings.minimumHealth,
        )
      : 0n;

  function getMaximumAmount() {
    if (!position) return undefined;
    switch (action) {
      case 'deposit':
        return token?.walletBalance;
      case 'redeem':
        return token?.deposited;
      case 'burn':
        return position.dscBalance < position.debt ? position.dscBalance : position.debt;
      case 'mint':
        return capacity;
    }
  }

  const maximum = getMaximumAmount();
  const dataUnavailable = protocolQuery.isError || positionQuery.isError;
  const ready = !!address && chainId === chain.id && !!settings && !!position && !dataUnavailable;
  const submitting = busy || preparing;

  function changeAmount(value: string) {
    setAmount(value);
    setError('');
    setPreview(null);
  }

  function changeAction(value: PositionAction) {
    setAction(value);
    changeAmount('');
  }

  function changeToken(value: string) {
    setTokenAddress(value);
    changeAmount('');
  }

  function fillMaximum() {
    if (asset && maximum !== undefined) changeAmount(formatUnits(maximum, asset.decimals));
  }

  function getSubmitLabel() {
    if (busy) return 'Transaction in progress…';
    if (preparing) return 'Checking position…';
    const step = preview ? 'Confirm' : 'Review';
    return `${step} ${actionDetails.label.toLowerCase()}`;
  }

  function getFootnote() {
    if (!address) return 'Connect your wallet to manage a position.';
    if (chainId !== chain.id) return 'Switch to Sepolia to enable actions.';
    if (dataUnavailable) return 'Actions are paused until account data can be read.';
    if (!ready) return 'Loading protocol and account data…';
    if (action === 'mint')
      return 'Max uses the contract boundary. Minting at the limit leaves no health buffer.';
    if (action === 'redeem')
      return 'Max uses the deposited amount. Health checks may require a smaller withdrawal.';
    return 'Network fees are paid in Sepolia ETH.';
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!ready || !settings || !position || !asset || !address || submitting) return;

    const amountInUnits = parseAmount(amount, asset.decimals);
    if (amountInUnits === null) {
      setError(`Enter a positive amount with up to ${asset.decimals} decimal places.`);
      return;
    }
    if (maximum !== undefined && amountInUnits > maximum) {
      setError(
        action === 'mint'
          ? 'The amount exceeds the current mint capacity. Reduce it or add collateral.'
          : 'The amount exceeds your available balance or outstanding debt.',
      );
      return;
    }

    setPreparing(true);
    try {
      // 1. Calculate the position after the requested action.
      let collateralUsd = position.collateralUsd;
      let debt = position.debt;
      if (usesCollateral && token) {
        const amountUsd = await readContract(config, {
          chainId: chain.id,
          address: engineAddress,
          abi: engineAbi,
          functionName: 'getUsdValue',
          args: [token.address, amountInUnits],
        });
        if (action === 'deposit') collateralUsd += amountUsd;
        else collateralUsd = collateralUsd > amountUsd ? collateralUsd - amountUsd : 0n;
      } else if (action === 'mint') debt += amountInUnits;
      else debt -= amountInUnits;

      const health = healthAfter(
        collateralUsd,
        debt,
        settings.threshold,
        settings.liquidationPrecision,
        settings.precision,
      );
      if (health !== null && health < settings.minimumHealth) {
        setError(
          'This would leave the position below the required health factor. Reduce the amount, add collateral, or repay debt.',
        );
        return;
      }

      // 2. Show a review first. Changed account data requires a fresh review.
      if (
        !preview ||
        preview.health !== health ||
        preview.collateralUsd !== collateralUsd ||
        preview.debt !== debt
      ) {
        setPreview({ health, collateralUsd, debt });
        return;
      }

      // 3. The shared transaction service handles approvals, simulation and receipts.
      let args: readonly (Address | bigint)[] = [amountInUnits];
      if (usesCollateral && token) args = [token.address, amountInUnits];

      let approval: TransactionRequest['approval'];
      if (action === 'deposit' && token)
        approval = { token: token.address, amount: amountInUnits, symbol: token.symbol };
      if (action === 'burn')
        approval = {
          token: settings.dsc.address,
          amount: amountInUnits,
          symbol: settings.dsc.symbol,
        };

      const success = await run({
        account: address,
        label: `${actionDetails.label} ${asset.symbol}`,
        functionName: actionDetails.functionName,
        args,
        approval,
      });
      if (success) changeAmount('');
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setPreparing(false);
    }
  }

  return {
    address,
    settings,
    tokens,
    token,
    asset,
    action,
    actionDetails,
    usesCollateral,
    amount,
    error,
    preview,
    maximum,
    ready,
    submitting,
    disabled: !ready || submitting,
    submitLabel: getSubmitLabel(),
    footnote: getFootnote(),
    changeAmount,
    changeAction,
    changeToken,
    fillMaximum,
    submit,
  };
}
