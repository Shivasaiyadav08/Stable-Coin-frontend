// Match the contract's liquidation boundary without extra interface thresholds.
export function positionRisk(health: bigint, minimum: bigint, hasDebt: boolean) {
  if (!hasDebt)
    return { label: 'No debt', tone: 'healthy', description: 'No outstanding DSC debt.' };
  if (health < minimum)
    return {
      label: 'Liquidatable',
      tone: 'danger',
      description: 'Below the contract minimum. This position may be liquidated.',
    };
  return {
    label: 'Meets minimum',
    tone: 'healthy',
    description: 'Meets the contract minimum. Collateral price changes can affect eligibility.',
  };
}
