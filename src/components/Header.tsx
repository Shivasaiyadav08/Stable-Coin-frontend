'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import GitHubLink from './GitHubLink';
import BrandMark from './BrandMark';
import NetworkStatus from './NetworkStatus';
import WalletButton from './WalletButton';

const links = [
  { href: '/', label: 'Overview' },
  { href: '/dashboard', label: 'Terminal' },
  { href: '/explore', label: 'Explorer' },
  { href: '/docs', label: 'Guide' },
];

export default function Header() {
  const path = usePathname();
  return (
    <header className="site-header">
      <div className="header-inner container">
        <Link href="/" className="brand" aria-label="DSC Protocol home">
          <BrandMark className="brand-mark" />
          <span>
            DSC<span className="brand-secondary"> Protocol</span>
            <span className="brand-edition">/ TESTNET</span>
          </span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={path === link.href ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <NetworkStatus />
          <div className="wallet-controls">
            <WalletButton />
            <GitHubLink />
          </div>
        </div>
      </div>
    </header>
  );
}
