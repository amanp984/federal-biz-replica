import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FEDERAL_LOGO_FULL, FEDERAL_LOGO_HORIZONTAL } from "@/lib/logos";
import { OtpStep } from "@/components/OtpStep";
import { consumeOtp } from "@/lib/otp-pool";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — FED BUSINESS" },
      { name: "description", content: "Recover access to your FED BUSINESS account." },
    ],
  }),
  component: ForgotPasswordPage,
});

type Step = "details" | "otp" | "result";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    accountNumber: "",
    customerId: "",
    debitCard: "",
    mobile: "",
  });
  const [err, setErr] = useState("");

  const proceed = (e: React.FormEvent) => {
    e.preventDefault();
    const { accountNumber, customerId, debitCard, mobile } = form;
    if (!accountNumber || !customerId || !debitCard || !mobile) {
      setErr("Please fill in all the required fields.");
      return;
    }
    if (!/^\d{10}$/.test(mobile.replace(/\D/g, "").slice(-10))) {
      setErr("Please enter a valid 10-digit registered mobile number.");
      return;
    }
    setErr("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex flex-col">
      <LoadingOverlay show={loading} />
      <div className="bg-white border-b-4 border-fed-orange shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <img src={FEDERAL_LOGO_HORIZONTAL} alt="FED BUSINESS" className="h-10 w-auto" />
          <div className="border-l border-border h-8" />
          <div>
            <div className="text-lg font-bold text-fed-blue tracking-wide">FED BUSINESS</div>
            <div className="text-[11px] text-muted-foreground -mt-0.5">Account Recovery</div>
          </div>
          <Link to="/" className="ml-auto inline-flex items-center gap-1.5 text-sm text-fed-blue hover:underline">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>

      <div className="flex-1 max-w-xl w-full mx-auto px-4 py-8">
        {step === "details" && (
          <div className="bg-white rounded-md shadow-md border overflow-hidden">
            <div className="bg-fed-blue text-white px-6 py-4 border-b-4 border-fed-orange flex items-center gap-3">
              <img src={FEDERAL_LOGO_FULL} alt="" className="w-10 h-10 bg-white rounded p-1" />
              <div>
                <div className="font-bold text-lg leading-tight">Forgot Password</div>
                <div className="text-xs opacity-85">Verify your identity to proceed</div>
              </div>
            </div>
            <form onSubmit={proceed} className="p-6 space-y-4">
              <Field label="Account Number">
                <input
                  value={form.accountNumber}
                  onChange={(e) => setForm({ ...form, accountNumber: e.target.value.replace(/\D/g, "") })}
                  placeholder="Enter your account number"
                  inputMode="numeric"
                  maxLength={20}
                  className="w-full border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-fed-blue"
                />
              </Field>
              <Field label="Customer ID">
                <input
                  value={form.customerId}
                  onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                  placeholder="Enter your Customer ID"
                  className="w-full border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-fed-blue"
                />
              </Field>
              <Field label="Debit Card Number">
                <input
                  value={form.debitCard}
                  onChange={(e) => setForm({ ...form, debitCard: e.target.value.replace(/\D/g, "") })}
                  placeholder="16-digit debit card number"
                  inputMode="numeric"
                  maxLength={16}
                  className="w-full border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-fed-blue"
                />
              </Field>
              <Field label="Registered Mobile Number">
                <input
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  placeholder="+91 XXXXXXXXXX"
                  className="w-full border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-fed-blue"
                />
              </Field>

              {err && <div className="text-destructive text-sm">{err}</div>}

              <button
                type="submit"
                className="w-full bg-fed-blue hover:bg-fed-blue-dark text-white font-semibold py-2.5 rounded transition"
              >
                Proceed
              </button>
              <p className="text-xs text-muted-foreground text-center">
                Your information is processed within this educational demonstration only.
              </p>
            </form>
          </div>
        )}

        {step === "otp" && (
          <div>
            <OtpStep
              seconds={60}
              onVerify={async (otp) => {
                const e = consumeOtp(otp);
                if (e) return e;
                setStep("result");
                setShowModal(true);
              }}
              title="OTP Verification"
              subtitle="Enter the 6-digit OTP sent to your registered mobile."
            />
          </div>
        )}

        {step === "result" && showModal && (
          <div className="fixed inset-0 z-[110] grid place-items-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-md shadow-xl border overflow-hidden">
              <div className="bg-fed-blue text-white px-5 py-3 border-b-4 border-fed-orange flex items-center gap-2">
                <ShieldAlert size={20} />
                <div className="font-bold">Password Reset Unavailable</div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-foreground">
                  For security reasons, password reset cannot be completed through this
                  demonstration portal. Please use the official mobile banking application or
                  contact customer support.
                </p>
                <button
                  onClick={() => {
                    setShowModal(false);
                    navigate({ to: "/" });
                  }}
                  className="w-full bg-fed-blue hover:bg-fed-blue-dark text-white font-semibold py-2.5 rounded"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="bg-fed-blue text-white text-xs text-center py-3">
        © {new Date().getFullYear()} FED BUSINESS — Educational Demonstration Portal.
      </footer>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-foreground mb-1.5">{label}</span>
      {children}
    </label>
  );
}