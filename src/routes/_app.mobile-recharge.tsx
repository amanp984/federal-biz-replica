import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { OtpStep } from "@/components/OtpStep";
import { RestrictionPopup } from "@/components/RestrictionPopup";

export const Route = createFileRoute("/_app/mobile-recharge")({
  head: () => ({ meta: [{ title: "Mobile Recharge — FED BUSINESS" }] }),
  component: Recharge,
});
const OPS = ["Airtel", "Jio", "Vi", "BSNL"];

function Recharge() {
  const [op, setOp] = useState(OPS[0]);
  const [num, setNum] = useState("");
  const [amt, setAmt] = useState("");
  const [otp, setOtp] = useState(false);
  const [pop, setPop] = useState(false);
  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <PageHeader title="Mobile Recharge" subtitle="Recharge prepaid mobile numbers" />
      {!otp && (
        <div className="bg-white border rounded-md p-6 space-y-4">
          <label className="block text-sm font-semibold">Operator
            <select value={op} onChange={(e) => setOp(e.target.value)} className="mt-1 w-full border rounded px-3 py-2.5 text-sm">
              {OPS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold">Mobile Number
            <input value={num} onChange={(e) => setNum(e.target.value)} inputMode="numeric" maxLength={10} className="mt-1 w-full border rounded px-3 py-2.5 text-sm"/>
          </label>
          <label className="block text-sm font-semibold">Amount (₹)
            <input value={amt} onChange={(e) => setAmt(e.target.value)} inputMode="decimal" className="mt-1 w-full border rounded px-3 py-2.5 text-sm"/>
          </label>
          <button disabled={num.length !== 10 || !amt} onClick={() => setOtp(true)} className="w-full bg-fed-blue hover:bg-fed-blue-dark text-white py-2.5 rounded font-semibold disabled:opacity-60">Recharge Now</button>
        </div>
      )}
      {otp && <OtpStep seconds={54} onVerify={() => setPop(true)} />}
      <RestrictionPopup open={pop} onClose={() => { setPop(false); setOtp(false); setNum(""); setAmt(""); }} />
    </div>
  );
}