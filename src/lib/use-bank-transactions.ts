import { useEffect, useMemo, useState } from "react";
import {
  listBankTransactions,
  type BankTxnDTO,
} from "@/lib/bank-transactions.functions";
import type { Transaction } from "@/lib/transactions-store";

/** Build a realistic bank-style transaction description from a row. */
export function buildDescription(r: BankTxnDTO): string {
  const mode = r.payment_mode;
  const name = (r.account_holder_name || "UNKNOWN").toUpperCase();
  const utr = r.utr_number;
  const last4 = r.beneficiary_account_last_digits;
  // DEBIT for IMPS/NEFT/RTGS includes beneficiary last 4 digits
  if (
    r.transaction_type === "DEBIT" &&
    mode !== "UPI" &&
    last4
  ) {
    return `DEBIT/${mode}/${name} XX${last4}/UTR ${utr}`;
  }
  return `${r.transaction_type}/${mode}/${name}/UTR ${utr}`;
}

/** Deterministic internal txn id derived from row id — bank-style alphanumeric. */
export function internalTxnId(id: string): string {
  const hex = id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `TXN${hex.slice(0, 22).padEnd(22, "0")}`;
}

export interface UseBankTransactionsResult {
  rows: BankTxnDTO[];
  transactions: Transaction[];
  balance: number;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Single source of truth for transaction data across the app.
 * Polls every 15s and maps rows to the shared Transaction shape with
 * realistic descriptions and an internal txn id.
 */
export function useBankTransactions(): UseBankTransactionsResult {
  const [rows, setRows] = useState<BankTxnDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const d = await listBankTransactions();
        if (!active) return;
        setRows((d ?? []) as BankTxnDTO[]);
        setError(null);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load transactions");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const i = setInterval(load, 15000);
    return () => {
      active = false;
      clearInterval(i);
    };
  }, [tick]);

  const balance = useMemo(
    () =>
      rows.reduce(
        (b, r) =>
          b +
          (r.transaction_type === "CREDIT"
            ? Number(r.amount)
            : -Number(r.amount)),
        0,
      ),
    [rows],
  );

  const transactions = useMemo<Transaction[]>(
    () =>
      rows.map((r) => ({
        id: r.id,
        // Use created_at as the true chronological timestamp so intra-day
        // ordering and running-balance accumulation match real arrival order.
        date: r.created_at || r.transaction_date,
        description: buildDescription(r),
        reference: r.utr_number,
        transactionId: internalTxnId(r.id),
        debit: r.transaction_type === "DEBIT" ? Number(r.amount) : 0,
        credit: r.transaction_type === "CREDIT" ? Number(r.amount) : 0,
      })),
    [rows],
  );

  return {
    rows,
    transactions,
    balance,
    loading,
    error,
    reload: () => setTick((n) => n + 1),
  };
}