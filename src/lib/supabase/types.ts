import type { Transaction } from "@/lib/transactions-store";

/** Database row shape for incoming SMS-parsed transactions. */
export interface TransactionRow {
  id: string;
  user_id: string;
  account_number: string;
  utr: string | null;
  reference_number: string | null;
  transaction_id: string | null;
  amount: number;
  type: "credit" | "debit";
  sender_name: string | null;
  receiver_name: string | null;
  upi_id: string | null;
  imps_reference: string | null;
  transaction_date: string; // ISO date
  transaction_time: string; // HH:mm:ss
  status: "success" | "pending" | "failed" | "reversed";
  description: string | null;
  available_balance: number | null;
  created_at: string;
}

export function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    date: `${row.transaction_date}T${row.transaction_time}`,
    description: row.description ?? "",
    reference: row.reference_number ?? row.utr ?? row.transaction_id ?? row.id,
    debit: row.type === "debit" ? row.amount : 0,
    credit: row.type === "credit" ? row.amount : 0,
    utr: row.utr ?? undefined,
    referenceNumber: row.reference_number ?? undefined,
    transactionId: row.transaction_id ?? undefined,
    amount: row.amount,
    type: row.type,
    senderName: row.sender_name ?? undefined,
    receiverName: row.receiver_name ?? undefined,
    upiId: row.upi_id ?? undefined,
    impsReference: row.imps_reference ?? undefined,
    transactionDate: row.transaction_date,
    transactionTime: row.transaction_time,
    status: row.status,
    availableBalance: row.available_balance ?? undefined,
    source: "supabase",
  };
}