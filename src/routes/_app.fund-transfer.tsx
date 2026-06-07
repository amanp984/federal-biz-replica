import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { OtpStep } from "@/components/OtpStep";
import { RestrictionPopup } from "@/components/RestrictionPopup";

export const Route = createFileRoute("/_app/fund-transfer")({
  head: () => ({ meta: [{ title: "Fund Transfer — FED BUSINESS" }] }),
  component: FundTransfer,
});

const BENS = ["Rahul Sharma — HDFC", "Sneha Verma — FED BUSINESS", "Pooja Singh — ICICI"];

function FundTransfer() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [ben, setBen] = useState(BENS[0]);
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [restrict, setRestrict] = useState(false);

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <PageHeader title="Fund Transfer" subtitle={`Step ${step} of 4`} />
      <Stepper step={step} labels={["Beneficiary","Amount","Review","OTP"]} />

      <div className="bg-white border rounded-md shadow-sm p-6">
        {step === 1 && (
          <div className="space-y-4">
            <Field label="Select Beneficiary">
              <select value={ben} onChange={(e) => setBen(e.target.value)} className="w-full border rounded px-3 py-2.5 text-sm">
                {BENS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </Field>
            <Primary onClick={() => setStep(2)}>Continue</Primary>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <Field label="Amount (₹)">
              <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border rounded px-3 py-2.5 text-sm" placeholder="0.00" />
            </Field>
            <Field label="Remark (optional)">
              <input value={remark} onChange={(e) => setRemark(e.target.value)} className="w-full border rounded px-3 py-2.5 text-sm" />
            </Field>
            <div className="flex gap-2"><Secondary onClick={() => setStep(1)}>Back</Secondary><Primary onClick={() => amount && setStep(3)}>Review</Primary></div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <dl className="text-sm divide-y">
              <Row k="Beneficiary" v={ben} />
              <Row k="Amount" v={`₹ ${amount}`} />
              <Row k="Remark" v={remark || "—"} />
            </dl>
            <div className="flex gap-2"><Secondary onClick={() => setStep(2)}>Back</Secondary><Primary onClick={() => setStep(4)}>Proceed to OTP</Primary></div>
          </div>
        )}
        {step === 4 && (
          <OtpStep seconds={54} onVerify={() => setRestrict(true)} />
        )}
      </div>

      <RestrictionPopup open={restrict} onClose={() => { setRestrict(false); setStep(1); setAmount(""); setRemark(""); }} />
    </div>
  );
}

function Stepper({ step, labels }: { step: number; labels: string[] }) {
  return (
    <ol className="flex items-center gap-2">
      {labels.map((l, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <li key={l} className="flex-1 flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold ${done ? "bg-fed-green text-white" : active ? "bg-fed-blue text-white" : "bg-secondary text-muted-foreground"}`}>{n}</div>
            <div className={`text-xs ${active ? "text-fed-blue font-semibold" : "text-muted-foreground"}`}>{l}</div>
            {i < labels.length - 1 && <div className="flex-1 h-0.5 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="block text-sm font-semibold mb-1.5">{label}</span>{children}</label>; }
function Primary(p: React.ButtonHTMLAttributes<HTMLButtonElement>) { return <button {...p} className="flex-1 bg-fed-blue hover:bg-fed-blue-dark text-white font-semibold py-2.5 rounded">{p.children}</button>; }
function Secondary(p: React.ButtonHTMLAttributes<HTMLButtonElement>) { return <button {...p} className="flex-1 border-2 border-fed-blue text-fed-blue hover:bg-secondary font-semibold py-2.5 rounded">{p.children}</button>; }
function Row({ k, v }: { k: string; v: string }) { return <div className="flex justify-between py-2"><dt className="text-muted-foreground">{k}</dt><dd className="font-semibold">{v}</dd></div>; }