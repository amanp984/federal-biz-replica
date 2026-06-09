import { createServerFn } from "@tanstack/react-start";

export interface BankTxnDTO {
  id: string;
  transaction_date: string;
  transaction_type: string;
  payment_mode: string;
  account_holder_name: string;
  utr_number: string;
  beneficiary_account_last_digits: string | null;
  amount: number;
}

export const listBankTransactions = createServerFn({ method: "GET" }).handler(
  async (): Promise<BankTxnDTO[]> => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data, error } = await supabaseAdmin
      .from("bank_transactions")
      .select(
        "id, transaction_date, transaction_type, payment_mode, account_holder_name, utr_number, beneficiary_account_last_digits, amount",
      )
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as BankTxnDTO[];
  },
);