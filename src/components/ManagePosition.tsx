'use client';

import { positionActions, useManagePosition, type PositionAction } from '@/hooks/useManagePosition';
import { formatAmount, formatUsd } from '@/lib/amounts';
import { Feedback } from './ui/Feedback';
import { Field } from './ui/Field';

export default function ManagePosition() {
  const form = useManagePosition();
  const { asset, preview, settings } = form;

  return (
    <section className="panel manage-panel" aria-labelledby="manage-title">
      <div className="action-tabs" role="group" aria-label="Position action">
        {(Object.keys(positionActions) as PositionAction[]).map((action) => (
          <button
            key={action}
            aria-pressed={form.action === action}
            disabled={form.submitting}
            onClick={() => form.changeAction(action)}
          >
            {positionActions[action].label}
          </button>
        ))}
      </div>
      <div className="panel-body">
        <p className="eyebrow">MANAGE YOUR POSITION</p>
        <h2 id="manage-title">{form.actionDetails.title}</h2>
        <p className="muted form-description">{form.actionDetails.description}</p>
        <form onSubmit={form.submit}>
          <fieldset disabled={form.disabled}>
            <legend className="sr-only">{form.actionDetails.title}</legend>
            {form.usesCollateral ? (
              <div className="field">
                <label htmlFor="collateral-token">Collateral asset</label>
                <select
                  id="collateral-token"
                  value={form.token?.address ?? ''}
                  onChange={(event) => form.changeToken(event.target.value)}
                >
                  {form.tokens.map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.symbol}
                    </option>
                  ))}
                  {!form.token ? (
                    <option value="">
                      {form.address ? 'Loading approved assets…' : 'Connect to load your assets'}
                    </option>
                  ) : null}
                </select>
              </div>
            ) : null}
            <Field
              label={`Amount to ${form.actionDetails.label.toLowerCase()}`}
              value={form.amount}
              onChange={(event) => form.changeAmount(event.target.value)}
              placeholder="0.00"
              inputMode="decimal"
              autoComplete="off"
              suffix={asset?.symbol ?? (form.usesCollateral ? '' : 'DSC')}
              error={form.error || undefined}
            />
            <div className="amount-helper">
              <span>
                {form.maximum !== undefined && asset
                  ? `${form.actionDetails.balanceLabel}: ${formatAmount(form.maximum, asset.decimals)} ${asset.symbol}`
                  : 'Balances appear after connecting'}
              </span>
              <button
                type="button"
                className="text-button"
                disabled={!form.maximum || !asset}
                onClick={form.fillMaximum}
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
                    {form.amount} {asset?.symbol}
                  </dd>
                </div>
                <div>
                  <dt>Collateral value</dt>
                  <dd>{formatUsd(preview.collateralUsd, settings.precision)}</dd>
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
                Prices and balances may change. The app simulates the action before signing; the
                contract validates it when the transaction executes.
              </p>
            </div>
          ) : null}
          <button
            className="button button-primary button-full"
            type="submit"
            disabled={form.disabled || !form.amount}
          >
            {form.submitLabel} <span aria-hidden="true">→</span>
          </button>
          <p className="form-footnote">{form.footnote}</p>
          {form.error && !form.ready ? (
            <Feedback tone="error" title="Action unavailable">
              {form.error}
            </Feedback>
          ) : null}
        </form>
      </div>
    </section>
  );
}
