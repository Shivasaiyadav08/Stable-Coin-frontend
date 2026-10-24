'use client';

import type { Address } from 'viem';
import { usePosition, useProtocol } from '@/hooks/useProtocol';
import { formatAmount, formatUsd, mintCapacity, shortAddress } from '@/lib/amounts';
import { explorerAddress } from '@/lib/contracts';
import { positionRisk } from '@/lib/risk';
import { Feedback } from './ui/Feedback';
import { CopyAddress } from './ui/CopyAddress';
import RiskGauge from './RiskGauge';

export default function PositionSummary({ address }: { address?: Address }) {
  const protocol = useProtocol();
  const position = usePosition(address);
  const settings = protocol.data;
  const data = position.data;
  const loading = !!address && (protocol.isPending || position.isPending);
  const unavailable = protocol.isError || (!!address && position.isError);
  const available = !!address && !!settings && !!data && !unavailable;
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
  const risk =
    data && settings ? positionRisk(data.health, settings.minimumHealth, data.debt > 0n) : null;

  function value(text: string) {
    if (!address) return '—';
    if (unavailable) return 'Unavailable';
    return loading ? 'Reading…' : text;
  }

  return (
    <section
      className="panel position-panel"
      aria-label="Position overview"
      aria-busy={loading || position.isFetching}
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">POSITION OVERVIEW</p>
          <h2>
            {address ? (
              <a href={explorerAddress(address)} target="_blank" rel="noreferrer">
                {shortAddress(address)} <span aria-hidden="true">↗</span>
              </a>
            ) : (
              'Your on-chain position'
            )}
          </h2>
        </div>
        <span className={`badge ${available && risk ? `badge-${risk.tone}` : ''}`}>
          {available && risk
            ? risk.label
            : unavailable
              ? 'Read unavailable'
              : address
                ? 'Reading Sepolia'
                : 'Awaiting wallet'}
        </span>
      </div>
      {unavailable ? (
        <Feedback tone="error" title="Position data is unavailable">
          <p>Balances and actions remain unavailable until contract reads succeed.</p>
          <button
            className="text-button"
            onClick={async () => {
              await protocol.refetch();
              await position.refetch();
            }}
          >
            Retry data refresh
          </button>
        </Feedback>
      ) : null}
      <div className="position-instruments">
        <div className="position-figures">
          <dl className="stat-grid">
            <div className="primary-stat">
              <dt>
                <span className="metric-symbol">↗</span> Collateral value
              </dt>
              <dd>
                {value(data && settings ? formatUsd(data.collateralUsd, settings.precision) : '—')}
              </dd>
              <span>Engine valuation · USD</span>
            </div>
            <div>
              <dt>
                <span className="metric-symbol violet">◈</span> Outstanding debt
              </dt>
              <dd>
                {value(data && settings ? formatAmount(data.debt, settings.dsc.decimals) : '—')}
                <small>{available ? ' DSC' : ''}</small>
              </dd>
              <span>Minted DSC still to repay</span>
            </div>
            <div>
              <dt>Available mint capacity</dt>
              <dd>
                {value(data && settings ? formatAmount(capacity, settings.dsc.decimals) : '—')}
                <small>{available ? ' DSC' : ''}</small>
              </dd>
              <span>Remaining capacity under the contract limit</span>
            </div>
            <div>
              <dt>DSC wallet balance</dt>
              <dd>
                {value(
                  data && settings ? formatAmount(data.dscBalance, settings.dsc.decimals) : '—',
                )}
              </dd>
              <span>Available in this wallet</span>
            </div>
          </dl>
          {!address ? (
            <p className="empty-note">
              <span className="signal-square" /> Connect your wallet to load actual balances. Public
              accounts can be inspected in the explorer.
            </p>
          ) : null}
        </div>
        <RiskGauge
          health={data?.health ?? 0n}
          minimum={settings?.minimumHealth ?? 10n ** 18n}
          precision={settings?.precision ?? 10n ** 18n}
          hasDebt={!!data && data.debt > 0n}
          available={available}
        />
      </div>
      {available && risk?.tone === 'danger' ? (
        <Feedback tone="error" title="This position is liquidatable">
          <p>
            Its health factor is below the minimum. The contract can reject partial repayments that
            leave the position below minimum.
          </p>
        </Feedback>
      ) : null}
      <div className="holdings">
        <div className="holdings-heading">
          <h3>
            Collateral assets{' '}
            <span className="count-label">
              {available ? data.tokens.length.toString().padStart(2, '0') : '—'}
            </span>
          </h3>
          <span>Wallet balance / Deposited</span>
        </div>
        {available ? (
          data.tokens.map((token) => (
            <div className="holding-row" key={token.address}>
              <a href={explorerAddress(token.address)} target="_blank" rel="noreferrer">
                <span className="token-monogram">{token.symbol.slice(0, 1)}</span>
                <span>
                  {token.symbol}
                  <small>Collateral asset</small>
                </span>
                <span className="muted" aria-hidden="true">
                  ↗
                </span>
              </a>
              <span>
                {formatAmount(token.walletBalance, token.decimals)}
                <span className="muted"> / </span>
                <strong>{formatAmount(token.deposited, token.decimals)}</strong>
              </span>
            </div>
          ))
        ) : (
          <div className="holdings-empty">
            <span className="token-monogram">◇</span>
            <p>
              {unavailable
                ? 'Asset balances could not be read.'
                : address
                  ? 'Reading approved assets and balances…'
                  : 'Your supported collateral will appear here.'}
            </p>
          </div>
        )}
        {available ? (
          <div className="holdings-footer">
            <CopyAddress
              key={settings.dsc.address}
              address={settings.dsc.address}
              label="Copy DSC token address"
            />
            <a
              href={explorerAddress(settings.dsc.address)}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              DSC token ↗
            </a>
          </div>
        ) : null}
      </div>
      <div className="position-data-bar">
        <span>
          <span className={`status-dot ${!available ? 'dot-muted' : ''}`} />{' '}
          {position.isFetching
            ? 'Refreshing from Sepolia…'
            : available
              ? `Updated ${new Date(position.dataUpdatedAt).toLocaleTimeString()}`
              : 'Awaiting account data'}
        </span>
        <span>{available ? `BLOCK ${data.blockNumber.toString()}` : 'SEPOLIA / 11155111'}</span>
      </div>
    </section>
  );
}
