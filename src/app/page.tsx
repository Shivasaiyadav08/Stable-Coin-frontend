import Link from 'next/link';
import ProtocolFlow from '@/components/ProtocolFlow';
import ProtocolMechanics from '@/components/ProtocolMechanics';
import { CopyAddress } from '@/components/ui/CopyAddress';
import {
  engineAddress,
  dscAddress,
  explorerAddress,
  contractsRepositoryUrl,
  repositoryUrl,
  educationalSourceUrl,
} from '@/lib/contracts';

const journey = [
  {
    number: '01',
    title: 'Deposit collateral.',
    detail:
      'Choose a supported asset. Approve the exact amount, then deposit it into the DSC Engine.',
    label: 'BUILD YOUR FOUNDATION',
  },
  {
    number: '02',
    title: 'Mint your liquidity.',
    detail:
      'Mint DSC within your on-chain capacity. Review the health-factor impact before you sign.',
    label: 'PUT YOUR POSITION TO WORK',
  },
  {
    number: '03',
    title: 'Keep the balance.',
    detail:
      'Monitor collateral value, outstanding debt, and the distance to the liquidation boundary.',
    label: 'STAY IN CONTROL',
  },
  {
    number: '04',
    title: 'Repay. Redeem. Repeat.',
    detail:
      'Burn DSC to reduce debt. Redeem collateral when the remaining position meets the contract rules.',
    label: 'CLOSE THE LOOP',
  },
];

