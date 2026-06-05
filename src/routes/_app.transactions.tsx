import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, FileText, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { formatINR, useTransactions, withRunningBalance } from "@/lib/transactions-store";
import { downloadCSV, downloadStatementPDF } from "@/lib/pdf";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/_app/transactions")({
  head: () => ({ meta: [{ title: "Transactions — FED BIZ" }] }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const { transactions } = useTransactions();
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const all = useMemo(() => withRunningBalance(transactions), [transactions]);
  const filtered = useMemo(() => {
    return all.filter((t) => {
      const ok1 = !q || `${t.description} ${t.reference}`.toLowerCase().includes(q.toLowerCase());
      const ok2 = !from || new Date(t.date) >= new Date(from);
      const ok3 = !to || new Date(t.date) <= new Date(to + "T23:59:59");
      return ok1 && ok2 && ok3;
    });
  }, [all, q, from, to]);
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  const exportCSV = () => {
    downloadCSV(`FedBiz_Transactions.csv`, [
      ["Date","Description","Reference","Debit","Credit","Balance"],
      ...filtered.map((t) => [
        new Date(t.date).toLocaleDateString("en-IN"),
        t.description, t.reference, t.debit || "", t.credit || "", t.balance,
      ]),
    ]);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Transactions"
        right={
          <div className="flex gap-2">
            <button onClick={exportCSV} className="bg-white border text-fed-blue text-sm px-3 py-2 rounded flex items-center gap-1 hover:bg-fed-sidebar-hover">
              <Download size={14}/> CSV
            </button>
            <button onClick={() => user && downloadStatementPDF(user, transactions)} className="bg-fed-blue hover:bg-fed-blue-dark text-white text-sm px-3 py-2 rounded flex items-center gap-1">
              <FileText size={14}/> PDF
            </button>
          </div>
        }
      />

      <div className="bg-white border rounded-md p-4 grid md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search description or reference" className="w-full pl-9 pr-3 py-2 border rounded text-sm"/>
        </div>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded px-3 py-2 text-sm"/>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border rounded px-3 py-2 text-sm"/>
      </div>

      <div className="bg-white border rounded-md shadow-sm overflow-hidden">
        <div className="bg-fed-orange text-white px-4 py-2.5 font-semibold">Transaction History</div>
        {slice.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">No Recent Transactions Available</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Description</th>
                  <th className="text-left p-3">Reference</th>
                  <th className="text-right p-3">Debit</th>
                  <th className="text-right p-3">Credit</th>
                  <th className="text-right p-3">Balance</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((t) => (
                  <tr key={t.id} className="border-t hover:bg-secondary/50">
                    <td className="p-3 whitespace-nowrap">{new Date(t.date).toLocaleDateString("en-IN")}</td>
                    <td className="p-3">{t.description}</td>
                    <td className="p-3 text-xs text-muted-foreground">{t.reference}</td>
                    <td className="p-3 text-right text-destructive">{t.debit ? formatINR(t.debit) : "—"}</td>
                    <td className="p-3 text-right text-emerald-700">{t.credit ? formatINR(t.credit) : "—"}</td>
                    <td className="p-3 text-right font-semibold">{formatINR(t.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > perPage && (
          <div className="flex items-center justify-between p-3 border-t text-sm">
            <span className="text-muted-foreground">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button disabled={page<=1} onClick={() => setPage(p=>p-1)} className="px-3 py-1 border rounded disabled:opacity-40">Prev</button>
              <button disabled={page>=pages} onClick={() => setPage(p=>p+1)} className="px-3 py-1 border rounded disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}