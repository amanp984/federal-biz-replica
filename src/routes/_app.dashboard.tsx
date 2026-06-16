import { formatDDMMYYYY } from "@/lib/format-date";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, EyeOff, Download, ChevronRight, ChevronLeft, ArrowLeftRight, Receipt, Smartphone, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/lib/auth-store";
import { formatINR, withRunningBalance } from "@/lib/transactions-store";
import { downloadStatementPDF } from "@/lib/pdf";
import { useBankTransactions } from "@/lib/use-bank-transactions";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — FED BUSINESS" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { transactions, balance } = useBankTransactions();
  const [showBal, setShowBal] = useState(true);
  const recent = useMemo(
    () => withRunningBalance(transactions).slice(0, 5),
    [transactions],
  );

  if (!user) return null;

  return (
    <div className="space-y-5">
      <PageHeader title={`Welcome, ${user.customerName.split(" ")[0]}`} subtitle="Account Overview" />

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Account card carousel-ish */}
        <div className="lg:col-span-2 bg-fed-blue text-white rounded-md p-5 relative shadow border-b-4 border-fed-orange">
          <button className="absolute left-2 top-1/2 -translate-y-1/2 p-1 opacity-70 hover:opacity-100"><ChevronLeft /></button>
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-70 hover:opacity-100"><ChevronRight /></button>
          <div className="text-center">
            <div className="text-fed-orange font-semibold tracking-wide uppercase text-sm">{user.customerName}</div>
            <div className="text-3xl md:text-4xl font-bold tracking-wide mt-1">{user.accountNumber}</div>
            <div className="text-xs uppercase opacity-90 mt-1">{user.accountType}</div>
            <div className="mt-3 inline-flex items-center gap-3 bg-white/10 rounded px-3 py-1 text-xs">
              <span>IFSC: <b>{user.ifsc}</b></span>
              <span>•</span>
              <span>Status: <b className="text-emerald-300">Active</b></span>
            </div>
          </div>
        </div>

        <div className="bg-fed-green text-white rounded-md p-5 shadow border-b-4 border-fed-green-dark relative">
          <div className="text-center text-sm font-semibold uppercase tracking-wide opacity-95">Account Balance</div>
          <div className="text-center text-3xl font-bold mt-3">
            {showBal ? formatINR(balance) : "₹ ••••••"}
          </div>
          <button
            onClick={() => setShowBal((v) => !v)}
            className="absolute top-3 right-3 text-white/90 hover:text-white"
            title={showBal ? "Hide balance" : "Show balance"}
          >
            {showBal ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <div className="flex gap-2 justify-center mt-4">
            <Link to="/account-details" className="bg-white/15 hover:bg-white/25 text-xs px-3 py-1.5 rounded">View Details</Link>
            <button
              onClick={() => user && downloadStatementPDF(user, transactions)}
              className="bg-white text-fed-green-dark font-semibold text-xs px-3 py-1.5 rounded flex items-center gap-1"
            >
              <Download size={14} /> Statement
            </button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickAction to="/fund-transfer" icon={ArrowLeftRight} label="Fund Transfer" />
        <QuickAction to="/pay-bills" icon={Receipt} label="Pay Bills" />
        <QuickAction to="/mobile-recharge" icon={Smartphone} label="Recharge" />
        <QuickAction to="/cards" icon={CreditCard} label="Manage Cards" />
      </div>

      {/* Recent transactions */}
      <div className="bg-white border rounded-md shadow-sm overflow-hidden">
        <div className="bg-fed-orange text-white px-4 py-2.5 font-semibold flex items-center justify-between">
          <span>Recent Transactions</span>
          <Link to="/transactions" className="text-xs hover:underline">View All →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">
            No Recent Transactions Available
          </div>
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
                <tr key={t.id} className="border-t hover:bg-secondary/50">
                  <td className="p-3">{formatDDMMYYYY(t.date)}</td>
                  <td className="p-3">
                    <div>{t.description}</div>
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{t.transactionId}</div>
                  </td>
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

function QuickAction({ to, icon: Icon, label }: { to: string; icon: React.ComponentType<{ size?: number }>; label: string }) {
  return (
    <Link
      to={to}
      className="bg-white border rounded-md p-4 flex flex-col items-center justify-center gap-2 hover:border-fed-blue hover:shadow-md transition group"
    >
      <div className="w-11 h-11 rounded-full bg-fed-blue/10 text-fed-blue grid place-items-center group-hover:bg-fed-blue group-hover:text-white transition">
        <Icon size={20} />
      </div>
      <span className="text-xs font-semibold text-center uppercase tracking-wide">{label}</span>
    </Link>
  );
}