import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { ShieldCheck, Copy, Check } from "lucide-react";
import { FEDERAL_LOGO_HORIZONTAL } from "@/lib/logos";
import { useAuth, DEMO_USER } from "@/lib/auth-store";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { startDemoSession, DEMO_CREDENTIALS } from "@/lib/demo-session.functions";
import {
  generateTotpSecret,
  hasTotpSecret,
  saveTotpSecret,
  verifyTotp,
  formatSecret,
  clearFailures,
} from "@/lib/totp-store";

// Re-export DEMO_CREDENTIALS from auth-store — startDemoSession lives in demo-session.functions
import { DEMO_CREDENTIALS as CREDS } from "@/lib/auth-store";

export const Route = createFileRoute("/totp-setup")({
  head: () => ({ meta: [{ title: "Setup Authenticator — FED BUSINESS" }] }),
  component: TotpSetupPage,
});

function TotpSetupPage() {
  const navigate = useNavigate();
  const { pendingUserId, login } = useAuth();
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const uid = pendingUserId ?? "";

  // Generate secret ONCE per mount and keep it stable until confirmed.
  const gen = useMemo(() => (uid ? generateTotpSecret() : null), [uid]);

  useEffect(() => {
    if (!uid) {
      navigate({ to: "/" });
      return;
    }
    // If already configured, skip setup entirely
    if (hasTotpSecret(uid)) {
      navigate({ to: "/totp" });
    }
  }, [uid, navigate]);

  useEffect(() => {
    if (!gen || !uid) return;
    QRCode.toDataURL(gen.uri(uid), { margin: 1, width: 220 }).then(setQrDataUrl).catch(() => {});
  }, [gen, uid]);

  if (!uid || !gen) return null;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(gen.base32);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = verifyTotp(gen.base32, code);
    if (result !== "ok") {
      setErr("Invalid verification code.");
      return;
    }
    setErr("");
    setLoading(true);
    saveTotpSecret(uid, gen.base32);
    clearFailures(uid);
    try {
      await startDemoSession({ data: CREDS });
    } catch {
      setLoading(false);
      setErr("Could not start session. Please try again.");
      return;
    }
    login({ ...DEMO_USER, userId: uid });
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex flex-col">
      <LoadingOverlay show={loading} />
      <div className="bg-white border-b-4 border-fed-orange shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <img src={FEDERAL_LOGO_HORIZONTAL} alt="FED BUSINESS" className="h-10" />
          <div className="border-l h-7 mx-1" />
          <div className="text-fed-blue font-bold">FED BUSINESS</div>
        </div>
      </div>
      <div className="flex-1 grid place-items-center p-4">
        <div className="w-full max-w-2xl bg-white border rounded-md shadow-sm overflow-hidden">
          <div className="bg-fed-blue text-white px-5 py-3 flex items-center gap-2 border-b-4 border-fed-orange">
            <ShieldCheck size={18} />
            <span className="font-semibold">Setup Google Authenticator</span>
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-fed-blue mb-2">Steps</h3>
              <ol className="text-sm space-y-2 list-decimal list-inside text-foreground/80">
                <li>Open Google Authenticator (or Microsoft Authenticator, Authy, 1Password, Bitwarden).</li>
                <li>Tap <b>+</b> to add a new account.</li>
                <li>Scan the QR code, or enter the secret key manually.</li>
                <li>Enter the 6-digit code below to verify.</li>
              </ol>

              <div className="mt-5">
                <div className="text-xs text-muted-foreground mb-1">Manual Secret Key</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-secondary border rounded px-3 py-2 text-sm font-mono tracking-wider break-all">
                    {formatSecret(gen.base32)}
                  </code>
                  <button
                    type="button"
                    onClick={onCopy}
                    className="p-2 border rounded hover:bg-secondary"
                    title="Copy secret"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Store this secret safely. It won't be shown again.
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="border-4 border-fed-orange rounded-md p-2 bg-white">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Scan with Authenticator" width={220} height={220} />
                ) : (
                  <div className="w-[220px] h-[220px] grid place-items-center text-xs text-muted-foreground">
                    Generating…
                  </div>
                )}
              </div>
              <form onSubmit={onVerify} className="w-full mt-5 space-y-3">
                <label className="block">
                  <span className="block text-sm font-semibold mb-1.5">Enter 6-digit code</span>
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full border-2 rounded px-3 py-2.5 text-center text-xl font-bold tracking-[0.5em] focus:outline-none focus:border-fed-blue"
                    placeholder="——————"
                  />
                </label>
                {err && <div className="text-destructive text-sm">{err}</div>}
                <button
                  type="submit"
                  className="w-full bg-fed-blue hover:bg-fed-blue-dark text-white font-semibold py-2.5 rounded"
                >
                  Verify & Enable
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}