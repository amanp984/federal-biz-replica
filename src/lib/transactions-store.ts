import { create } from "zustand";

export interface Transaction {
  id: string;
  date: string; // ISO
  description: string;
  reference: string;
  debit: number;
  credit: number;
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

/** Returns transactions with a running balance, oldest -> newest balance accumulation. */
export function withRunningBalance(txs: Transaction[]) {
  const sorted = [...txs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  let bal = 0;
  const withBal = sorted.map((t) => {
    bal += (t.credit || 0) - (t.debit || 0);
    return { ...t, balance: bal };
  });
  // return newest-first for display
  return withBal.reverse();
}

export function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}