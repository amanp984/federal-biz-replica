import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { RestrictionPopup } from "@/components/RestrictionPopup";
import {
  Users, UserPlus, Settings as SettingsIcon, FileText, Landmark, PiggyBank,
  Activity, Star, BarChart3, Wallet, Pencil, Trash2, Eye, Search, ArrowUpDown, Filter,
} from "lucide-react";
import { formatINR } from "@/lib/transactions-store";
import { useBankTransactions } from "@/lib/use-bank-transactions";

export const Route = createFileRoute("/_app/beneficiaries")({
  head: () => ({ meta: [{ title: "Beneficiaries — FED BUSINESS" }] }),
  component: Beneficiaries,
});

interface Beneficiary {
  name: string; bank: string; acct: string; ifsc: string; type: string;
  added: string; lastTransfer: string; status: "Active" | "Inactive";
}

const BENS: Beneficiary[] = [
  { name: "Rahul Sharma",         bank: "HDFC Bank",        acct: "XXXXXX4582", ifsc: "HDFC0001234", type: "Savings", added: "2025-04-12", lastTransfer: "2026-06-05", status: "Active" },
  { name: "Sneha Verma",          bank: "FED BUSINESS",     acct: "XXXXXX9271", ifsc: "FDRL0083457", type: "Current", added: "2025-05-02", lastTransfer: "2026-06-04", status: "Active" },
  { name: "Pooja Singh",          bank: "ICICI Bank",       acct: "XXXXXX1845", ifsc: "ICIC0004567", type: "Savings", added: "2025-05-30", lastTransfer: "2026-05-28", status: "Active" },
  { name: "Amit Patel",           bank: "State Bank of India", acct: "XXXXXX6723", ifsc: "SBIN0005678", type: "Current", added: "2025-06-08", lastTransfer: "2026-06-01", status: "Active" },
  { name: "Acme Vendors Pvt Ltd", bank: "Axis Bank",        acct: "XXXXXX3019", ifsc: "UTIB0009876", type: "Current", added: "2025-06-15", lastTransfer: "2026-06-06", status: "Active" },
  { name: "Priya Nair",           bank: "Kotak Mahindra",   acct: "XXXXXX8842", ifsc: "KKBK0002345", type: "Savings", added: "2025-06-22", lastTransfer: "2026-05-21", status: "Active" },
  { name: "Globex Logistics",     bank: "FED BUSINESS",     acct: "XXXXXX5510", ifsc: "FDRL0083457", type: "Current", added: "2025-07-01", lastTransfer: "2026-06-03", status: "Active" },
  { name: "Vikram Reddy",         bank: "Yes Bank",         acct: "XXXXXX2134", ifsc: "YESB0003456", type: "Salary",  added: "2025-07-09", lastTransfer: "2026-04-18", status: "Inactive" },
  { name: "Initech Solutions",    bank: "IndusInd Bank",    acct: "XXXXXX7765", ifsc: "INDB0007890", type: "Current", added: "2025-07-15", lastTransfer: "2026-05-30", status: "Active" },
  { name: "Nikita Kapoor",        bank: "HDFC Bank",        acct: "XXXXXX9387", ifsc: "HDFC0009912", type: "Savings", added: "2025-07-21", lastTransfer: "2026-05-12", status: "Active" },
  { name: "Stark Industries",     bank: "ICICI Bank",       acct: "XXXXXX4421", ifsc: "ICIC0008870", type: "Current", added: "2025-07-28", lastTransfer: "2026-06-02", status: "Active" },
  { name: "Karan Mehra",          bank: "Punjab National",  acct: "XXXXXX0099", ifsc: "PUNB0123456", type: "Savings", added: "2025-08-02", lastTransfer: "2026-03-30", status: "Inactive" },
];

const PAGE_SIZE = 6;

