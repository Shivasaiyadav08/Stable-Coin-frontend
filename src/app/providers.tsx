'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { darkTheme, getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { TransactionProvider } from '@/components/TransactionProvider';
import { chain } from '@/lib/contracts';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim();
const transports = { [chain.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || undefined) };
// Keep individual reads: the public Sepolia RPC rejects large automatic multicalls.
const connection = { chains: [chain] as const, transports, batch: { multicall: false }, ssr: true };
const config = projectId
  ? getDefaultConfig({ appName: 'DSC Protocol', projectId, ...connection })
  : createConfig({ ...connection, connectors: [injected()] });

const walletTheme = darkTheme({
  accentColor: '#765BFA',
  accentColorForeground: '#F2F5FC',
  borderRadius: 'medium',
  fontStack: 'system',
});
walletTheme.colors.modalBackground = '#111A2B';
walletTheme.colors.modalText = '#F2F5FC';
walletTheme.colors.modalTextSecondary = '#94A3B8';
walletTheme.fonts.body = 'var(--font-geist-sans), Arial, sans-serif';

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1 } } }),
  );
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={walletTheme}>
          <TransactionProvider>{children}</TransactionProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
