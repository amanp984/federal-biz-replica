import { formatDDMMYYYY } from "@/lib/format-date";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/lib/auth-store";
import { formatINR } from "@/lib/transactions-store";
import { useBankTransactions } from "@/lib/use-bank-transactions";

export const Route = createFileRoute("/_app/accounts")({
  head: () => ({ meta: [{ title: "Accounts — FED BUSINESS" }] }),
  component: Accounts,
});

function Accounts() {
  const { user } = useAuth();
  const { balance: bal, transactions } = useBankTransactions();
  if (!user) return null;
  return (
    <div className="space-y-5">
      <PageHeader title="My Accounts" subtitle="All accounts linked to your customer ID" />
      <Link to="/account-details" className="block bg-white border rounded-md shadow-sm hover:shadow-md hover:border-fed-blue transition overflow-hidden">
        <div className="bg-fed-blue text-white px-5 py-3 flex items-center justify-between border-b-4 border-fed-orange">
          <div>
            <div className="text-xs uppercase opacity-80">{user.accountType} Account</div>
            <div className="text-lg font-bold tracking-wider">{user.accountNumber}</div>
          </div>
          <span className="text-xs bg-emerald-500/90 px-2 py-1 rounded">Active</span>
        </div>
        <div className="p-5 grid sm:grid-cols-3 gap-4 text-sm">
          <div><div className="text-muted-foreground text-xs">IFSC</div><div className="font-semibold">{user.ifsc}</div></div>
          <div><div className="text-muted-foreground text-xs">Office</div><div className="font-semibold">{user.branch}</div></div>
          <div className="sm:text-right"><div className="text-muted-foreground text-xs">Available Balance</div><div className="font-bold text-fed-green-dark text-lg">{formatINR(bal)}</div></div>
        </div>
      </Link>

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
              {transactions.slice(0, 5).map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-3">{formatDDMMYYYY(t.date)}</td>
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