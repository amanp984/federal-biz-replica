import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { RestrictionPopup } from "@/components/RestrictionPopup";
import {
  Users, UserPlus, Settings as SettingsIcon, FileText, Landmark, PiggyBank,
  Activity, Star, BarChart3, Wallet, Pencil, Trash2, Eye,
} from "lucide-react";
import { formatINR } from "@/lib/transactions-store";

export const Route = createFileRoute("/_app/beneficiaries")({
  head: () => ({ meta: [{ title: "Beneficiaries — FED BUSINESS" }] }),
  component: Beneficiaries,
});

interface Beneficiary {
  name: string; bank: string; acct: string; ifsc: string; type: string; added: string;
}

const BENS: Beneficiary[] = [
  { name: "Rahul Sharma",        bank: "HDFC",         acct: "XXXXXX4582", ifsc: "HDFC0001234", type: "Savings", added: "2025-04-12" },
  { name: "Sneha Verma",         bank: "FED BUSINESS", acct: "XXXXXX9271", ifsc: "FDRL0001234", type: "Current", added: "2025-05-02" },
  { name: "Pooja Singh",         bank: "ICICI",        acct: "XXXXXX1845", ifsc: "ICIC0004567", type: "Savings", added: "2025-05-30" },
  { name: "Amit Patel",          bank: "SBI",          acct: "XXXXXX6723", ifsc: "SBIN0005678", type: "Current", added: "2025-06-08" },
  { name: "Acme Vendors Pvt Ltd",bank: "Axis",         acct: "XXXXXX3019", ifsc: "UTIB0009876", type: "Current", added: "2025-06-15" },
  { name: "Priya Nair",          bank: "Kotak",        acct: "XXXXXX8842", ifsc: "KKBK0002345", type: "Savings", added: "2025-06-22" },
  { name: "Globex Logistics",    bank: "FED BUSINESS", acct: "XXXXXX5510", ifsc: "FDRL0001234", type: "Current", added: "2025-07-01" },
  { name: "Vikram Reddy",        bank: "Yes Bank",     acct: "XXXXXX2134", ifsc: "YESB0003456", type: "Salary",  added: "2025-07-09" },
  { name: "Initech Solutions",   bank: "IndusInd",     acct: "XXXXXX7765", ifsc: "INDB0007890", type: "Current", added: "2025-07-15" },
  { name: "Nikita Kapoor",       bank: "HDFC",         acct: "XXXXXX9387", ifsc: "HDFC0009912", type: "Savings", added: "2025-07-21" },
  { name: "Stark Industries",    bank: "ICICI",        acct: "XXXXXX4421", ifsc: "ICIC0008870", type: "Current", added: "2025-07-28" },
  { name: "Karan Mehra",         bank: "Punjab Natl",  acct: "XXXXXX0099", ifsc: "PUNB0123456", type: "Savings", added: "2025-08-02" },
];

const PAGE_SIZE = 6;

