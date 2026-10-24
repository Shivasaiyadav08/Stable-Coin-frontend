'use client';

import { useState, type FormEvent } from 'react';
import { getAddress, isAddress, zeroAddress, type Address } from 'viem';
import { useAccount } from 'wagmi';
import PositionSummary from '@/components/PositionSummary';
import LiquidationForm from '@/components/LiquidationForm';
import { Field } from '@/components/ui/Field';

export default function ExplorePage() {
  const { address, chainId } = useAccount();
  const [input, setInput] = useState('');
  const [target, setTarget] = useState<Address>();
  const [error, setError] = useState('');

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = input.trim();
    if (!isAddress(value) || value.toLowerCase() === zeroAddress) {
      setError('Enter a valid, non-zero Ethereum address.');
      return;
    }
    setError('');
    setTarget(getAddress(value));
  }

  return (
    <div className="container workspace">
      <div className="page-heading">
        <div>
          <p className="eyebrow">PUBLIC ACCOUNT EXPLORER</p>
          <h1>Look under the hood.</h1>
          <p>Inspect any Sepolia position. No wallet connection needed.</p>
        </div>
        <span className="badge badge-accent">Sepolia testnet</span>
      </div>
      <form className="panel search-panel" onSubmit={search}>
        <Field
          label="Account address"
          placeholder="0x…"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setError('');
          }}
          error={error || undefined}
          spellCheck={false}
          autoComplete="off"
          hint="Public balances are read directly from the DSC Engine."
        />
        <div className="search-actions">
          <button className="button button-primary" type="submit">
            Explore account →
          </button>
          {address ? (
            <button
              className="text-button"
              type="button"
              onClick={() => {
                setInput(address);
                setTarget(address);
                setError('');
              }}
            >
              Use my address
            </button>
          ) : null}
        </div>
      </form>
      {target ? (
        <div key={`${target}-${address ?? ''}-${chainId}`} className="explorer-results">
          <PositionSummary address={target} />
          <LiquidationForm target={target} />
        </div>
      ) : (
        <div className="explorer-empty">
          <span className="outline-symbol" aria-hidden="true">
            ⌕
          </span>
          <h2>Every position tells a story.</h2>
          <p>
            Search an address to view its collateral, outstanding DSC, and current health factor.
          </p>
          <p className="muted">Eligible positions also show an advanced liquidation form.</p>
        </div>
      )}
    </div>
  );
}
