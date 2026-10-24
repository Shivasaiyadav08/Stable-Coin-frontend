import { formatAmount } from '@/lib/amounts';
import { positionRisk } from '@/lib/risk';

type RiskGaugeProps = {
  health: bigint;
  minimum: bigint;
  precision: bigint;
  hasDebt: boolean;
  available: boolean;
};

export default function RiskGauge({
  health,
  minimum,
  precision,
  hasDebt,
  available,
}: RiskGaugeProps) {
  const risk = positionRisk(health, minimum, hasDebt);
  // Clamp before converting to Number. Only this drawing uses floating point.
  const scaled = hasDebt ? (health * 1000n) / minimum : 3000n;
  const fraction = Number(scaled > 3000n ? 3000n : scaled) / 3000;
  const angle = Math.PI * (1 - fraction);
  const x = 150 + 112 * Math.cos(angle);
  const y = 146 - 112 * Math.sin(angle);
  const minimumLabel = formatAmount((minimum * 10n ** 18n) / precision, 18, 2);
  const value = !available
    ? '—'
    : !hasDebt
      ? 'No debt'
      : formatAmount((health * 10n ** 18n) / precision, 18, 3);

  return (
    <div className={`risk-gauge risk-${available ? risk.tone : 'empty'}`}>
      <div className="risk-gauge-heading">
        <span className="eyebrow">POSITION HEALTH</span>
        <span className="instrument-label">HF / 01</span>
      </div>
      <svg
        viewBox="0 0 300 185"
        role="img"
        aria-label={
          available
            ? `Health factor ${value}. ${risk.label}. Minimum ${minimumLabel}.`
            : 'Health factor unavailable until account data is loaded.'
        }
      >
        <path className="gauge-track" d="M38 146a112 112 0 0 1 224 0" pathLength="100" />
        <path
          className="gauge-danger"
          d="M38 146a112 112 0 0 1 224 0"
          pathLength="100"
          strokeDasharray="33.333 66.667"
        />
        <path
          className="gauge-healthy"
          d="M38 146a112 112 0 0 1 224 0"
          pathLength="100"
          strokeDasharray="66.667 33.333"
          strokeDashoffset="-33.333"
        />
        <path className="gauge-inner" d="M53 146a97 97 0 0 1 194 0" />
        {available ? <circle className="gauge-marker" cx={x} cy={y} r="5" /> : null}
        <text
          x="150"
          y="119"
          className={`gauge-value ${!hasDebt ? 'gauge-no-debt' : ''}`}
          textAnchor="middle"
        >
          {value}
        </text>
        <text x="150" y="144" className="gauge-value-label" textAnchor="middle">
          {available ? risk.label : 'Awaiting account'}
        </text>
        <text x="35" y="172" className="gauge-tick">
          0
        </text>
        <text x="88" y="47" className="gauge-tick" textAnchor="middle">
          {minimumLabel} MIN
        </text>
        <text x="265" y="172" className="gauge-tick" textAnchor="end">
          {formatAmount((minimum * 3n * 10n ** 18n) / precision, 18, 2)}+
        </text>
      </svg>
      <p className="risk-description">
        {available
          ? risk.description
          : 'Connect a wallet or look up an account to view its on-chain health.'}
      </p>
    </div>
  );
}
