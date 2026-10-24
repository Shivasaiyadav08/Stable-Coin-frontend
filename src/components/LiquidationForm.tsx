'use client';

import { useState, type FormEvent } from 'react';
import { formatUnits, type Address } from 'viem';
import { useAccount, useConfig } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { usePosition, useProtocol } from '@/hooks/useProtocol';
import { chain, engineAbi, engineAddress } from '@/lib/contracts';
import { formatAmount, parseAmount } from '@/lib/amounts';
import { errorMessage } from '@/lib/errors';
import { useTransaction } from './TransactionProvider';
import { Feedback } from './ui/Feedback';
import { Field } from './ui/Field';
import WalletGuard from './WalletGuard';

export default function LiquidationForm({ target }: { target: Address }) {
  const config = useConfig();
  const { address, chainId } = useAccount();
  const protocol = useProtocol();
  const targetPosition = usePosition(target);
  const walletPosition = usePosition(address);
  const { busy, run } = useTransaction();
  const [tokenAddress, setTokenAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [quote, setQuote] = useState<bigint | null>(null);
  const settings = protocol.data;
  const position = targetPosition.data;
  const wallet = walletPosition.data;
  const collateral = position?.tokens.filter((token) => token.deposited > 0n) ?? [];
  const token = collateral.find((item) => item.address === tokenAddress) ?? collateral[0];
  const eligible =
    !!settings && !!position && position.debt > 0n && position.health < settings.minimumHealth;
  const ready =
    eligible &&
    !!address &&
    chainId === chain.id &&
    !!wallet &&
    !protocol.isError &&
    !targetPosition.isError &&
    !walletPosition.isError;

  function changeAmount(value: string) {
    setAmount(value);
    setQuote(null);
    setError('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || !settings || !position || !wallet || !address || !token || busy) return;
    const debt = parseAmount(amount, settings.dsc.decimals);
    if (debt === null) {
      setError(`Enter a positive DSC amount with up to ${settings.dsc.decimals} decimals.`);
      return;
    }
    if (debt > position.debt || debt > wallet.dscBalance) {
      setError('The amount exceeds the target debt or the DSC balance in your wallet.');
      return;
    }
    setChecking(true);
    setError('');
    try {
      const result = await targetPosition.refetch({ throwOnError: true });
      if (!result.data || result.data.debt === 0n || result.data.health >= settings.minimumHealth) {
        setError('This account is no longer eligible for liquidation.');
        setQuote(null);
        return;
      }
      const base = await readContract(config, {
        chainId: chain.id,
        address: engineAddress,
        abi: engineAbi,
        functionName: 'getTokenAmountFromUsd',
        args: [token.address, debt],
      });
      const received = base + (base * settings.bonus) / settings.liquidationPrecision;
      const available =
        result.data.tokens.find((item) => item.address === token.address)?.deposited ?? 0n;
      if (received > available) {
        setError(
          'The target does not have enough of this collateral for the selected amount. Reduce the debt to cover.',
        );
        setQuote(null);
        return;
      }
      if (quote === null || quote !== received) {
        setQuote(received);
        return;
      }

      const success = await run({
        account: address,
        label: `Liquidate ${formatAmount(debt, settings.dsc.decimals)} DSC`,
        functionName: 'liquidate',
        args: [token.address, target, debt],
        approval: { token: settings.dsc.address, amount: debt, symbol: settings.dsc.symbol },
      });
      if (success) changeAmount('');
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setChecking(false);
    }
  }

  return (
    <section className="panel panel-body liquidation-panel">
      <p className="eyebrow">ADVANCED OPERATION</p>
      <h2>Liquidate this position</h2>
      <p className="muted form-description">
        Repay eligible debt using your DSC and receive collateral according to the engine’s
        liquidation rules.
      </p>
      {targetPosition.isError || protocol.isError ? (
        <Feedback tone="error" title="Eligibility is unavailable">
          Refresh the account data before attempting a liquidation.
        </Feedback>
      ) : !position || !settings ? (
        <p role="status">Checking eligibility…</p>
      ) : !eligible ? (
        <Feedback
          title={
            position.debt === 0n
              ? 'This position has no debt'
              : 'This position meets the minimum health factor'
          }
        >
          Liquidation is unavailable for this account.
        </Feedback>
      ) : (
        <>
          <WalletGuard />
          <form onSubmit={submit}>
            <fieldset disabled={!ready || busy || checking}>
              <legend className="sr-only">Liquidation amount and collateral</legend>
              <div className="field">
                <label htmlFor="liquidation-token">Collateral to receive</label>
                <select
                  id="liquidation-token"
                  value={token?.address ?? ''}
                  onChange={(event) => {
                    setTokenAddress(event.target.value);
                    changeAmount('');
                  }}
                >
                  {collateral.map((item) => (
                    <option key={item.address} value={item.address}>
                      {item.symbol}
                    </option>
                  ))}
                </select>
              </div>
              <Field
                label="DSC debt to cover"
                value={amount}
                onChange={(event) => changeAmount(event.target.value)}
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                suffix="DSC"
                error={error || undefined}
              />
              <div className="amount-helper">
                <span>
                  {wallet
                    ? `Your balance: ${formatAmount(wallet.dscBalance, settings.dsc.decimals)} DSC`
                    : 'Connect to load your DSC balance'}
                </span>
                <button
                  type="button"
                  className="text-button"
                  disabled={!wallet}
                  onClick={() =>
                    wallet &&
                    changeAmount(
                      formatUnits(
                        wallet.dscBalance < position.debt ? wallet.dscBalance : position.debt,
                        settings.dsc.decimals,
                      ),
                    )
                  }
                >
                  Max debt
                </button>
              </div>
            </fieldset>
            {quote !== null && token ? (
              <div className="action-preview">
                <span className="eyebrow">ESTIMATED COLLATERAL RECEIVED</span>
                <h3>
                  {formatAmount(quote, token.decimals, 6)} {token.symbol}
                </h3>
                <p>
                  Includes the contract’s{' '}
                  {formatAmount((settings.bonus * 100n) / settings.liquidationPrecision, 0)}% bonus.
                  The required DSC approval equals the debt you cover.
                </p>
              </div>
            ) : null}
            <button
              className="button button-danger button-full"
              disabled={!ready || busy || checking || !amount}
            >
              {busy
                ? 'Transaction in progress…'
                : checking
                  ? 'Checking eligibility…'
                  : quote !== null
                    ? 'Confirm liquidation'
                    : 'Review liquidation'}
            </button>
            <p className="form-footnote">
              The contract must accept the liquidation and the resulting position health. A quote
              does not guarantee execution.
            </p>
          </form>
        </>
      )}
    </section>
  );
}
