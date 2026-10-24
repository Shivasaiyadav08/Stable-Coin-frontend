import { formatUnits, parseUnits } from 'viem';

// Never convert on-chain amounts to floating point for calculations.
export function parseAmount(value: string, decimals: number): bigint | null {
  const trimmed = value.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  if ((trimmed.split('.')[1]?.length ?? 0) > decimals) return null;
  try {
    const amount = parseUnits(trimmed, decimals);
    return amount > 0n && amount < 2n ** 256n ? amount : null;
  } catch {
    return null;
  }
}

export function formatAmount(amount: bigint, decimals = 18, places = 4): string {
  const [whole, fraction = ''] = formatUnits(amount, decimals).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const short = fraction.slice(0, places).replace(/0+$/, '');
  if (amount > 0n && whole === '0' && !short) return `<0.${'0'.repeat(places - 1)}1`;
  return short ? `${grouped}.${short}` : grouped;
}

export function formatUsd(amount: bigint, precision = 10n ** 18n): string {
  const cents = (amount * 100n) / precision;
  const dollars = (cents / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `$${dollars}.${(cents % 100n).toString().padStart(2, '0')}`;
}

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function mintCapacity(
  collateralUsd: bigint,
  debt: bigint,
  threshold: bigint,
  liquidationPrecision: bigint,
  precision: bigint,
  minimumHealth: bigint,
) {
  const adjustedCollateral = (collateralUsd * threshold) / liquidationPrecision;
  const limit = (adjustedCollateral * precision) / minimumHealth;
  return limit > debt ? limit - debt : 0n;
}

export function healthAfter(
  collateralUsd: bigint,
  debt: bigint,
  threshold: bigint,
  liquidationPrecision: bigint,
  precision: bigint,
): bigint | null {
  if (debt === 0n) return null;
  const adjustedCollateral = (collateralUsd * threshold) / liquidationPrecision;
  return (adjustedCollateral * precision) / debt;
}
