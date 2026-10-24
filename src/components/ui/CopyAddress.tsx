'use client';

import { useState } from 'react';

export function CopyAddress({ address, label }: { address: string; label: string }) {
  const [status, setStatus] = useState('');
  return (
    <span className="copy-address">
      <button
        className="text-button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(address);
            setStatus('Copied');
          } catch {
            setStatus('Copy unavailable; use the explorer link.');
          }
        }}
      >
        {label}
      </button>
      {status ? <span role="status">{status}</span> : null}
    </span>
  );
}
