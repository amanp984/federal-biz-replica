import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { OtpStep } from "@/components/OtpStep";
import { RestrictionPopup } from "@/components/RestrictionPopup";

export const Route = createFileRoute("/_app/cards")({
  head: () => ({ meta: [{ title: "Cards — FED BIZ" }] }),
  component: Cards,
});

const CARDS = [
  { type: "Debit Card", num: "4567 56** **** 7821", expiry: "09/29", status: "Active" },
  { type: "Credit Card", num: "5512 22** **** 4419", expiry: "03/28", status: "Active" },
];
const REASONS = ["Lost Card", "Damaged Card", "Security Concern", "Temporary Block"];

function Cards() {
  const [blockIdx, setBlockIdx] = useState<number | null>(null);
  const [reason, setReason] = useState(REASONS[0]);
  const [otp, setOtp] = useState(false);
  const [limitPop, setLimitPop] = useState(false);
  const [successPop, setSuccessPop] = useState(false);
  const [statuses, setStatuses] = useState(CARDS.map((c) => c.status));

  return (
    <div className="space-y-5">
      <PageHeader title="Cards" subtitle="Manage debit & credit cards" />
      <div className="grid md:grid-cols-2 gap-4">
        {CARDS.map((c, i) => (
          <div key={c.num} className="rounded-md overflow-hidden shadow border bg-white">
            <div className="bg-gradient-to-br from-fed-blue to-fed-blue-dark text-white p-5">
              <div className="flex items-center justify-between text-xs uppercase opacity-90"><span>{c.type}</span><CreditCard size={18}/></div>
              <div className="text-xl tracking-widest font-mono mt-6">{c.num}</div>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span>EXP {c.expiry}</span>
                <span className={`px-2 py-0.5 rounded ${statuses[i] === "Active" ? "bg-emerald-500/90" : "bg-red-500/90"}`}>{statuses[i]}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 text-sm">
              <button onClick={() => setBlockIdx(i)} className="py-3 hover:bg-secondary border-r">{statuses[i] === "Active" ? "Block" : "Unblock"}</button>
              <button onClick={() => setLimitPop(true)} className="py-3 hover:bg-secondary border-r">Manage Limit</button>
              <button className="py-3 hover:bg-secondary">View PIN</button>
            </div>
          </div>
        ))}
      </div>

      {blockIdx !== null && !otp && (
        <div className="bg-white border rounded-md p-6 max-w-md mx-auto space-y-4">
          <div className="font-semibold text-fed-blue">Block Card</div>
          <label className="block text-sm">Reason
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 w-full border rounded px-3 py-2 text-sm">
              {REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>
          <div className="flex gap-2">
            <button onClick={() => setBlockIdx(null)} className="flex-1 border-2 border-fed-blue text-fed-blue py-2.5 rounded font-semibold">Cancel</button>
            <button onClick={() => setOtp(true)} className="flex-1 bg-fed-blue text-white py-2.5 rounded font-semibold">Continue</button>
          </div>
        </div>
      )}
      {otp && (
        <div className="max-w-md mx-auto">
          <OtpStep seconds={54} onVerify={() => {
            if (blockIdx !== null) {
              const next = [...statuses];
              next[blockIdx] = next[blockIdx] === "Active" ? "Blocked" : "Active";
              setStatuses(next);
            }
            setOtp(false); setBlockIdx(null); setSuccessPop(true);
          }} />
        </div>
      )}

      <RestrictionPopup open={limitPop} onClose={() => setLimitPop(false)} message="Please use Mobile Banking to manage card limits." />
      <RestrictionPopup open={successPop} onClose={() => setSuccessPop(false)} message="Card status updated successfully." />
    </div>
  );
}