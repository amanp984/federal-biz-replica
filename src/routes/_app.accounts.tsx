import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/lib/auth-store";
import { computeBalance, formatINR, useTransactions } from "@/lib/transactions-store";

export const Route = createFileRoute("/_app/accounts")({
  head: () => ({ meta: [{ title: "Accounts — FED BIZ" }] }),
  component: Accounts,
});

function Accounts() {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const bal = useMemo(() => computeBalance(transactions), [transactions]);
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
          <div><div className="text-muted-foreground text-xs">Branch</div><div className="font-semibold">{user.branch}</div></div>
          <div className="sm:text-right"><div className="text-muted-foreground text-xs">Available Balance</div><div className="font-bold text-fed-green-dark text-lg">{formatINR(bal)}</div></div>
        </div>
      </Link>
    </div>
  );
}