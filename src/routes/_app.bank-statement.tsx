import { formatDDMMYYYY } from "@/lib/format-date";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { formatINR } from "@/lib/transactions-store";
import { listBankTransactions } from "@/lib/bank-transactions.functions";

interface BankTxn {
  id: string;
  transaction_date: string;
  transaction_type: "CREDIT" | "DEBIT" | string;
  payment_mode: "UPI" | "IMPS" | string;
  account_holder_name: string;
  utr_number: string;
  beneficiary_account_last_digits: string | null;
  amount: number;
}

export const Route = createFileRoute("/_app/bank-statement")({
  head: () => ({ meta: [{ title: "Bank Statement — FED BUSINESS" }] }),
  component: BankStatement,
});

function BankStatement() {
  const [rows, setRows] = useState<BankTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await listBankTransactions();
        if (!active) return;
        setRows((data ?? []) as BankTxn[]);
        setError(null);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load transactions");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader title="Bank Statement" subtitle="Transactions from Lovable Cloud" />

      <div className="bg-white border rounded-md shadow-sm overflow-hidden">
        <div className="bg-fed-orange text-white px-4 py-2.5 font-semibold flex items-center justify-between">
          <span>Transaction History</span>
          <span className="text-xs opacity-90">{rows.length} entries</span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-muted-foreground text-sm">Loading transactions…</div>
        ) : error ? (
          <div className="p-10 text-center text-destructive text-sm">{error}</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">No transactions available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Mode</th>
                  <th className="text-left p-3">Account Holder</th>
                  <th className="text-left p-3">UTR Number</th>
                  <th className="text-left p-3">Beneficiary A/C</th>
                  <th className="text-right p-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => {
                  const isCredit = t.transaction_type === "CREDIT";
                  return (
                    <tr key={t.id} className="border-t hover:bg-secondary/50">
                      <td className="p-3 whitespace-nowrap">
                        {formatDDMMYYYY(t.transaction_date)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            isCredit
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {t.transaction_type}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-fed-blue/10 text-fed-blue text-xs font-semibold">
                          {t.payment_mode}
                        </span>
                      </td>
                      <td className="p-3">{t.account_holder_name}</td>
                      <td className="p-3 text-xs text-muted-foreground font-mono">{t.utr_number}</td>
                      <td className="p-3 font-mono text-xs">
                        {t.payment_mode === "IMPS" && t.beneficiary_account_last_digits
                          ? `XXXXXX${t.beneficiary_account_last_digits}`
                          : "—"}
                      </td>
                      <td
                        className={`p-3 text-right font-semibold ${
                          isCredit ? "text-emerald-700" : "text-destructive"
                        }`}
                      >
                        {isCredit ? "+" : "−"} {formatINR(Number(t.amount))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}