import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/lib/auth-store";
import { computeBalance, formatINR, useTransactions, withRunningBalance } from "@/lib/transactions-store";
import { downloadStatementPDF } from "@/lib/pdf";
import { FEDERAL_LOGO_FULL } from "@/lib/logos";

export const Route = createFileRoute("/_app/account-details")({
  head: () => ({ meta: [{ title: "Account Details — FED BUSINESS" }] }),
  component: AccountDetails,
});

function AccountDetails() {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const balance = useMemo(() => computeBalance(transactions), [transactions]);
  const recent = useMemo(() => withRunningBalance(transactions).slice(0, 10), [transactions]);
  if (!user) return null;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Account Details"
        right={
          <button
            onClick={() => downloadStatementPDF(user, transactions)}
            className="bg-fed-blue hover:bg-fed-blue-dark text-white text-sm px-4 py-2 rounded flex items-center gap-2"
          >
            <Download size={16} /> Download Statement
          </button>
        }
      />
      <div className="bg-white border rounded-md shadow-sm overflow-hidden">
        <div className="p-5 flex items-center gap-4 border-b">
          <img src={FEDERAL_LOGO_FULL} alt="" className="w-14 h-14" />
          <div>
            <div className="font-bold text-fed-blue">{user.customerName}</div>
            <div className="text-xs text-muted-foreground">{user.customerId} · {user.accountType}</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs text-muted-foreground">Available Balance</div>
            <div className="text-2xl font-bold text-fed-green-dark">{formatINR(balance)}</div>
          </div>
        </div>
        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 p-5 text-sm">
          <Row k="Customer ID" v={user.customerId} />
          <Row k="CIF" v={user.cif} />
          <Row k="Account Number" v={user.accountNumber} />
          <Row k="IFSC" v={user.ifsc} />
          <Row k="Office" v={user.branch} />
          <Row k="Account Type" v={user.accountType} />
        </dl>
      </div>

      <div className="bg-white border rounded-md shadow-sm overflow-hidden">
        <div className="bg-fed-orange text-white px-4 py-2.5 font-semibold">Recent Transactions</div>
        {recent.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">No Recent Transactions Available</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Description</th>
                <th className="text-right p-3">Debit</th>
                <th className="text-right p-3">Credit</th>
                <th className="text-right p-3">Balance</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-3">{new Date(t.date).toLocaleDateString("en-IN")}</td>
                  <td className="p-3">{t.description}</td>
                  <td className="p-3 text-right text-destructive">{t.debit ? formatINR(t.debit) : "—"}</td>
                  <td className="p-3 text-right text-emerald-700">{t.credit ? formatINR(t.credit) : "—"}</td>
                  <td className="p-3 text-right font-semibold">{formatINR(t.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  );
}