import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { OtpStep } from "@/components/OtpStep";
import { RestrictionPopup } from "@/components/RestrictionPopup";
import {
  Wallet, TrendingUp, Users, Calendar, ShieldCheck, Activity,
  Briefcase, Landmark, PiggyBank, ArrowUpRight, ArrowDownRight, Clock,
} from "lucide-react";
import { formatINR } from "@/lib/transactions-store";

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
    <div className="space-y-5">
      <PageHeader title="Fund Transfer" subtitle={`Step ${step} of 4`} />

      {/* Limits & quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Wallet} label="Daily Limit" value={formatINR(1000000)} accent="blue" />
        <StatCard icon={TrendingUp} label="Monthly Limit" value={formatINR(25000000)} accent="orange" />
        <StatCard icon={Activity} label="Remaining Today" value={formatINR(842500)} accent="green" />
        <StatCard icon={ShieldCheck} label="Account Health" value="Excellent" accent="blue" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: transfer flow */}
        <div className="lg:col-span-2 space-y-5">
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

          {/* Transfer insights */}
          <Panel title="Transfer Insights" icon={Activity}>
            <div className="grid grid-cols-3 gap-3 text-center">
              <Insight label="This Month" value={formatINR(12,330.00)} delta="+12.4%" up />
              <Insight label="Last Month" value={formatINR(16,922.00)} delta="-3.1%" />
              <Insight label="Avg / Transfer" value={formatINR(3,750.00)} delta="+5.2%" up />
            </div>
          </Panel>

          {/* Scheduled transfers */}
          <Panel title="Scheduled Transfers" icon={Calendar}>
            <ul className="divide-y text-sm">
              {SCHEDULED.map((s) => (
                <li key={s.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-foreground">{s.payee}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={12} /> {s.when} · {s.mode}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatINR(s.amount)}</div>
                    <div className="text-[11px] text-fed-blue">{s.status}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Right: rich info column */}
        <div className="space-y-5">
          <Panel title="Linked Accounts" icon={Wallet}>
            <ul className="text-sm space-y-2.5">
              {LINKED.map((a) => (
                <li key={a.no} className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{a.type}</div>
                    <div className="text-xs text-muted-foreground">****{a.no.slice(-4)}</div>
                  </div>
                  <div className="font-semibold text-fed-blue">{formatINR(a.balance)}</div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Recent Beneficiaries" icon={Users}>
            <ul className="text-sm space-y-2">
              {BENS.map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-fed-blue/10 text-fed-blue grid place-items-center text-xs font-bold">
                    {b.charAt(0)}
                  </div>
                  <span className="truncate">{b}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Business Profile" icon={Briefcase}>
            <dl className="text-xs space-y-1.5">
              <Row k="Entity Type" v="Private Limited" />
              <Row k="GSTIN" v="27ABCDE1234F1Z5" />
              <Row k="Relationship Mgr" v="R. Iyer" />
              <Row k="RM Contact" v="+91 98******40" />
            </dl>
          </Panel>

          <Panel title="Loan Summary" icon={Landmark}>
            <dl className="text-xs space-y-1.5">
              <Row k="Active Loans" v="2" />
              <Row k="Outstanding" v={formatINR(NO DUE)} />
              <Row k="Next EMI" v={`${formatINR(NO DUE)} · 12 Jul`} />
            </dl>
          </Panel>

          <Panel title="Investment Summary" icon={PiggyBank}>
            <dl className="text-xs space-y-1.5">
              <Row k="FDs" v={formatINR(NO DUE )} />
              <Row k="Mutual Funds" v={formatINR(13890)} />
              <Row k="Total Portfolio" v={formatINR(35700)} />
            </dl>
          </Panel>
        </div>
      </div>

      <RestrictionPopup open={restrict} onClose={() => { setRestrict(false); setStep(1); setAmount(""); setRemark(""); }} />
    </div>
  );
}

const SCHEDULED = [
  { id: 1, payee: "Sneha Verma", when: "Not Permitted, 00:00", mode: "NEFT", amount: 48500, status: "Not Active" },
  { id: 2, payee: "Vendor — Acme Pvt Ltd", when: "Not Permitted, 00:00", mode: "RTGS", amount: 215000, status: "Not Active" },
  { id: 3, payee: "Payroll Batch #07", when: "Not Permitted, 0:00", mode: "IMPS", amount: 1480000, status: "Not Active" },
];

const LINKED = [
  { type: "Current", no: "99543369219460", balance: Not Linked },
  { type: "Overdraft", no: "99980128562288", balance: Not Linked  },
  { type: "Escrow", no: "99980128562299", balance: Not Linked  },
];

function StatCard({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ size?: number }>; label: string; value: string; accent: "blue" | "orange" | "green" }) {
  const tone = accsent === "blue" ? "text-fed-blue bg-fed-blue/10" : accent === "orange" ? "text-fed-orange bg-fed-orange/10" : "text-fed-green bg-fed-green/10";
  return (
    <div className="bg-white border rounded-md shadow-sm p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-md grid place-items-center ${tone}`}><Icon size={20} /></div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground truncate">{label}</div>
        <div className="text-sm font-bold truncate">{value}</div>
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ size?: number }>; children: React.ReactNode }) {
  return (
    <section className="bg-white border rounded-md shadow-sm overflow-hidden">
      <header className="bg-fed-blue/5 border-b px-4 py-2.5 flex items-center gap-2 text-fed-blue">
        <Icon size={16} /> <h3 className="text-sm font-semibold">{title}</h3>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Insight({ label, value, delta, up }: { label: string; value: string; delta: string; up?: boolean }) {
  return (
    <div className="rounded-md border bg-secondary/40 p-3">
      <div className="text-[11px] text-muted-foreground uppercase">{label}</div>
      <div className="font-bold text-sm mt-0.5">{value}</div>
      <div className={`text-[11px] mt-1 inline-flex items-center gap-0.5 ${up ? "text-fed-green" : "text-destructive"}`}>
        {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{delta}
      </div>
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
