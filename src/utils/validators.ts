// Checks if a string is a valid Ethereum address.
export const isValidAddress = (addr: string): addr is `0x${string}` =>
  /^0x[a-fA-F0-9]{40}$/.test(addr);

//Validates that an amount:
export const isValidAmount = (amt: string): boolean =>
  /^\d+$/.test(amt) && BigInt(amt) > 0n;

// Converts Wei (the smallest Ether unit) into Ether, and formats it.
export const formatWeiToEther = (wei: bigint | string, decimals: number = 4): string => {
  try {
    const num = typeof wei === 'string' ? BigInt(wei) : wei;
    return (Number(num) / 1e18).toFixed(decimals);
  } catch {
    return '0';
  }
};

//Formats a value (in Wei-like units) as a USD currency string.
export const formatUSD = (value: bigint | string, decimals: number = 2): string => {
  try {
    const num = typeof value === 'string' ? BigInt(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(Number(num) / 1e18);
  } catch {
    return '$0.00';
  }
};

/// used to short address
export const shortenAddress = (address: string, chars: number = 4): string => {
  return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`;
};

// Safe bigint conversion utility
export const safeBigInt = (value: unknown): bigint => {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') return BigInt(value);
  if (typeof value === 'string') return BigInt(value);
  if (Array.isArray(value)) {
    throw new Error('Cannot convert array to bigint');
  }
  return 0n;
};