function Beneficiaries() {
  const [restrict, setRestrict] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(BENS.length / PAGE_SIZE);
  const visible = useMemo(() => BENS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [page]);

  const blockedAction = (action: string) => () =>
    setRestrict(
      action === "add"
        ? "Beneficiary addition is currently restricted. Kindly use Mobile Banking to complete this action."
        : "Action cannot be completed. Kindly use Mobile Banking to proceed.",
    );

  return (
    <div className="space-y-5">
      <PageHeader title="Beneficiaries" subtitle="Manage payees for your business transfers" />

      {/* Action Center */}
      <div className="grid sm:grid-cols-2 gap-4">
        <button
          onClick={() => setAddOpen(true)}
          className="bg-white border rounded-md shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-fed-blue text-left transition"
        >
          <div className="w-12 h-12 rounded-md grid place-items-center bg-fed-blue/10 text-fed-blue"><UserPlus size={22} /></div>
          <div>
            <div className="font-bold text-fed-blue">Add Beneficiary</div>
            <div className="text-xs text-muted-foreground">Register a new payee for fund transfers</div>
          </div>
        </button>
        <button
          onClick={blockedAction("manage")}
          className="bg-white border rounded-md shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-fed-orange text-left transition"
        >
          <div className="w-12 h-12 rounded-md grid place-items-center bg-fed-orange/10 text-fed-orange"><SettingsIcon size={22} /></div>
          <div>
            <div className="font-bold text-fed-blue">Manage Beneficiary</div>
            <div className="text-xs text-muted-foreground">Edit, delete or update existing payees</div>
          </div>
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Users} label="Total Payees" value={String(BENS.length)} />
        <Stat icon={Star} label="Frequently Used" value="5" />
        <Stat icon={Activity} label="Active This Month" value="8" />
        <Stat icon={BarChart3} label="Monthly Transfers" value="42" />
      </div>

      {/* Beneficiary cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((b) => (
          <div key={b.name} className="bg-white border rounded-md shadow-sm overflow-hidden hover:shadow-md transition">
            <div className="bg-fed-blue text-white p-4 border-b-4 border-fed-orange flex items-center gap-3">
              <div className="w-10 h-10 grid place-items-center rounded-full bg-white/15">
                <Users size={18} />
              </div>
              <div className="min-w-0">
                <div className="font-bold truncate">{b.name}</div>
                <div className="text-xs opacity-85 truncate">{b.bank}</div>
              </div>
            </div>
            <div className="p-4 text-sm space-y-1.5">
              <Field k="A/C No." v={b.acct} />
              <Field k="IFSC" v={b.ifsc} />
              <Field k="Type" v={b.type} />
              <Field k="Added" v={b.added} />
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">Status</span>
                <span className="text-xs font-semibold text-emerald-700">Active</span>
              </div>
            </div>
            <div className="grid grid-cols-4 border-t text-xs">
              <button onClick={blockedAction("view")} title="View" className="py-2 hover:bg-secondary flex items-center justify-center gap-1"><Eye size={13} /></button>
              <button onClick={blockedAction("edit")} title="Edit" className="py-2 hover:bg-secondary flex items-center justify-center gap-1"><Pencil size={13} /></button>
              <button onClick={blockedAction("delete")} title="Delete" className="py-2 hover:bg-secondary flex items-center justify-center gap-1 text-destructive"><Trash2 size={13} /></button>
              <Link to="/fund-transfer" className="py-2 bg-fed-blue text-white hover:bg-fed-blue-dark text-center font-semibold">Transfer</Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-muted-foreground">
          Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, BENS.length)} of {BENS.length}
        </div>
        <div className="flex gap-1">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded text-xs font-semibold border ${
                page === i + 1 ? "bg-fed-blue text-white border-fed-blue" : "bg-white hover:bg-secondary"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard panels */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Frequently Used Beneficiaries" icon={Star}>
          <ul className="text-sm space-y-2">
            {BENS.slice(0, 4).map((b) => (
              <li key={b.name} className="flex items-center justify-between">
                <span className="truncate">{b.name}</span>
                <span className="text-xs text-muted-foreground">{b.acct}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Recent Beneficiary Activity" icon={Activity}>
          <ul className="text-xs space-y-2">
            <Activity_ line="Transfer to Rahul Sharma" amount={formatINR(48500)} when="Today, 10:42" />
            <Activity_ line="Transfer to Acme Vendors Pvt Ltd" amount={formatINR(215000)} when="Yesterday" />
            <Activity_ line="Added Karan Mehra" amount="—" when="2 days ago" />
            <Activity_ line="Transfer to Sneha Verma" amount={formatINR(12750)} when="3 days ago" />
          </ul>
        </Panel>
        <Panel title="Beneficiary Statistics" icon={BarChart3}>
          <dl className="text-xs space-y-1.5">
            <Row k="Total Beneficiaries" v={String(BENS.length)} />
            <Row k="Same Bank (FED)" v="2" />
            <Row k="Other Banks" v="10" />
            <Row k="Avg Transfers / Month" v="42" />
            <Row k="Largest Transfer" v={formatINR(1480000)} />
          </dl>
        </Panel>

        <Panel title="Transfer Insights" icon={Activity}>
          <dl className="text-xs space-y-1.5">
            <Row k="This Month" v={formatINR(1845200)} />
            <Row k="Last Month" v={formatINR(1641300)} />
            <Row k="Avg / Transfer" v={formatINR(38450)} />
            <Row k="Mode Split" v="NEFT 48% · IMPS 32% · RTGS 20%" />
          </dl>
        </Panel>
        <Panel title="Account Summary" icon={Wallet}>
          <dl className="text-xs space-y-1.5">
            <Row k="Current A/C" v={formatINR(845000)} />
            <Row k="Overdraft Available" v={formatINR(1250000)} />
            <Row k="Escrow Balance" v={formatINR(620000)} />
            <Row k="Hold Amount" v={formatINR(0)} />
          </dl>
        </Panel>
        <Panel title="Account Statement" icon={FileText}>
          <p className="text-xs text-muted-foreground mb-3">Download your latest account statement in PDF format.</p>
          <Link to="/statements" className="inline-block text-xs bg-fed-blue text-white px-3 py-1.5 rounded hover:bg-fed-blue-dark">View Statements</Link>
        </Panel>

        <Panel title="Loan Overview" icon={Landmark}>
          <dl className="text-xs space-y-1.5">
            <Row k="Active Loans" v="2" />
            <Row k="Outstanding" v={formatINR(4250000)} />
            <Row k="Next EMI" v={`${formatINR(58400)} · 12 Jul`} />
            <Row k="EMI Status" v="On Track" />
          </dl>
        </Panel>
        <Panel title="Investment Summary" icon={PiggyBank}>
          <dl className="text-xs space-y-1.5">
            <Row k="FDs" v={formatINR(2150000)} />
            <Row k="Mutual Funds" v={formatINR(1380000)} />
            <Row k="Total Portfolio" v={formatINR(3530000)} />
            <Row k="YTD Return" v="+11.4%" />
          </dl>
        </Panel>
      </div>

      <AddBeneficiaryDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={() => {
          setAddOpen(false);
          setRestrict("Beneficiary addition is currently restricted. Kindly use Mobile Banking to complete this action.");
        }}
      />
      <RestrictionPopup
        open={!!restrict}
        onClose={() => setRestrict(null)}
        message={restrict ?? ""}
      />
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <b className="font-semibold truncate">{v}</b>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-semibold text-right">{v}</dd>
    </div>
  );
}
function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number }>; label: string; value: string }) {
  return (
    <div className="bg-white border rounded-md shadow-sm p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-md grid place-items-center bg-fed-blue/10 text-fed-blue"><Icon size={20} /></div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground truncate">{label}</div>
        <div className="text-base font-bold truncate">{value}</div>
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
function Activity_({ line, amount, when }: { line: string; amount: string; when: string }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b last:border-0 pb-1.5 last:pb-0">
      <div className="min-w-0">
        <div className="font-semibold text-foreground truncate">{line}</div>
        <div className="text-[10px] text-muted-foreground">{when}</div>
      </div>
      <div className="text-fed-blue font-semibold whitespace-nowrap">{amount}</div>
    </li>
  );
}

function AddBeneficiaryDialog({
  open, onClose, onSubmit,
}: { open: boolean; onClose: () => void; onSubmit: () => void }) {
  const [form, setForm] = useState({ name: "", acct: "", confirm: "", ifsc: "", type: "Savings" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-md shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-fed-blue text-white px-5 py-3 border-b-4 border-fed-orange flex items-center gap-2">
          <UserPlus size={18} /> <span className="font-semibold">Add Beneficiary</span>
        </div>
        <form
          className="p-5 space-y-3 text-sm"
          onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
        >
          <Input label="Beneficiary Name" value={form.name} onChange={set("name")} required />
          <Input label="Account Number" value={form.acct} onChange={set("acct")} required />
          <Input label="Confirm Account Number" value={form.confirm} onChange={set("confirm")} required />
          <Input label="IFSC Code" value={form.ifsc} onChange={set("ifsc")} required />
          <label className="block">
            <span className="block text-xs font-semibold mb-1">Account Type</span>
            <select value={form.type} onChange={set("type")} className="w-full border rounded px-3 py-2 text-sm">
              <option>Savings</option>
              <option>Current</option>
              <option>Salary</option>
              <option>NRI</option>
            </select>
          </label>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border-2 border-fed-blue text-fed-blue font-semibold py-2 rounded">Cancel</button>
            <button type="submit" className="flex-1 bg-fed-blue text-white font-semibold py-2 rounded hover:bg-fed-blue-dark">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="block">
      <span className="block text-xs font-semibold mb-1">{label}</span>
      <input {...rest} className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fed-blue" />
    </label>
  );
}