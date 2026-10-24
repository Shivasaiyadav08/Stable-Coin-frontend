'use client';

import { useState, type FormEvent } from 'react';
import { formatUnits, type Address } from 'viem';
import { useAccount, useConfig } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { usePosition, useProtocol } from '@/hooks/useProtocol';
import { formatAmount, formatUsd, healthAfter, mintCapacity, parseAmount } from '@/lib/amounts';
import { chain, engineAbi, engineAddress } from '@/lib/contracts';
import { errorMessage } from '@/lib/errors';
import { useTransaction } from './TransactionProvider';
import { Feedback } from './ui/Feedback';
import { Field } from './ui/Field';

const actions = {
  deposit: {
    label: 'Deposit',
    title: 'Add collateral',
    description: 'Deposit an approved token to build or strengthen your position.',
    functionName: 'depositCollateral',
  },
  mint: {
    label: 'Mint',
    title: 'Mint DSC',
    description: 'Mint DSC against your collateral within the contract’s limit.',
    functionName: 'mintDsc',
  },
  repay: {
    label: 'Burn',
    title: 'Burn DSC to repay',
    description: 'Burn DSC from your wallet to reduce your outstanding debt.',
    functionName: 'burnDsc',
  },
  withdraw: {
    label: 'Redeem',
    title: 'Redeem collateral',
    description:
      'Release collateral while keeping the remaining position above the minimum health factor.',
    functionName: 'redeemCollateral',
  },
} as const;
type Action = keyof typeof actions;