export default function HomePage() {
  return (
    <div className="landing">
      <section className="container hero">
        <div className="hero-topline">
          <span className="section-kicker">
            <span className="signal-square" /> INDEPENDENT COLLATERAL. TRANSPARENT RULES.
          </span>
          <span className="badge badge-accent">
            <span className="status-dot" /> Sepolia Testnet
          </span>
        </div>
        <div className="hero-composition">
          <div className="hero-copy">
            <p className="hero-overline">THE DSC PROTOCOL</p>
            <h1>
              Unlock liquidity.
              <br />
              <span>
                Stay in <em>control.</em>
              </span>
            </h1>
            <p className="hero-description">
              Deposit supported collateral, mint decentralized stablecoins and manage your position
              through transparent on-chain mechanics.
            </p>
            <div className="hero-actions flex flex-wrap gap-3">
              <Link href="/dashboard" className="button button-primary button-large">
                Launch app <span aria-hidden="true">↗</span>
              </Link>
              <a href="#mechanics" className="button button-secondary button-large">
                Explore the protocol <span aria-hidden="true">↓</span>
              </a>
            </div>
            <p className="hero-footnote">
              <span className="mini-lock" aria-hidden="true">
                ⌑
              </span>{' '}
              Your wallet. Your position. Every action on-chain.
            </p>
          </div>
          <ProtocolFlow />
        </div>
        <div className="hero-bottom">
          <a href="#how-it-works">
            <span aria-hidden="true">↓</span> FOLLOW THE MECHANISM
          </a>
          <span>
            ETHEREUM SEPOLIA <span className="muted">/ CHAIN 11155111</span>
          </span>
          <span>EDUCATIONAL · TEST ASSETS ONLY</span>
        </div>
      </section>
      <section className="model-strip" aria-label="Configured contract parameters">
        <div className="container model-strip-inner">
          <div className="model-strip-label">
            <span className="signal-square" />
            <span>
              THE DEPLOYED
              <br />
              MODEL
            </span>
          </div>
          <div>
            <strong>
              50<span>%</span>
            </strong>
            <span>Liquidation threshold</span>
          </div>
          <div>
            <strong>
              200<span>%</span>
            </strong>
            <span>Minimum collateralization*</span>
          </div>
          <div>
            <strong>1.0</strong>
            <span>Minimum health factor</span>
          </div>
          <div>
            <strong>
              10<span>%</span>
            </strong>
            <span>Liquidation bonus</span>
          </div>
        </div>
      </section>
      <section id="how-it-works" className="container section journey">
        <div className="section-intro" data-reveal>
          <div>
            <p className="section-kicker">01 / THE MECHANISM</p>
            <h2>
              Four moves.
              <br />
              One clear position.
            </h2>
          </div>
          <p>
            Collateral enters. Liquidity follows.
            <br />
            Understand the complete loop before making your first move.
          </p>
        </div>
        <div className="journey-list">
          {journey.map((step) => (
            <article className="journey-step" key={step.number} data-reveal>
              <span className="step-number">{step.number}</span>
              <div>
                <span className="eyebrow">{step.label}</span>
                <h3>{step.title}</h3>
              </div>
              <p>{step.detail}</p>
              <span className="step-arrow" aria-hidden="true">
                ↗
              </span>
            </article>
          ))}
        </div>
      </section>
      <section id="mechanics" className="section mechanics-section">
        <div className="container">
          <div className="section-intro" data-reveal>
            <div>
              <p className="section-kicker">02 / UNDERSTAND THE RISK</p>
              <h2>
                A balance you
                <br />
                can actually see.
              </h2>
            </div>
            <p>
              Health factor connects the value of your collateral to your DSC debt. At the
              configured minimum of 1.0, there is no room for a price drop.
            </p>
          </div>
          <ProtocolMechanics />
          <div className="mechanics-notes" data-reveal>
            <article>
              <span className="mechanic-symbol" aria-hidden="true">
                ↗
              </span>
              <h3>Prices come from feeds.</h3>
              <p>
                The engine values collateral through its configured oracle feeds. This interface
                reads the contract’s valuation instead of estimating a market price.
              </p>
            </article>
            <article>
              <span className="mechanic-symbol" aria-hidden="true">
                ⌁
              </span>
              <h3>Debt changes the equation.</h3>
              <p>
                *A 50% threshold implies approximately 200% minimum collateralization under this
                model. Borrowing at that boundary leaves no buffer.
              </p>
            </article>
            <article>
              <span className="mechanic-symbol" aria-hidden="true">
                ↳
              </span>
              <h3>Liquidation restores balance.</h3>
              <p>
                A position below minimum may be liquidated. The engine calculates a 10% collateral
                bonus on covered debt; execution remains subject to contract rules.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="container section transparency">
        <div className="transparency-copy" data-reveal>
          <p className="section-kicker">03 / NOTHING BEHIND THE CURTAIN</p>
          <h2>
            Open code.
            <br />
            On-chain accountability.
          </h2>
          <p>
            Inspect the deployment. Follow the transactions. Read the rules for yourself. This is a
            testnet learning environment, not a promise of production safety.
          </p>
          <div className="flex flex-wrap gap-5">
            <a href={contractsRepositoryUrl} className="text-link" target="_blank" rel="noreferrer">
              Smart contracts ↗
            </a>
            <a href={repositoryUrl} className="text-link" target="_blank" rel="noreferrer">
              Frontend source ↗
            </a>
          </div>
          <div className="attribution-note">
            <span className="eyebrow">BUILT ON AN EDUCATIONAL FOUNDATION</span>
            <p>
              Core Solidity implementation based on{' '}
              <a href={educationalSourceUrl} target="_blank" rel="noreferrer">
                Patrick Collins / Cyfrin
              </a>
              . Frontend experience and Sepolia integration by Shiva Sai.
            </p>
          </div>
        </div>
        <div className="contract-register" data-reveal>
          <div className="register-heading">
            <span className="eyebrow">DEPLOYMENT REGISTER</span>
            <span className="badge">
              <span className="status-dot" /> SEPOLIA
            </span>
          </div>
          {[
            {
              label: 'DSC ENGINE',
              address: engineAddress,
              detail: 'Collateral & position management',
            },
            {
              label: 'DSC TOKEN',
              address: dscAddress,
              detail: 'Decentralized Stable Coin · ERC-20',
            },
          ].map((contract) => (
            <div className="register-entry" key={contract.address}>
              <div>
                <span className="eyebrow">{contract.label}</span>
                <a
                  href={explorerAddress(contract.address)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`View ${contract.label} on Sepolia Etherscan`}
                >
                  ↗
                </a>
              </div>
              <p>{contract.detail}</p>
              <code>{contract.address}</code>
              <CopyAddress address={contract.address} label="Copy address" />
            </div>
          ))}
          <div className="register-footer">
            <span>NETWORK ID</span>
            <span>11155111</span>
          </div>
        </div>
      </section>
      <section className="container closing-cta" data-reveal>
        <div>
          <p className="section-kicker">YOUR NEXT MOVE</p>
          <h2>
            Explore the possibilities.
            <br />
            <span>Start with test assets.</span>
          </h2>
        </div>
        <div>
          <Link href="/dashboard" className="button button-primary button-large">
            Enter the terminal <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/docs" className="text-link">
            New to DSC? Start with the guide →
          </Link>
        </div>
      </section>
    </div>
  );
}
