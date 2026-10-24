'use client';

import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useConfig } from 'wagmi';
import { explorerTransaction } from '@/lib/contracts';
import { errorMessage } from '@/lib/errors';
import {
  sendTransaction,
  type TransactionProgress,
  type TransactionRequest,
} from '@/lib/transactions';
import { Feedback } from './ui/Feedback';

type TransactionState = TransactionProgress & { label: string; refreshWarning?: boolean };
type TransactionContextValue = {
  busy: boolean;
  run: (request: TransactionRequest) => Promise<boolean>;
};
const TransactionContext = createContext<TransactionContextValue | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const config = useConfig();
  const queries = useQueryClient();
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const [transaction, setTransaction] = useState<TransactionState | null>(null);

  async function refreshData() {
    await Promise.all([
      queries.invalidateQueries({ queryKey: ['position'] }, { throwOnError: true }),
      queries.invalidateQueries({ queryKey: ['protocol'] }, { throwOnError: true }),
    ]);
  }

  async function run(request: TransactionRequest): Promise<boolean> {
    if (locked.current) return false;
    locked.current = true;
    setBusy(true);
    setTransaction({
      label: request.label,
      stage: 'signature',
      message: 'Checking the transaction…',
    });
    try {
      await sendTransaction(config, request, (progress) => {
        setTransaction((previous) => (previous ? { ...previous, ...progress } : previous));
      });
      setTransaction((previous) =>
        previous
          ? {
              ...previous,
              stage: 'success',
              message: 'Confirmed on Sepolia. Updating account data…',
            }
          : previous,
      );
      try {
        await refreshData();
        setTransaction((previous) =>
          previous
            ? { ...previous, message: 'Confirmed on Sepolia. Account data has been refreshed.' }
            : previous,
        );
      } catch {
        setTransaction((previous) =>
          previous
            ? {
                ...previous,
                refreshWarning: true,
                message:
                  'The transaction is confirmed, but account data could not refresh. Retry the refresh; do not resubmit the transaction.',
              }
            : previous,
        );
      }
      return true;
    } catch (error) {
      setTransaction((previous) => ({
        ...previous,
        label: request.label,
        stage: 'error',
        message: errorMessage(error),
      }));
      return false;
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  const tone =
    transaction?.stage === 'error'
      ? 'error'
      : transaction?.refreshWarning
        ? 'warning'
        : transaction?.stage === 'success'
          ? 'success'
          : 'info';
  return (
    <TransactionContext.Provider value={{ busy, run }}>
      {children}
      {transaction ? (
        <aside className="transaction-notice" aria-label="Transaction progress">
          <Feedback
            tone={tone}
            title={`${transaction.label} · ${transaction.stage === 'success' ? 'Confirmed' : transaction.stage === 'error' ? 'Needs attention' : 'In progress'}`}
          >
            <ol className="transaction-steps" aria-label="Transaction stages">
              {transaction.approvalHash || transaction.stage === 'approval' ? (
                <li className={transaction.stage === 'approval' ? 'step-current' : undefined}>
                  <span />
                  TOKEN APPROVAL
                </li>
              ) : null}
              <li className={transaction.stage === 'signature' ? 'step-current' : undefined}>
                <span />
                WALLET SIGNATURE
              </li>
              <li
                className={
                  transaction.stage === 'pending' || transaction.stage === 'success'
                    ? 'step-current'
                    : undefined
                }
              >
                <span />
                ON-CHAIN RECEIPT
              </li>
            </ol>
            <p>{transaction.message}</p>
            <div className="inline-actions">
              {transaction.approvalHash ? (
                <a
                  href={explorerTransaction(transaction.approvalHash)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View approval ↗
                </a>
              ) : null}
              {transaction.hash ? (
                <a href={explorerTransaction(transaction.hash)} target="_blank" rel="noreferrer">
                  View transaction ↗
                </a>
              ) : null}
              {transaction.refreshWarning ? (
                <button
                  className="text-button"
                  onClick={async () => {
                    try {
                      await refreshData();
                      setTransaction((previous) =>
                        previous
                          ? {
                              ...previous,
                              refreshWarning: false,
                              message: 'Confirmed on Sepolia. Account data has been refreshed.',
                            }
                          : previous,
                      );
                    } catch {
                      /* Keep the visible warning until a refresh succeeds. */
                    }
                  }}
                >
                  Refresh data
                </button>
              ) : null}
              {!busy ? (
                <button className="text-button" onClick={() => setTransaction(null)}>
                  Dismiss
                </button>
              ) : null}
            </div>
          </Feedback>
        </aside>
      ) : null}
    </TransactionContext.Provider>
  );
}

export function useTransaction() {
  const context = useContext(TransactionContext);
  if (!context) throw new Error('useTransaction must be used inside TransactionProvider');
  return context;
}
