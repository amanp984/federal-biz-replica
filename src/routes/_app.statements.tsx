import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/lib/auth-store";
import { formatINR } from "@/lib/transactions-store";
import { downloadStatementPDF } from "@/lib/pdf";
import { useBankTransactions } from "@/lib/use-bank-transactions";

export const Route = createFileRoute("/_app/statements")({
  head: () => ({ meta: [{ title: "Statements — FED BUSINESS" }] }),
  component: Statements,
});
function Statements() {
  const { user } = useAuth();
  const { transactions } = useBankTransactions();
  if (!user) return null;
  return (
    <div className="space-y-5">
      <PageHeader title="Account Statements" subtitle="Download your statement in PDF format" />
      <div className="bg-white border rounded-md p-6 grid sm:grid-cols-2 gap-4">
        {["Current Month", "Last Month", "Last 3 Months", "Last 6 Months"].map((label) => (
          <button key={label} onClick={() => downloadStatementPDF(user, transactions)} className="border rounded-md p-5 text-left hover:border-fed-blue hover:shadow-md flex items-center justify-between">
            <div>
              <div className="font-semibold text-fed-blue">{label}</div>
              <div className="text-xs text-muted-foreground">PDF Statement</div>
            </div>
            <Download className="text-fed-blue" />
          </button>
        ))}
      </div>

      <div className="bg-white border rounded-md shadow-sm overflow-hidden">
        <div className="bg-fed-orange text-white px-4 py-2.5 font-semibold flex items-center justify-between">
          <span>Recent Transactions</span>
          <Link to="/transactions" className="text-xs hover:underline">View All →</Link>
        </div>
        {transactions.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">No Recent Transactions Available</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Description</th>
                <th className="text-right p-3">Debit</th>
                <th className="text-right p-3">Credit</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 8).map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-3">{new Date(t.date).toLocaleDateString("en-IN")}</td>
                  <td className="p-3">
                    <div>{t.description}</div>
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{t.transactionId}</div>
                  </td>
                  <td className="p-3 text-right text-destructive">{t.debit ? formatINR(t.debit) : "—"}</td>
                  <td className="p-3 text-right text-emerald-700">{t.credit ? formatINR(t.credit) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}