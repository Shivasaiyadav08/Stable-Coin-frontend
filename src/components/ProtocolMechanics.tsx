'use client';

import { useState } from 'react';
import { healthAfter, formatUsd } from '@/lib/amounts';
import RiskGauge from './RiskGauge';

const precision = 10n ** 18n;

export default function ProtocolMechanics() {
  const [debt, setDebt] = useState(300);
  const health =
    healthAfter(1000n * precision, BigInt(debt) * precision, 50n, 100n, precision) ?? 0n;
  return (
    <div className="mechanics-lab" data-reveal>
      <div className="lab-controls">
        <div className="section-kicker">
          <span className="status-dot" /> INTERACTIVE EXAMPLE
        </div>
        <h3>
          More liquidity.
          <br />
          Less room for risk.
        </h3>
        <p>
          Move the debt slider to see how borrowing affects a position’s health under the configured
          model.
        </p>
        <dl className="lab-values">
          <div>
            <dt>Illustrative collateral</dt>
            <dd>$1,000.00</dd>
          </div>
          <div>
            <dt>Illustrative DSC debt</dt>
            <dd>{formatUsd(BigInt(debt) * precision)}</dd>
          </div>
        </dl>
        <label htmlFor="example-debt">
          Adjust example debt <span>{debt} DSC</span>
        </label>
        <input
          id="example-debt"
          type="range"
          min="100"
          max="650"
          step="10"
          value={debt}
          onChange={(event) => setDebt(Number(event.target.value))}
          aria-describedby="example-note"
        />
        <div className="range-labels">
          <span>100 DSC</span>
          <span>650 DSC</span>
        </div>
        <p id="example-note" className="example-note">
          Educational illustration, not your account or a price quote. Uses the deployment’s fixed
          50% threshold and 1.0 minimum health factor.
        </p>
      </div>
      <RiskGauge health={health} minimum={precision} precision={precision} hasDebt available />
    </div>
  );
}