function Beneficiaries() {
  const [restrict, setRestrict] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [bankFilter, setBankFilter] = useState("All");
  const [sort, setSort] = useState<"az" | "za">("az");

  const { transactions, balance } = useBankTransactions();
  const stats = useMemo(() => {
    let totalCredits = 0, totalDebits = 0, creditVol = 0, debitVol = 0;
    for (const t of transactions) {
      if (t.credit > 0) { totalCredits++; creditVol += t.credit; }
      if (t.debit > 0) { totalDebits++; debitVol += t.debit; }
    }
    return {
      totalCredits, totalDebits, creditVol, debitVol,
      total: transactions.length,
    };
  }, [transactions]);

  const banks = useMemo(() => ["All", ...Array.from(new Set(BENS.map((b) => b.bank)))], []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let r = BENS.filter((b) =>
      (!q || b.name.toLowerCase().includes(q) || b.acct.toLowerCase().includes(q) || b.bank.toLowerCase().includes(q)) &&
      (bankFilter === "All" || b.bank === bankFilter),
    );
    if (sort === "az") r = r.slice().sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "za") r = r.slice().sort((a, b) => b.name.localeCompare(a.name));
    return r;
  }, [query, bankFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = useMemo(() => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE), [filtered, safePage]);

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

      {/* Toolbar: search · filter · sort · view */}
      <div className="bg-white border rounded-md shadow-sm p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search beneficiary by name, A/C number or bank"
            className="w-full pl-9 pr-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-fed-blue"
          />
        </div>
        <label className="flex items-center gap-1.5 text-xs">
          <Filter size={13} className="text-fed-blue" />
          <select
            value={bankFilter}
            onChange={(e) => { setBankFilter(e.target.value); setPage(1); }}
            className="border rounded px-2 py-2 text-sm bg-white"
          >
            {banks.map((b) => <option key={b}>{b}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-xs">
          <ArrowUpDown size={13} className="text-fed-blue" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="border rounded px-2 py-2 text-sm bg-white"
          >
            <option value="az">Sort A–Z</option>
            <option value="za">Sort Z–A</option>
          </select>
        </label>
      </div>

      {(
        <div className="bg-white border rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-fed-blue text-white">
                <tr className="text-left">
                  <th className="px-3 py-2.5 font-semibold">Beneficiary Name</th>
                  <th className="px-3 py-2.5 font-semibold">Bank Name</th>
                  <th className="px-3 py-2.5 font-semibold">Account Number</th>
                  <th className="px-3 py-2.5 font-semibold">IFSC</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                  <th className="px-3 py-2.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((b, i) => (
                  <tr key={b.name} className={`border-t ${i % 2 ? "bg-secondary/40" : ""}`}>
                    <td className="px-3 py-2.5 font-semibold text-fed-blue">{b.name}</td>
                    <td className="px-3 py-2.5">{b.bank}</td>
                    <td className="px-3 py-2.5 font-mono">{b.acct}</td>
                    <td className="px-3 py-2.5 font-mono text-xs">{b.ifsc}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={b.status} /></td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-1">
                        <button onClick={blockedAction("view")} className="p-1.5 rounded hover:bg-secondary" title="View"><Eye size={14} /></button>
                        <button onClick={blockedAction("edit")} className="p-1.5 rounded hover:bg-secondary" title="Edit"><Pencil size={14} /></button>
                        <button onClick={blockedAction("delete")} className="p-1.5 rounded hover:bg-secondary text-destructive" title="Delete"><Trash2 size={14} /></button>
                        <Link to="/fund-transfer" className="text-xs bg-fed-blue text-white px-2.5 py-1.5 rounded hover:bg-fed-blue-dark font-semibold">Transfer</Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground text-sm">No beneficiaries match your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="text-muted-foreground">
          Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
        </div>
        <div className="flex gap-1">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded text-xs font-semibold border ${
                safePage === i + 1 ? "bg-fed-blue text-white border-fed-blue" : "bg-white hover:bg-secondary"
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
          <EmptyState icon={Activity} message="No recent beneficiary activity available." />
        </Panel>
        <Panel title="Beneficiary Statistics" icon={BarChart3}>
          <EmptyState icon={BarChart3} message="No beneficiary statistics available." />
        </Panel>

        <Panel title="Transfer Insights" icon={Activity}>
          <dl className="text-xs space-y-1.5">
            <Row k="Total Transactions" v={String(stats.total)} />
            <Row k="Total Credits" v={String(stats.totalCredits)} />
            <Row k="Total Debits" v={String(stats.totalDebits)} />
            <Row k="Credit Volume" v={formatINR(stats.creditVol)} />
            <Row k="Debit Volume" v={formatINR(stats.debitVol)} />
          </dl>
        </Panel>
        <Panel title="Account Summary" icon={Wallet}>
          <dl className="text-xs space-y-1.5">
            <Row k="Current Balance" v={formatINR(balance)} />
            <Row k="Total Credits" v={formatINR(stats.creditVol)} />
            <Row k="Total Debits" v={formatINR(stats.debitVol)} />
            <Row k="Transaction Count" v={String(stats.total)} />
          </dl>
        </Panel>
        <Panel title="Account Statement" icon={FileText}>
          <p className="text-xs text-muted-foreground mb-3">Download your latest account statement in PDF format.</p>
          <Link to="/statements" className="inline-block text-xs bg-fed-blue text-white px-3 py-1.5 rounded hover:bg-fed-blue-dark">View Statements</Link>
        </Panel>

        <Panel title="Loan Overview" icon={Landmark}>
          <EmptyState icon={Landmark} message="No Active Loans Yet" />
        </Panel>
        <Panel title="Investment Summary" icon={PiggyBank}>
          <EmptyState icon={PiggyBank} message="No Investments Yet" />
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
function StatusBadge({ status }: { status: "Active" | "Inactive" }) {
  const isActive = status === "Active";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
      isActive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-600" : "bg-amber-600"}`} />
      {status}
    </span>
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