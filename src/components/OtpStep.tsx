import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";

export function OtpStep({
  seconds = 54,
  onVerify,
  onResend,
  title = "OTP Verification",
  subtitle = "Enter the 6-digit OTP sent to your registered mobile.",
}: {
  seconds?: number;
  onVerify: (otp: string) => void | string | Promise<void | string>;
  onResend?: () => void;
  title?: string;
  subtitle?: string;
}) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [left, setLeft] = useState(seconds);
  const [err, setErr] = useState("");
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (left <= 0) return;
    const t = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [left]);

  const setDigit = (i: number, v: string) => {
    const ch = v.replace(/\D/g, "").slice(0, 1);
    setDigits((d) => {
      const n = [...d]; n[i] = ch; return n;
    });
    if (ch && i < 5) refs.current[i + 1]?.focus();
  };

  const submit = async () => {
    const otp = digits.join("");
    if (otp.length !== 6) {
      setErr("The OTP entered is not valid. Kindly enter a valid OTP.");
      return;
    }
    setErr("");
    const result = await onVerify(otp);
    if (typeof result === "string" && result) {
      setErr(result);
      setDigits(Array(6).fill(""));
      refs.current[0]?.focus();
    }
  };

  return (
    <div className="bg-white border rounded-md shadow-sm overflow-hidden max-w-md mx-auto">
      <div className="bg-fed-blue text-white px-5 py-3 flex items-center gap-2 border-b-4 border-fed-orange">
        <ShieldCheck size={18} /> <span className="font-semibold">{title}</span>
      </div>
      <div className="p-6 space-y-5">
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        <div className="flex justify-between gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
              }}
              inputMode="numeric"
              maxLength={1}
              className="w-12 h-14 text-center text-xl font-bold border-2 rounded focus:border-fed-blue focus:outline-none"
            />
          ))}
        </div>
        {err && <div className="text-destructive text-sm">{err}</div>}
        <div className="text-sm flex items-center justify-between">
          <span className="text-muted-foreground">
            {left > 0 ? <>Time left: <b className="text-fed-blue">{left}s</b></> : "OTP expired"}
          </span>
          <button
            disabled={left > 0}
            onClick={() => { setLeft(seconds); setDigits(Array(6).fill("")); onResend?.(); }}
            className="text-fed-blue disabled:text-muted-foreground/60 underline-offset-2 hover:underline"
          >
            Resend OTP
          </button>
        </div>
        <button
          onClick={submit}
          className="w-full bg-fed-blue hover:bg-fed-blue-dark text-white font-semibold py-2.5 rounded"
        >
          Verify & Continue
        </button>
      </div>
    </div>
  );
}