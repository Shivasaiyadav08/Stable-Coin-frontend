'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import WalletGuard from '@/components/WalletGuard';
import PositionSummary from '@/components/PositionSummary';
import ManagePosition from '@/components/ManagePosition';

export default function DashboardPage() {
  const { address, chainId } = useAccount();
  const queries = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  async function refresh() {
    setRefreshing(true);
    try {
      await Promise.all([
        queries.invalidateQueries({ queryKey: ['protocol'] }),
        queries.invalidateQueries({ queryKey: ['position'] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="container workspace terminal">
      <div className="workspace-topline">
        <span className="section-kicker">DSC / POSITION TERMINAL</span>
        <span>EDUCATIONAL TESTNET APPLICATION</span>
      </div>
      <div className="page-heading">
        <div>
          <h1>
            Your position.
            <br className="mobile-break" />
            <span> In perspective.</span>
          </h1>
          <p>Live contract reads. Clear decisions. Full control of your next move.</p>
        </div>
        <button className="button button-secondary" disabled={refreshing} onClick={refresh}>
          <span className={refreshing ? 'refresh-spinning' : ''} aria-hidden="true">
            ↻
          </span>
          {refreshing ? 'Refreshing…' : 'Refresh data'}
        </button>
      </div>
      <WalletGuard />
      <div className="terminal-grid">
        <div className="terminal-overview">
          <PositionSummary address={address} />
          <div className="terminal-help">
            <div>
              <span className="signal-square" />
              <p>
                <strong>Know your margin.</strong> Mint capacity is a boundary, not a recommended
                target. Price changes can make a position liquidatable.
              </p>
            </div>
            <Link href="/docs#health" className="text-link">
              Understand risk ↗
            </Link>
          </div>
        </div>
        <ManagePosition key={`${address}-${chainId}`} />
      </div>
      <div className="workspace-bottom">
        <Link href="/explore">
          <span aria-hidden="true">⌕</span>
          <div>
            <strong>Look up an account</strong>
            <span>Explore positions and advanced liquidation tools.</span>
          </div>
          <span aria-hidden="true">↗</span>
        </Link>
        <Link href="/docs#transactions">
          <span aria-hidden="true">↳</span>
          <div>
            <strong>Understand the transaction flow</strong>
            <span>Approvals, confirmations, and what happens next.</span>
          </div>
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </div>
  );
}
