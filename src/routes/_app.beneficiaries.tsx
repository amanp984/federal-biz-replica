import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Users } from "lucide-react";

export const Route = createFileRoute("/_app/beneficiaries")({
  head: () => ({ meta: [{ title: "Beneficiaries — FED BIZ" }] }),
  component: Beneficiaries,
});

const BENS = [
  { name: "Rahul Sharma", bank: "HDFC Bank", upi: "rahul@okhdfc", added: "2025-04-12" },
  { name: "Sneha Verma", bank: "Federal Bank", upi: "sneha@fed", added: "2025-05-02" },
  { name: "Pooja Singh", bank: "ICICI Bank", upi: "pooja@okicici", added: "2025-05-30" },
];

function Beneficiaries() {
  return (
    <div className="space-y-5">
      <PageHeader title="Beneficiaries" subtitle="People you've added for transfers" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BENS.map((b) => (
          <div key={b.name} className="bg-white border rounded-md shadow-sm overflow-hidden hover:shadow-md transition">
            <div className="bg-fed-blue text-white p-4 border-b-4 border-fed-orange flex items-center gap-3">
              <div className="w-10 h-10 grid place-items-center rounded-full bg-white/15"><Users size={18}/></div>
              <div>
                <div className="font-bold">{b.name}</div>
                <div className="text-xs opacity-85">{b.bank}</div>
              </div>
            </div>
            <div className="p-4 text-sm space-y-1">
              <div><span className="text-muted-foreground">UPI:</span> <b>{b.upi}</b></div>
              <div><span className="text-muted-foreground">Status:</span> <span className="text-emerald-700 font-semibold">Active</span></div>
              <div><span className="text-muted-foreground">Added:</span> {b.added}</div>
            </div>
            <div className="grid grid-cols-2 border-t">
              <button className="py-2 text-sm hover:bg-secondary">View</button>
              <Link to="/fund-transfer" className="py-2 text-sm bg-fed-blue text-white hover:bg-fed-blue-dark text-center">Transfer</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}