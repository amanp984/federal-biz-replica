/**
 * Transactions abstraction. Currently backed by local zustand store; will be
 * swapped to Supabase + realtime listeners once credentials are provided.
 */
import { useTransactions, type Transaction } from "@/lib/transactions-store";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { SupabaseRealtimeUnsubscribe } from "@/lib/supabase/client";

export const transactionsService = {
  list(): Transaction[] {
    return useTransactions.getState().transactions;
  },
  add(t: Omit<Transaction, "id">) {
    useTransactions.getState().add(t);
  },
  /**
   * Subscribe to realtime inserts. Returns an unsubscribe function.
   * No-op until Supabase is wired in.
   */
  subscribe(_onInsert: (t: Transaction) => void): SupabaseRealtimeUnsubscribe {
    if (!isSupabaseConfigured) return () => {};
    // TODO: supabase.channel('public:transactions').on('postgres_changes', ...)
    return () => {};
  },
};