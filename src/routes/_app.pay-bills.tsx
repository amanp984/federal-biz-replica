import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Zap, Droplets, Flame, Smartphone, CreditCard as CardIcon } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { OtpStep } from "@/components/OtpStep";
import { RestrictionPopup } from "@/components/RestrictionPopup";

export const Route = createFileRoute("/_app/pay-bills")({
  head: () => ({ meta: [{ title: "Pay Bills — FED BUSINESS" }] }),
  component: PayBills,
});

const CATS = [
  { id: "electricity", label: "Electricity", icon: Zap },
  { id: "water", label: "Water", icon: Droplets },
  { id: "gas", label: "Gas", icon: Flame },
  { id: "mobile", label: "Mobile", icon: Smartphone },
  { id: "credit-card", label: "Credit Card", icon: CardIcon },
];

function PayBills() {
  const [cat, setCat] = useState<string | null>(null);
  const [num, setNum] = useState("");
  const [amount, setAmount] = useState("");
  const [otp, setOtp] = useState(false);
  const [pop, setPop] = useState(false);

  return (
    <div className="space-y-5">
      <PageHeader title="Pay Bills" subtitle="Pay utility and card bills securely" />
      {!cat && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {CATS.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)} className="bg-white border rounded-md p-5 flex flex-col items-center gap-2 hover:border-fed-blue hover:shadow-md">
              <div className="w-12 h-12 rounded-full bg-fed-blue/10 text-fed-blue grid place-items-center"><c.icon /></div>
              <span className="text-sm font-semibold">{c.label}</span>
            </button>
          ))}
        </div>
      )}
      {cat && !otp && (
        <div className="bg-white border rounded-md p-6 max-w-lg mx-auto space-y-4">
          <div className="font-semibold text-fed-blue text-lg capitalize">{cat.replace("-"," ")} Bill</div>
          <label className="block text-sm font-semibold">Consumer / Card Number
            <input value={num} onChange={(e) => setNum(e.target.value)} className="mt-1 w-full border rounded px-3 py-2.5 text-sm"/>
          </label>
          <label className="block text-sm font-semibold">Amount (₹)
            <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" className="mt-1 w-full border rounded px-3 py-2.5 text-sm"/>
          </label>
          <div className="flex gap-2">
            <button onClick={() => setCat(null)} className="flex-1 border-2 border-fed-blue text-fed-blue py-2.5 rounded font-semibold">Back</button>
            <button disabled={!num || !amount} onClick={() => setOtp(true)} className="flex-1 bg-fed-blue text-white py-2.5 rounded font-semibold disabled:opacity-60">Pay Now</button>
          </div>
        </div>
      )}
      {otp && <OtpStep seconds={54} onVerify={() => setPop(true)} />}
      <RestrictionPopup open={pop} onClose={() => { setPop(false); setOtp(false); setCat(null); setNum(""); setAmount(""); }} />
    </div>
  );
}