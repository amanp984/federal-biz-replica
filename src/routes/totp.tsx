import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { FEDERAL_LOGO_HORIZONTAL } from "@/lib/logos";
import { useAuth, DEMO_USER, DEMO_CREDENTIALS } from "@/lib/auth-store";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { startDemoSession } from "@/lib/demo-session.functions";
import {
  getTotpSecret,
  hasTotpSecret,
  verifyTotp,
  registerFailure,
  getLockState,
  clearFailures,
} from "@/lib/totp-store";

export const Route = createFileRoute("/totp")({
  head: () => ({ meta: [{ title: "Two-Step Verification — FED BUSINESS" }] }),
  component: TotpPage,
});

function formatMs(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const mm = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

function TotpPage() {
  const navigate = useNavigate();
  const { pendingUserId, login } = useAuth();
  const uid = pendingUserId ?? "";
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockRemaining, setLockRemaining] = useState(0);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!uid) {
      navigate({ to: "/" });
      return;
    }
    if (!hasTotpSecret(uid)) {
      navigate({ to: "/totp-setup" });
      return;
    }
    const state = getLockState(uid);
    if (state.locked) setLockRemaining(state.remainingMs);
  }, [uid, navigate]);

  useEffect(() => {
    if (lockRemaining <= 0) return;
    const t = setInterval(() => {
      setLockRemaining((r) => {
        const next = r - 1000;
        return next <= 0 ? 0 : next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [lockRemaining]);

  const setDigit = (i: number, v: string) => {
    const ch = v.replace(/\D/g, "").slice(0, 1);
    setDigits((d) => {
      const n = [...d];
      n[i] = ch;
      return n;
    });
    if (ch && i < 5) refs.current[i + 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = Array(6).fill("");
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
    refs.current[Math.min(text.length, 5)]?.focus();
  };

  const submit = async () => {
    if (lockRemaining > 0) return;
    const code = digits.join("");
    if (code.length !== 6) {
      setErr("Invalid authentication code.");
      return;
    }
    const secret = getTotpSecret(uid);
    if (!secret) {
      navigate({ to: "/totp-setup" });
      return;
    }
    const result = verifyTotp(secret, code);
    if (result !== "ok") {
      const state = registerFailure(uid);
      if (state.locked) {
        setLockRemaining(state.remainingMs);
        setErr("Too many failed attempts. Please try again after 5 minutes.");
      } else {
        setErr(`Invalid authentication code. (${state.attempts}/5 attempts)`);
      }
      setDigits(Array(6).fill(""));
      refs.current[0]?.focus();
      return;
    }
    setErr("");
    setLoading(true);
    clearFailures(uid);
    try {
      await startDemoSession({ data: DEMO_CREDENTIALS });
    } catch {
      setLoading(false);
      setErr("Could not start session. Please try again.");
      return;
    }
    login({ ...DEMO_USER, userId: uid });
    navigate({ to: "/dashboard" });
  };

  if (!uid) return null;

  const locked = lockRemaining > 0;

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
        <div className="w-full max-w-md bg-white border rounded-md shadow-sm overflow-hidden">
          <div className="bg-fed-blue text-white px-5 py-3 flex items-center gap-2 border-b-4 border-fed-orange">
            <ShieldCheck size={18} />
            <span className="font-semibold">Two-Step Verification</span>
          </div>
          <div className="p-6 space-y-5">
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code from your Google Authenticator app.
            </p>
            <div className="flex justify-between gap-2">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onPaste={onPaste}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
                    if (e.key === "Enter") submit();
                  }}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  disabled={locked}
                  className="w-12 h-14 text-center text-xl font-bold border-2 rounded focus:border-fed-blue focus:outline-none disabled:bg-secondary disabled:text-muted-foreground"
                />
              ))}
            </div>
            {err && <div className="text-destructive text-sm">{err}</div>}
            {locked && (
              <div className="text-sm bg-destructive/10 text-destructive border border-destructive/30 rounded p-3">
                Locked. Try again in <b>{formatMs(lockRemaining)}</b>.
              </div>
            )}
            <button
              onClick={submit}
              disabled={locked}
              className="w-full bg-fed-blue hover:bg-fed-blue-dark disabled:bg-muted-foreground text-white font-semibold py-2.5 rounded"
            >
              Verify & Continue
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Codes refresh every 30 seconds. ±30s tolerance is allowed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}