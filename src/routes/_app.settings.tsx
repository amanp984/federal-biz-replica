import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/lib/auth-store";
import { formatINR } from "@/lib/transactions-store";
import { RestrictionPopup } from "@/components/RestrictionPopup";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — FED BUSINESS" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const [pop, setPop] = useState(false);
  if (!user) return null;
  return (
    <div className="space-y-5">
      <PageHeader title="Settings & Profile" />
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