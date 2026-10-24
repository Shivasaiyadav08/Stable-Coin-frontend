'use client';

import { useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { chain } from '@/lib/contracts';
import { errorMessage } from '@/lib/errors';
import WalletButton from './WalletButton';
import { Feedback } from './ui/Feedback';

export default function WalletGuard() {
  const { address, chainId } = useAccount();
  const { switchChainAsync, isPending } = useSwitchChain();
  const [error, setError] = useState('');
  if (!address)
    return (
      <div className="wallet-gate">
        <div>
          <strong>Your wallet, your position.</strong>
          <p>
            Connect to view balances and manage collateral. You can explore public accounts without
            connecting.
          </p>
        </div>
        <WalletButton />
      </div>
    );
  if (chainId === chain.id) return null;
  return (
    <Feedback tone="warning" title="Switch to Sepolia to continue">
      <p>
        This deployment is available on Sepolia only. Transactions are disabled on other networks.
      </p>
      <button
        className="button button-secondary"
        disabled={isPending}
        onClick={async () => {
          setError('');
          try {
            await switchChainAsync({ chainId: chain.id });
          } catch (cause) {
            setError(errorMessage(cause));
          }
        }}
      >
        {isPending ? 'Switching…' : 'Switch to Sepolia'}
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </Feedback>
  );
}
