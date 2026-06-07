import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Phone, Calculator, HelpCircle, MoreHorizontal, Globe, RefreshCw } from "lucide-react";
import { FEDERAL_LOGO_FULL, FEDERAL_LOGO_HORIZONTAL } from "@/lib/logos";
import { useAuth, DEMO_CREDENTIALS } from "@/lib/auth-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FED BUSINESS — FED BUSINESS Corporate Workspace" },
      { name: "description", content: "Sign in to FED BUSINESS, FED BUSINESS's secure corporate workspace portal." },
      { property: "og:title", content: "FED BUSINESS — FED BUSINESS" },
      { property: "og:description", content: "Secure corporate workspace by FED BUSINESS." },
    ],
  }),
  component: LoginPage,
});

const CATEGORIES = [
  { title: "Personal Loan", desc: "Quick loans at competitive rates", color: "from-blue-500 to-blue-700" },
  { title: "Home Loan", desc: "Make your dream home a reality", color: "from-emerald-500 to-emerald-700" },
  { title: "Car Loan", desc: "Drive home your new car today", color: "from-orange-500 to-orange-700" },
  { title: "Credit Card", desc: "Exclusive rewards for FED BUSINESS users", color: "from-purple-500 to-purple-700" },
  { title: "Insurance", desc: "Protect what matters most", color: "from-rose-500 to-rose-700" },
  { title: "Investments", desc: "Grow wealth with smart options", color: "from-amber-500 to-amber-700" },
  { title: "FD Offers", desc: "Special rates on fixed deposits", color: "from-teal-500 to-teal-700" },
];