export default function ManagePosition() {
  const { address, chainId } = useAccount();
  const config = useConfig();
  const protocol = useProtocol();
  const position = usePosition(address);
  const { busy, run } = useTransaction();
  const [action, setAction] = useState<Action>('deposit');
  const [selectedToken, setSelectedToken] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [preparing, setPreparing] = useState(false);
  const [preview, setPreview] = useState<{
    health: bigint | null;
    usd: bigint;
    debt: bigint;
  } | null>(null);
  const settings = protocol.data;
  const data = position.data;
  const token = data?.tokens.find((item) => item.address === selectedToken) ?? data?.tokens[0];
  const usesCollateral = action === 'deposit' || action === 'withdraw';
  const asset = usesCollateral ? token : settings?.dsc;
  const parsed = asset ? parseAmount(amount, asset.decimals) : null;
  const capacity =
    data && settings
      ? mintCapacity(
          data.collateralUsd,
          data.debt,
          settings.threshold,
          settings.liquidationPrecision,
          settings.precision,
          settings.minimumHealth,
        )
      : 0n;
  function availableAmount() {
    if (!data) return undefined;
    if (action === 'deposit') return token?.walletBalance;
    if (action === 'withdraw') return token?.deposited;
    if (action === 'repay') return data.dscBalance < data.debt ? data.dscBalance : data.debt;
    return capacity;
  }
  const maximum = availableAmount();
  const ready =
    !!address &&
    chainId === chain.id &&
    !!settings &&
    !!data &&
    !protocol.isError &&
    !position.isError;
  const disabled = !ready || busy || preparing;
  const current = actions[action];

  function changeAmount(value: string) {
    setAmount(value);
    setError('');
    setPreview(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!ready || !settings || !data || !asset || !address || busy) return;
    if (parsed === null) {
      setError(`Enter a positive amount with up to ${asset.decimals} decimal places.`);
      return;
    }
    if (action !== 'mint' && maximum !== undefined && parsed > maximum) {
      setError('The amount exceeds your available balance or outstanding debt.');
      return;
    }
    if (action === 'mint' && parsed > capacity) {
      setError('The amount exceeds the current mint capacity. Reduce it or add collateral.');
      return;
    }
    setPreparing(true);
    try {
      let collateralUsd = data.collateralUsd;
      let debt = data.debt;
      if (usesCollateral && token) {
        const usd = await readContract(config, {
          chainId: chain.id,
          address: engineAddress,
          abi: engineAbi,
          functionName: 'getUsdValue',
          args: [token.address, parsed],
        });
        collateralUsd =
          action === 'deposit'
            ? collateralUsd + usd
            : collateralUsd > usd
              ? collateralUsd - usd
              : 0n;
      } else debt = action === 'mint' ? debt + parsed : debt - parsed;
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

      // First submit previews the effect. The second submit requests wallet signatures.
      if (
        !preview ||
        preview.health !== health ||
        preview.usd !== collateralUsd ||
        preview.debt !== debt
      ) {
        setPreview({ health, usd: collateralUsd, debt });
        return;
      }
      const args: readonly (Address | bigint)[] =
        usesCollateral && token ? [token.address, parsed] : [parsed];
      const approval =
        action === 'deposit' && token
          ? { token: token.address, amount: parsed, symbol: token.symbol }
          : action === 'repay'
            ? { token: settings.dsc.address, amount: parsed, symbol: settings.dsc.symbol }
            : undefined;
      const success = await run({
        account: address,
        label: `${current.label} ${asset.symbol}`,
        functionName: current.functionName,
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

  return (
    <section className="panel manage-panel" aria-labelledby="manage-title">
      <div className="action-tabs" role="group" aria-label="Position action">
        {(Object.keys(actions) as Action[]).map((key) => (
          <button
            key={key}
            aria-pressed={action === key}
            disabled={busy || preparing}
            onClick={() => {
              setAction(key);
              changeAmount('');
            }}
          >
            {actions[key].label}
          </button>
        ))}
      </div>
      <div className="panel-body">
        <p className="eyebrow">MANAGE YOUR POSITION</p>
        <h2 id="manage-title">{current.title}</h2>
        <p className="muted form-description">{current.description}</p>
        <form onSubmit={submit}>
          <fieldset disabled={disabled}>
            <legend className="sr-only">{current.title}</legend>
            {usesCollateral ? (
              <div className="field">
                <label htmlFor="collateral-token">Collateral asset</label>
                <select
                  id="collateral-token"
                  value={token?.address ?? ''}
                  onChange={(event) => {
                    setSelectedToken(event.target.value);
                    changeAmount('');
                  }}
                >
                  {data?.tokens.map((item) => (
                    <option key={item.address} value={item.address}>
                      {item.symbol}
                    </option>
                  ))}
                  {!token ? (
                    <option value="">
                      {address ? 'Loading approved assets…' : 'Connect to load your assets'}
                    </option>
                  ) : null}
                </select>
              </div>
            ) : null}
            <Field
              label={`Amount to ${current.label.toLowerCase()}`}
              value={amount}
              onChange={(event) => changeAmount(event.target.value)}
              placeholder="0.00"
              inputMode="decimal"
              autoComplete="off"
              suffix={asset?.symbol ?? (usesCollateral ? '' : 'DSC')}
              error={error || undefined}
            />
            <div className="amount-helper">
              <span>
                {maximum !== undefined && asset
                  ? `${action === 'mint' ? 'Theoretical capacity' : action === 'withdraw' ? 'Deposited' : 'Available'}: ${formatAmount(maximum, asset.decimals)} ${asset.symbol}`
                  : 'Balances appear after connecting'}
              </span>
              <button
                type="button"
                className="text-button"
                disabled={!maximum || !asset}
                onClick={() =>
                  asset &&
                  maximum !== undefined &&
                  changeAmount(formatUnits(maximum, asset.decimals))
                }
              >
                Max
              </button>
            </div>
          </fieldset>
          {preview && settings ? (
            <div className="action-preview">
              <span className="eyebrow">ESTIMATED POSITION AFTER ACTION</span>
              <dl>
                <div>
                  <dt>Amount</dt>
                  <dd>
                    {amount} {asset?.symbol}
                  </dd>
                </div>
                <div>
                  <dt>Collateral value</dt>
                  <dd>{formatUsd(preview.usd, settings.precision)}</dd>
                </div>
                <div>
                  <dt>Health factor</dt>
                  <dd>
                    {preview.health === null
                      ? 'No debt'
                      : formatAmount((preview.health * 10n ** 18n) / settings.precision, 18, 3)}
                  </dd>
                </div>
                <div>
                  <dt>Outstanding debt</dt>
                  <dd>{formatAmount(preview.debt, settings.dsc.decimals)} DSC</dd>
                </div>
              </dl>
              <p>
                Prices and balances may change. The contract simulates and validates the transaction
                before signing.
              </p>
            </div>
          ) : null}
          <button
            className="button button-primary button-full"
            type="submit"
            disabled={disabled || !amount}
          >
            {busy
              ? 'Transaction in progress…'
              : preparing
                ? 'Checking position…'
                : preview
                  ? `Confirm ${current.label.toLowerCase()}`
                  : `Review ${current.label.toLowerCase()}`}{' '}
            <span aria-hidden="true">→</span>
          </button>
          {!ready ? (
            <p className="form-footnote">
              {!address
                ? 'Connect your wallet to manage a position.'
                : chainId !== chain.id
                  ? 'Switch to Sepolia to enable actions.'
                  : protocol.isError || position.isError
                    ? 'Actions are paused until account data can be read.'
                    : 'Loading protocol and account data…'}
            </p>
          ) : (
            <p className="form-footnote">
              {action === 'mint'
                ? 'Max uses the contract boundary. Minting at the limit leaves no health buffer.'
                : action === 'withdraw'
                  ? 'Max uses the deposited amount. Health checks may require a smaller withdrawal.'
                  : 'Network fees are paid in Sepolia ETH.'}
            </p>
          )}
          {error && !ready ? (
            <Feedback tone="error" title="Action unavailable">
              {error}
            </Feedback>
          ) : null}
        </form>
      </div>
    </section>
  );
}
