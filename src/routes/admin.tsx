import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LogOut, Send, Trash2, Plus, Save, Upload, Image as ImageIcon,
  MessageSquare, ListChecks, User as UserIcon, KeyRound, Palette,
} from "lucide-react";
import { useAdminConfig } from "@/lib/admin-config";
import {
  adminIngestSms,
  adminUpsertTransaction,
  adminDeleteTransaction,
  type TxnPayload,
} from "@/lib/admin.functions";
import { startDemoSession } from "@/lib/demo-session.functions";
import { DEMO_CREDENTIALS } from "@/lib/auth-store";
import { useBankTransactions } from "@/lib/use-bank-transactions";
import { formatINR } from "@/lib/transactions-store";
import { formatDDMMYYYY } from "@/lib/format-date";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — FED BUSINESS" }] }),
  component: AdminPage,
});

type Tab = "sms" | "txn" | "profile" | "creds" | "brand";

function AdminPage() {
  const navigate = useNavigate();
  const { adminAuthed, logoutAdmin, branding, profile } = useAdminConfig();
  const [tab, setTab] = useState<Tab>("sms");

  useEffect(() => {
    if (!adminAuthed) {
      navigate({ to: "/" });
      return;
    }
    // Ensure demo session cookie exists so server fns work.
    startDemoSession({ data: DEMO_CREDENTIALS }).catch(() => {});
  }, [adminAuthed, navigate]);

  if (!adminAuthed) return null;

  const handleLogout = () => {
    logoutAdmin();
    navigate({ to: "/" });
  };

  const tabs: { key: Tab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { key: "sms", label: "Message Simulator", icon: MessageSquare },
    { key: "txn", label: "Transaction Editor", icon: ListChecks },
    { key: "profile", label: "Bank Profile", icon: UserIcon },
    { key: "creds", label: "Credentials", icon: KeyRound },
    { key: "brand", label: "Branding", icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-fed-orange grid place-items-center font-black text-slate-900">A</div>
          <div>
            <div className="font-bold text-sm">{profile.appName} — Admin Workspace</div>
            <div className="text-[11px] text-slate-400">{branding.themePrimary} · Restricted access</div>
          </div>
          <div className="flex-1" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-xs"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid md:grid-cols-[220px_1fr] gap-6">
        <nav className="space-y-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm text-left ${
                  tab === t.key ? "bg-fed-orange text-slate-900 font-semibold" : "bg-slate-800/50 hover:bg-slate-800"
                }`}
              >
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0">
          {tab === "sms" && <SmsSimulator />}
          {tab === "txn" && <TxnEditor />}
          {tab === "profile" && <ProfileEditor />}
          {tab === "creds" && <CredsEditor />}
          {tab === "brand" && <BrandingEditor />}
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-slate-950 border border-slate-800 rounded-lg">
      <header className="px-4 py-3 border-b border-slate-800 font-semibold text-sm">{title}</header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function SmsSimulator() {
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const samples = [
    "Rs 6000.00 debited from A/c XX8572 via UPI to DAWOOD SHAIKH. Ref No 983664278342. Avl Bal Rs 10,850.00.",
    "Rs 12,000.00 credited to A/c XX8572 via IMPS from RAHUL KUMAR. Ref 616748509491. Avl Bal Rs 22,850.00.",
    "Rs 25000 debited via NEFT to A/c XX4321 RAVI TRADERS UTR N123456789012. Bal Rs 8,450.00.",
  ];

  const send = async () => {
    if (!msg.trim()) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await adminIngestSms({ data: { message: msg.trim() } });
      if (res.ok) {
        setStatus({ type: "ok", text: `Ingested — UTR ${res.parsed?.utr_number}, ${res.parsed?.transaction_type} ${res.parsed?.payment_mode} ₹${res.parsed?.amount}` });
        setMsg("");
      } else {
        setStatus({ type: "err", text: res.error || "Failed" });
      }
    } catch (e) {
      setStatus({ type: "err", text: e instanceof Error ? e.message : "Failed" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="SMS Message Simulator">
      <p className="text-xs text-slate-400 mb-3">
        Paste any banking SMS. It goes through the same parser + database path as the SMS webhook.
      </p>
      <textarea
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Rs 1000.00 credited to A/c XX1234 via UPI from RAJESH. Ref 123456789012."
        className="w-full h-40 bg-slate-900 border border-slate-800 rounded p-3 text-sm text-slate-100"
      />
      <div className="flex flex-wrap gap-2 mt-2">
        {samples.map((s, i) => (
          <button
            key={i}
            onClick={() => setMsg(s)}
            className="text-[11px] bg-slate-800/70 hover:bg-slate-800 px-2 py-1 rounded"
          >
            Sample {i + 1}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={send}
          disabled={busy || !msg.trim()}
          className="bg-fed-orange text-slate-900 font-semibold px-4 py-2 rounded disabled:opacity-50 flex items-center gap-2"
        >
          <Send size={14} /> {busy ? "Sending…" : "Send"}
        </button>
        {status && (
          <div className={`text-sm ${status.type === "ok" ? "text-emerald-400" : "text-red-400"}`}>
            {status.text}
          </div>
        )}
      </div>
    </Card>
  );
}

const EMPTY_TXN: TxnPayload = {
  transaction_date: new Date().toISOString().slice(0, 10),
  transaction_type: "CREDIT",
  payment_mode: "UPI",
  account_holder_name: "",
  utr_number: "",
  beneficiary_account_last_digits: null,
  amount: 0,
};

function TxnEditor() {
  const { rows, reload, loading } = useBankTransactions();
  const [draft, setDraft] = useState<TxnPayload | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!draft) return;
    setBusy(true);
    try {
      await adminUpsertTransaction({ data: draft });
      setDraft(null);
      reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await adminDeleteTransaction({ data: { id } });
      reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <Card title="Transaction Editor">
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs text-slate-400">
          {loading ? "Loading…" : `${rows.length} transactions`}
        </div>
        <button
          onClick={() => setDraft({ ...EMPTY_TXN })}
          className="bg-fed-orange text-slate-900 font-semibold px-3 py-1.5 rounded text-xs flex items-center gap-1"
        >
          <Plus size={14} /> New
        </button>
      </div>

      {draft && (
        <div className="bg-slate-900 border border-slate-700 rounded p-3 mb-4 grid md:grid-cols-2 gap-3">
          <TxnField label="Date" type="date" value={draft.transaction_date} onChange={(v) => setDraft({ ...draft, transaction_date: v })} />
          <TxnField label="Type" select={["CREDIT", "DEBIT"]} value={draft.transaction_type} onChange={(v) => setDraft({ ...draft, transaction_type: v as "CREDIT" | "DEBIT" })} />
          <TxnField label="Mode" select={["UPI", "IMPS", "NEFT", "RTGS", "CASH", "ATM"]} value={draft.payment_mode} onChange={(v) => setDraft({ ...draft, payment_mode: v })} />
          <TxnField label="Party Name" value={draft.account_holder_name} onChange={(v) => setDraft({ ...draft, account_holder_name: v })} />
          <TxnField label="UTR / Ref" value={draft.utr_number} onChange={(v) => setDraft({ ...draft, utr_number: v })} />
          <TxnField label="Beneficiary A/C last digits" value={draft.beneficiary_account_last_digits || ""} onChange={(v) => setDraft({ ...draft, beneficiary_account_last_digits: v || null })} />
          <TxnField label="Amount" type="number" value={String(draft.amount)} onChange={(v) => setDraft({ ...draft, amount: Number(v) || 0 })} />
          <div className="md:col-span-2 flex gap-2 justify-end">
            <button onClick={() => setDraft(null)} className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-xs">Cancel</button>
            <button onClick={save} disabled={busy} className="bg-emerald-500 text-slate-900 font-semibold px-3 py-1.5 rounded text-xs flex items-center gap-1 disabled:opacity-50">
              <Save size={14} /> {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Mode</th>
              <th className="p-2 text-left">Party</th>
              <th className="p-2 text-left">UTR</th>
              <th className="p-2 text-right">Amount</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-800">
                <td className="p-2">{formatDDMMYYYY(r.transaction_date)}</td>
                <td className="p-2">{r.transaction_type}</td>
                <td className="p-2">{r.payment_mode}</td>
                <td className="p-2">{r.account_holder_name}</td>
                <td className="p-2 font-mono text-[10px]">{r.utr_number}</td>
                <td className="p-2 text-right">{formatINR(Number(r.amount))}</td>
                <td className="p-2 text-right whitespace-nowrap">
                  <button
                    onClick={() =>
                      setDraft({
                        id: r.id,
                        transaction_date: r.transaction_date,
                        transaction_type: r.transaction_type as "CREDIT" | "DEBIT",
                        payment_mode: r.payment_mode,
                        account_holder_name: r.account_holder_name,
                        utr_number: r.utr_number,
                        beneficiary_account_last_digits: r.beneficiary_account_last_digits,
                        amount: Number(r.amount),
                      })
                    }
                    className="text-fed-orange hover:underline mr-3"
                  >
                    Edit
                  </button>
                  <button onClick={() => del(r.id)} className="text-red-400 hover:underline inline-flex items-center gap-1">
                    <Trash2 size={12} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function TxnField({ label, value, onChange, type = "text", select }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; select?: string[];
}) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wide text-slate-400 mb-1">{label}</span>
      {select ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm">
          {select.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm" />
      )}
    </label>
  );
}

function ProfileEditor() {
  const { profile, updateProfile } = useAdminConfig();
  const [draft, setDraft] = useState(profile);
  return (
    <Card title="Bank Profile — Editable Everywhere">
      <div className="grid md:grid-cols-2 gap-3">
        {(Object.keys(draft) as (keyof typeof draft)[]).map((k) => (
          <TxnField
            key={String(k)}
            label={String(k)}
            value={String(draft[k] ?? "")}
            onChange={(v) =>
              setDraft({
                ...draft,
                [k]: k === "accountLimit" ? Number(v) || 0 : v,
              })
            }
          />
        ))}
      </div>
      <div className="flex gap-2 justify-end mt-4">
        <button onClick={() => setDraft(profile)} className="bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-sm">Reset</button>
        <button
          onClick={() => { updateProfile(draft); alert("Profile updated. Refresh the merchant app to see changes."); }}
          className="bg-emerald-500 text-slate-900 font-semibold px-3 py-2 rounded text-sm flex items-center gap-2"
        >
          <Save size={14} /> Save Profile
        </button>
      </div>
    </Card>
  );
}

function CredsEditor() {
  const { merchantCreds, adminCreds, totpEnabled, updateMerchantCreds, updateAdminCreds, setTotpEnabled, profile, updateProfile } = useAdminConfig();
  const [m, setM] = useState(merchantCreds);
  const [a, setA] = useState(adminCreds);
  const [mob, setMob] = useState(profile.mobile);
  const [em, setEm] = useState(profile.email);

  return (
    <div className="space-y-4">
      <Card title="Merchant Credentials">
        <div className="grid md:grid-cols-2 gap-3">
          <TxnField label="User ID" value={m.userId} onChange={(v) => setM({ ...m, userId: v })} />
          <TxnField label="Password" value={m.password} onChange={(v) => setM({ ...m, password: v })} />
          <TxnField label="Mobile Number" value={mob} onChange={setMob} />
          <TxnField label="Email" value={em} onChange={setEm} />
        </div>
        <label className="flex items-center gap-2 mt-3 text-sm">
          <input type="checkbox" checked={totpEnabled} onChange={(e) => setTotpEnabled(e.target.checked)} />
          Google Authenticator (TOTP) enabled
        </label>
        <div className="flex justify-end mt-3">
          <button
            onClick={() => { updateMerchantCreds(m); updateProfile({ mobile: mob, email: em }); alert("Merchant credentials updated. Old credentials are now invalid."); }}
            className="bg-emerald-500 text-slate-900 font-semibold px-3 py-2 rounded text-sm"
          >
            Save Merchant Credentials
          </button>
        </div>
      </Card>

      <Card title="Admin Credentials">
        <div className="grid md:grid-cols-2 gap-3">
          <TxnField label="Admin User ID" value={a.userId} onChange={(v) => setA({ ...a, userId: v })} />
          <TxnField label="Admin Password" value={a.password} onChange={(v) => setA({ ...a, password: v })} />
        </div>
        <div className="flex justify-end mt-3">
          <button
            onClick={() => { updateAdminCreds(a); alert("Admin credentials updated."); }}
            className="bg-emerald-500 text-slate-900 font-semibold px-3 py-2 rounded text-sm"
          >
            Save Admin Credentials
          </button>
        </div>
      </Card>
    </div>
  );
}

function BrandingEditor() {
  const { branding, updateBranding, profile, updateProfile } = useAdminConfig();
  const [b, setB] = useState(branding);
  const [appName, setAppName] = useState(profile.appName);
  const [websiteName, setWebsiteName] = useState(profile.websiteName);

  const readFile = (key: keyof typeof b) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setB({ ...b, [key]: reader.result as string });
    reader.readAsDataURL(f);
  };

  return (
    <Card title="Branding & Logos">
      <div className="grid md:grid-cols-2 gap-3">
        <TxnField label="App Name" value={appName} onChange={setAppName} />
        <TxnField label="Website Name" value={websiteName} onChange={setWebsiteName} />
        <TxnField label="Primary Color" value={b.themePrimary} onChange={(v) => setB({ ...b, themePrimary: v })} />
        <TxnField label="Accent Color" value={b.themeAccent} onChange={(v) => setB({ ...b, themeAccent: v })} />
      </div>

      <div className="grid md:grid-cols-3 gap-3 mt-4">
        {(["logoUrl", "loginLogoUrl", "splashLogoUrl"] as const).map((k) => (
          <div key={k} className="bg-slate-900 border border-slate-800 rounded p-3">
            <div className="text-[11px] uppercase text-slate-400 mb-2">{k}</div>
            <div className="h-20 bg-slate-800 rounded grid place-items-center overflow-hidden mb-2">
              {b[k] ? (
                <img src={b[k] as string} alt="" className="max-h-full max-w-full" />
              ) : (
                <ImageIcon size={24} className="text-slate-600" />
              )}
            </div>
            <div className="flex gap-2">
              <label className="flex-1 bg-slate-800 hover:bg-slate-700 cursor-pointer text-xs px-2 py-1.5 rounded flex items-center justify-center gap-1">
                <Upload size={12} /> Upload
                <input type="file" accept="image/*" className="hidden" onChange={readFile(k)} />
              </label>
              {b[k] && (
                <button onClick={() => setB({ ...b, [k]: null })} className="text-red-400 text-xs px-2">Remove</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={() => { updateBranding(b); updateProfile({ appName, websiteName }); alert("Branding saved. Refresh the merchant app to see changes."); }}
          className="bg-emerald-500 text-slate-900 font-semibold px-3 py-2 rounded text-sm flex items-center gap-2"
        >
          <Save size={14} /> Save Branding
        </button>
      </div>
    </Card>
  );
}