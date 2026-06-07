import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/lib/auth-store";
import { useTransactions } from "@/lib/transactions-store";
import { downloadStatementPDF } from "@/lib/pdf";

export const Route = createFileRoute("/_app/statements")({
  head: () => ({ meta: [{ title: "Statements — FED BUSINESS" }] }),
  component: Statements,
});
function Statements() {
  const { user } = useAuth();
  const { transactions } = useTransactions();
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
    </div>
  );
}