'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, mounted, openAccountModal, openChainModal, openConnectModal }) => {
        if (!mounted)
          return (
            <button className="button button-primary wallet-button" disabled>
              Connect wallet
            </button>
          );
        if (!account)
          return (
            <button className="button button-primary wallet-button" onClick={openConnectModal}>
              Connect wallet <span aria-hidden="true">↗</span>
            </button>
          );
        if (chain?.unsupported)
          return (
            <button className="button button-danger" onClick={openChainModal}>
              Switch network
            </button>
          );
        return (
          <button className="button button-secondary wallet-button" onClick={openAccountModal}>
            <span className="status-dot" />
            <span className="wallet-address">{account.displayName}</span>
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
