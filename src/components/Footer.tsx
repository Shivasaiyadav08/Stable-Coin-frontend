import Link from 'next/link';
import BrandMark from './BrandMark';
import {
  repositoryUrl,
  contractsRepositoryUrl,
  educationalSourceUrl,
  engineAddress,
  dscAddress,
  explorerAddress,
  testnetDisclaimer,
} from '@/lib/contracts';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Link href="/" className="brand">
            <BrandMark className="brand-mark" />
            <span>DSC Protocol</span>
          </Link>
          <p>An open-source exploration of collateral, liquidity, and financial equilibrium.</p>
          <span className="footer-network">
            <span className="status-dot" /> Deployed on Sepolia Testnet
          </span>
        </div>
        <nav aria-label="Product links">
          <span className="eyebrow">EXPLORE</span>
          <Link href="/dashboard">Position terminal</Link>
          <Link href="/explore">Account explorer</Link>
          <Link href="/docs">Protocol guide</Link>
        </nav>
        <nav aria-label="Contract links">
          <span className="eyebrow">VERIFY</span>
          <a href={explorerAddress(engineAddress)} target="_blank" rel="noreferrer">
            DSC Engine ↗
          </a>
          <a href={explorerAddress(dscAddress)} target="_blank" rel="noreferrer">
            DSC token ↗
          </a>
          <a href={contractsRepositoryUrl} target="_blank" rel="noreferrer">
            Smart contracts ↗
          </a>
        </nav>
        <nav aria-label="Contribution links">
          <span className="eyebrow">BUILD</span>
          <a href={repositoryUrl} target="_blank" rel="noreferrer">
            Frontend source ↗
          </a>
          <a href={`${repositoryUrl}/issues`} target="_blank" rel="noreferrer">
            Report an issue ↗
          </a>
          <a href={educationalSourceUrl} target="_blank" rel="noreferrer">
            Cyfrin course project ↗
          </a>
        </nav>
      </div>
      <div className="container footer-attribution">
        <p>
          Solidity foundation:{' '}
          <a href={educationalSourceUrl} target="_blank" rel="noreferrer">
            Patrick Collins / Cyfrin
          </a>
          . Frontend and Sepolia integration:{' '}
          <a href={repositoryUrl} target="_blank" rel="noreferrer">
            Shiva Sai
          </a>
          .
        </p>
        <span>EDUCATIONAL / OPEN SOURCE</span>
      </div>
      <div className="container footer-bottom">
        <p>{testnetDisclaimer}</p>
        <span>ETHEREUM SEPOLIA · 11155111</span>
      </div>
    </footer>
  );
}
