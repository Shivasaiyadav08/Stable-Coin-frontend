// app/layout.tsx
"use client";
import './globals.css';
import Providers from './providers';
import Header from '@/components/Header';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>DSC Protocol - Decentralized Stable Coin</title>
        <meta name="description" content="Advanced decentralized stable coin protocol with liquidation mechanisms" />
      </head>
      <body className="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 min-h-screen flex flex-col scroll-smooth">
        <Providers>
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}