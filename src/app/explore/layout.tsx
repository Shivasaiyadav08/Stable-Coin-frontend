import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: 'Account explorer' };

export default function ExplorerLayout({ children }: { children: ReactNode }) {
  return children;
}
