import type { Metadata } from 'next';
import Link from 'next/link';
import {
  engineAddress,
  explorerAddress,
  educationalSourceUrl,
  testnetDisclaimer,
} from '@/lib/contracts';

export const metadata: Metadata = { title: 'Protocol guide' };

export default function GuidePage() {
  return (
    <div className="container workspace guide-layout">
      <aside className="guide-nav">
        <p className="eyebrow">PROTOCOL GUIDE</p>
        <nav aria-label="Guide contents">
          <a href="#start">Getting started</a>
          <a href="#health">Position health</a>
          <a href="#transactions">Transactions & liquidation</a>
          <a href="#about">About DSC</a>
        </nav>
      </aside>
      <article className="guide-content">
        <p className="eyebrow">PROTOCOL GUIDE</p>
        <h1>Using DSC.</h1>
        <p className="lead">
          Deposit collateral, mint DSC and manage your position on Ethereum Sepolia.
        </p>
        <section id="start">
          <h2>Getting started</h2>
          <ol>
            <li>
              <strong>Connect your wallet.</strong> Switch to Sepolia and keep test ETH for fees.
            </li>
            <li>
              <strong>Deposit collateral.</strong> Choose a supported token and enter an amount.
              Approve the token first if requested, then confirm the deposit.
            </li>
            <li>
              <strong>Mint DSC.</strong> Review the amount and estimated health factor before
              confirming.
            </li>
            <li>
              <strong>Burn or redeem.</strong> Burn DSC to repay debt. Redeem collateral while
              keeping the remaining position within the contract’s health requirement.
            </li>
          </ol>
          <Link href="/dashboard" className="text-link">
            Open your workspace →
          </Link>
        </section>
        <section id="health">
          <h2>Position health and mint capacity</h2>
          <p>
            The deployed engine uses a 50% liquidation threshold and a minimum health factor of 1.0.
            This requires approximately 200% collateralization at the oracle-reported value.
          </p>
          <div className="formula">Health factor = (collateral USD value × 50%) ÷ DSC debt</div>
          <p>
            Below 1.0, a position is eligible for liquidation. At or above 1.0, it meets the
            contract minimum. Positions without outstanding debt display “No debt.”
          </p>
          <div className="formula">
            Remaining mint capacity = (collateral USD value × 50%) − existing DSC debt
          </div>
          <p>
            For $1,000 of collateral and 100 DSC debt, the remaining capacity is 400 DSC. Minting
            the full amount gives a health factor of 1.0. Capacity includes no extra safety buffer;
            price changes can affect eligibility. Capacity displays zero if debt already exceeds the
            limit. The contract validates the final transaction.
          </p>
        </section>
        <section id="transactions">
          <h2>Transactions and liquidation</h2>
          <p>
            Review your transaction before signing. Token approval and the protocol action may
            require separate confirmations. Success appears only after a successful on-chain
            receipt, and balances refresh automatically.
          </p>
          <p>
            Use the transaction’s explorer link to check pending or timed-out transactions before
            retrying. A confirmed transaction does not need to be resent if a balance refresh fails.
          </p>
          <p>
            Look up any account in the explorer without connecting a wallet. To liquidate an
            eligible position, connect a wallet with DSC and test ETH for fees. The engine applies a
            10% collateral bonus to the debt covered, subject to its liquidation checks.
          </p>
        </section>
        <section id="about">
          <h2>About DSC</h2>
          <p>{testnetDisclaimer}</p>
          <a
            href={explorerAddress(engineAddress)}
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            Inspect the Sepolia engine ↗
          </a>
          <code className="contract-address">{engineAddress}</code>
          <p>
            The educational Solidity foundation comes from{' '}
            <a className="text-link" href={educationalSourceUrl} target="_blank" rel="noreferrer">
              Patrick Collins / Cyfrin’s Foundry DeFi Stablecoin course
            </a>
            . Shiva Sai built the frontend, contract integration and Sepolia deployment.
          </p>
        </section>
      </article>
    </div>
  );
}
