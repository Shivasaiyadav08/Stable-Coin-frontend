'use client';

import { useAccount } from 'wagmi';
import { chain } from '@/lib/contracts';

export default function NetworkStatus() {
  const { address, chainId, chain: walletChain } = useAccount();
  const unsupported = !!address && chainId !== chain.id;
  const label = !address
    ? 'Sepolia testnet'
    : (walletChain?.name ?? `Chain ${chainId ?? 'unknown'}`);
  return (
    <span className={`network-status ${unsupported ? 'network-unsupported' : ''}`}>
      <span className="status-dot" />
      {label}
      {unsupported ? <span className="sr-only">. Switch to Sepolia to transact.</span> : null}
    </span>
  );
}