function LoginPage() {
  const navigate = useNavigate();
  const { setPending, isAuthenticated } = useAuth();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const [err, setErr] = useState("");
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/dashboard" });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setCaptchaCode(genCaptcha());
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % CATEGORIES.length), 3000);
    return () => clearInterval(t);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !password) return setErr("Please enter User ID and Password.");
    if (captcha.trim().toUpperCase() !== captchaCode) {
      setCaptchaCode(genCaptcha()); setCaptcha("");
      return setErr("Captcha does not match.");
    }
    // Demo creds gate
    if (userId.toLowerCase() !== DEMO_CREDENTIALS.userId || password !== DEMO_CREDENTIALS.password) {
      return setErr(`Invalid credentials. Demo: ${DEMO_CREDENTIALS.userId} / ${DEMO_CREDENTIALS.password}`);
    }
    setPending(userId);
    navigate({ to: "/otp" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Top utility bar */}
      <div className="bg-fed-blue text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-5 justify-end">
          <UtilLink icon={Phone} label="Contact Us" />
          <UtilLink icon={Calculator} label="Calculator" />
          <UtilLink icon={HelpCircle} label="Help" />
          <UtilLink icon={MoreHorizontal} label="More" />
          <div className="flex items-center gap-1 cursor-pointer hover:opacity-90">
            <Globe size={14} /> <span>English</span>
          </div>
        </div>
      </div>

      {/* Brand bar */}
      <div className="bg-white border-b-4 border-fed-orange shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <img src={FEDERAL_LOGO_HORIZONTAL} alt="FED BUSINESS" className="h-10 w-auto" />
          <div className="border-l border-border h-8" />
          <div>
            <div className="text-lg font-bold text-fed-blue tracking-wide">FED BUSINESS</div>
            <div className="text-[11px] text-muted-foreground -mt-0.5">Corporate Workspace</div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
        {/* Left: ads + info */}
        <div className="space-y-5">
          <div className="bg-fed-blue text-white rounded-md p-6 border-b-4 border-fed-orange shadow">
            <h2 className="text-2xl font-bold mb-1">Welcome to FED BUSINESS</h2>
            <p className="text-sm opacity-90">
              FED BUSINESS's secure corporate workspace platform. Manage accounts, transfers, and payments — anywhere, anytime.
            </p>
          </div>

          {/* Ad carousel */}
          <div className="relative h-56 rounded-md overflow-hidden shadow border">
            {CATEGORIES.map((c, i) => (
              <div
                key={c.title}
                className={`absolute inset-0 transition-opacity duration-700 bg-gradient-to-br ${c.color} text-white p-8 flex flex-col justify-end ${
                  i === slide ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="text-xs uppercase tracking-widest opacity-80">Featured</div>
                <div className="text-2xl font-bold">{c.title}</div>
                <div className="text-sm opacity-90 mt-1">{c.desc}</div>
              </div>
            ))}
            <div className="absolute bottom-3 right-4 flex gap-1.5 z-10">
              {CATEGORIES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className={`w-2 h-2 rounded-full ${i === slide ? "bg-white" : "bg-white/40"}`}
                />
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-md p-5 text-sm grid grid-cols-2 gap-2">
            <InfoLink>Security Information</InfoLink>
            <InfoLink>Terms & Conditions</InfoLink>
            <InfoLink>Privacy Policy</InfoLink>
            <InfoLink>Disclaimer</InfoLink>
          </div>
        </div>

        {/* Right: login card */}
        <div className="bg-white rounded-md shadow-md border overflow-hidden self-start">
          <div className="bg-fed-blue text-white px-6 py-4 border-b-4 border-fed-orange flex items-center gap-3">
            <img src={FEDERAL_LOGO_FULL} alt="" className="w-10 h-10 bg-white rounded p-1" />
            <div>
              <div className="font-bold text-lg leading-tight">Sign in to FED BUSINESS</div>
              <div className="text-xs opacity-85">Use your corporate credentials</div>
            </div>
          </div>
          <form onSubmit={submit} className="p-6 space-y-4">
            <Field label="User ID">
              <input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your User ID"
                className="w-full border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-fed-blue"
              />
            </Field>
            <Field label="Password">
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border rounded px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-fed-blue"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-fed-blue"
                  aria-label="Toggle password"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>
            <Field label="Captcha">
              <div className="flex gap-2 items-center">
                <div className="px-4 py-2 select-none bg-gradient-to-r from-fed-blue/10 to-fed-orange/10 border rounded font-mono text-base tracking-[0.4em] font-bold text-fed-blue line-through">
                  {captchaCode}
                </div>
                <button
                  type="button"
                  onClick={() => setCaptchaCode(genCaptcha())}
                  className="p-2 text-muted-foreground hover:text-fed-blue border rounded"
                  title="Refresh captcha"
                >
                  <RefreshCw size={16} />
                </button>
                <input
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                  placeholder="Enter captcha"
                  className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fed-blue"
                />
              </div>
            </Field>

            {err && <div className="text-destructive text-sm">{err}</div>}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                className="flex-1 bg-fed-blue hover:bg-fed-blue-dark text-white font-semibold py-2.5 rounded transition"
              >
                Login
              </button>
              <button
                type="button"
                className="flex-1 border-2 border-fed-blue text-fed-blue hover:bg-fed-blue hover:text-white font-semibold py-2.5 rounded transition"
              >
                Register
              </button>
            </div>

            <div className="text-xs text-muted-foreground pt-2 text-center border-t mt-3">
              Powered by <span className="font-semibold text-fed-blue">FED BUSINESS</span>
            </div>
          </form>
        </div>
      </div>

      <footer className="bg-fed-blue text-white text-xs text-center py-3">
        © {new Date().getFullYear()} FED BUSINESS — FED BUSINESS Corporate Workspace.
      </footer>
    </div>
  );
}

function UtilLink({ icon: Icon, label }: { icon: React.ComponentType<{ size?: number }>; label: string }) {
  return (
    <button className="flex items-center gap-1 hover:underline">
      <Icon size={14} /> <span>{label}</span>
    </button>
  );
}
function InfoLink({ children }: { children: React.ReactNode }) {
  return (
    <Link to="/" className="text-fed-blue hover:underline">
      {children}
    </Link>
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
function genCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
