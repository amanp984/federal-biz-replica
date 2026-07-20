import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/lib/auth-store";
import { formatINR } from "@/lib/transactions-store";
import { RestrictionPopup } from "@/components/RestrictionPopup";
import { useAdminConfig } from "@/lib/admin-config";
import { X } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — FED BUSINESS" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { loginAdmin } = useAdminConfig();
  const [pop, setPop] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminId, setAdminId] = useState("");
  const [adminPwd, setAdminPwd] = useState("");
  const [adminErr, setAdminErr] = useState("");
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<number | null>(null);

  const handleHiddenTap = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) window.clearTimeout(tapTimerRef.current);
    tapTimerRef.current = window.setTimeout(() => (tapCountRef.current = 0), 2500);
    if (tapCountRef.current >= 10) {
      tapCountRef.current = 0;
      setAdminOpen(true);
    }
  };

  const submitAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(adminId, adminPwd)) {
      setAdminOpen(false);
      setAdminId(""); setAdminPwd(""); setAdminErr("");
      navigate({ to: "/admin" });
    } else {
      setAdminErr("Invalid administrator credentials.");
    }
  };

  if (!user) return null;
  return (
    <div className="space-y-5">
      <div onClick={handleHiddenTap}>
        <PageHeader title="Settings & Profile" />
      </div>
      <div className="bg-white border rounded-md shadow-sm overflow-hidden">
        <div className="bg-fed-blue text-white px-5 py-3 font-semibold border-b-4 border-fed-orange">Personal Information</div>
        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 p-5 text-sm">
          <Row k="Customer Name" v={user.customerName} />
          <Row k="Customer ID" v={user.customerId} />
          <Row k="CIF" v={user.cif} />
          <Row k="Account Number" v={user.accountNumber} />
          <Row k="IFSC" v={user.ifsc} />
          <Row k="Registered Mobile" v={user.mobile} />
          <Row k="Registered Email" v={user.email} />
          <Row k="KYC Number" v={user.kyc} />
          <Row k="Address" v={user.address} />
          <Row k="Office" v={user.branchAddress} />
        </dl>
      </div>
      <div className="bg-white border rounded-md shadow-sm overflow-hidden">
        <div className="bg-fed-orange text-white px-5 py-3 font-semibold">Account Limit</div>
        <div className="p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Daily Transaction Limit</div>
            <div className="text-2xl font-bold text-fed-green-dark">{formatINR(user.accountLimit)}</div>
          </div>
          <button onClick={() => setPop(true)} className="bg-fed-blue text-white px-4 py-2 rounded font-semibold">Manage Limit</button>
        </div>
      </div>
      <RestrictionPopup open={pop} onClose={() => setPop(false)} message="Please contact support for limit upgrade." />
      {adminOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 grid place-items-center p-4">
          <div className="bg-white rounded-md shadow-xl w-full max-w-sm overflow-hidden">
            <div className="bg-fed-blue text-white px-4 py-3 flex items-center justify-between">
              <span className="font-semibold text-sm">Administrator Access</span>
              <button onClick={() => setAdminOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={submitAdmin} className="p-5 space-y-3">
              <label className="block text-sm">
                <span className="block font-medium mb-1">Admin ID</span>
                <input value={adminId} onChange={(e) => setAdminId(e.target.value)} autoFocus
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fed-blue" />
              </label>
              <label className="block text-sm">
                <span className="block font-medium mb-1">Password</span>
                <input type="password" value={adminPwd} onChange={(e) => setAdminPwd(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fed-blue" />
              </label>
              {adminErr && <div className="text-destructive text-xs">{adminErr}</div>}
              <button type="submit" className="w-full bg-fed-blue hover:bg-fed-blue-dark text-white py-2 rounded font-semibold text-sm">
                Sign in
              </button>
              <p className="text-[10px] text-muted-foreground text-center">Restricted area. Access is logged.</p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b pb-2">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-semibold text-right">{v}</dd>
    </div>
  );
}