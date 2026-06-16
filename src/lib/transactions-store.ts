import { create } from "zustand";

export type TransactionStatus = "success" | "pending" | "failed" | "reversed";

/**
 * Forward-compatible transaction shape. Optional fields will be populated
 * once realtime ingestion (e.g. SMS-forwarded data via Supabase) is wired in.
 */
export interface Transaction {
  id: string;
  date: string; // ISO datetime
  description: string;
  reference: string;
  debit: number;
  credit: number;
  // --- Optional fields for future realtime SMS / Supabase ingestion ---
  utr?: string;
  referenceNumber?: string;
  transactionId?: string;
  amount?: number;
  type?: "credit" | "debit";
  senderName?: string;
  receiverName?: string;
  upiId?: string;
  impsReference?: string;
  transactionDate?: string; // ISO date
  transactionTime?: string; // HH:mm:ss
  status?: TransactionStatus;
  availableBalance?: number;
  source?: "manual" | "sms" | "api" | "supabase";
}

interface TxState {
  transactions: Transaction[];
  add: (t: Omit<Transaction, "id">) => void;
}

export const useTransactions = create<TxState>((set) => ({
  transactions: [],
  add: (t) =>
    set((s) => ({
      transactions: [
        { ...t, id: `TXN${Date.now()}${Math.floor(Math.random() * 999)}` },
        ...s.transactions,
      ],
    })),
}));

export function computeBalance(txs: Transaction[]) {
  return txs.reduce((bal, t) => bal + (t.credit || 0) - (t.debit || 0), 0);
}

/**
 * Centralized newest-first comparator used by EVERY consumer
 * (dashboard, statements, transactions, account-details, PDF, CSV).
 * Primary: date DESC (date is created_at from the row).
 * Secondary: id DESC (stable tiebreak for identical timestamps).
 */
export function sortTransactionsNewestFirst<T extends { id: string; date: string }>(
  txs: T[],
): T[] {
  return [...txs].sort((a, b) => {
    const tb = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (tb !== 0) return tb;
    return b.id.localeCompare(a.id);
  });
}

/** Returns transactions with a running balance, oldest -> newest balance accumulation. */
export function withRunningBalance(txs: Transaction[]) {
  // Use the same comparator as everywhere else, then reverse for oldest-first
  // accumulation so the running balance matches display order exactly.
  const newestFirst = sortTransactionsNewestFirst(txs);
  const oldestFirst = [...newestFirst].reverse();
  let bal = 0;
  const withBal = oldestFirst.map((t) => {
    bal += (t.credit || 0) - (t.debit || 0);
    return { ...t, balance: bal };
  });
  return withBal.reverse();
}

export function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}