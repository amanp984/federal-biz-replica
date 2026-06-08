import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Wallet, ArrowLeftRight, Users, Receipt, Smartphone,
  PiggyBank, Landmark, CreditCard, TrendingUp, ShieldCheck, FileText,
  Building2, Settings, HelpCircle, LogOut, Bell, RefreshCw, Search,
  User as UserIcon, Menu, X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { FEDERAL_LOGO_HORIZONTAL, FEDERAL_LOGO_FULL } from "@/lib/logos";
import { LoadingOverlay, useRouteLoading } from "./LoadingOverlay";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/accounts", label: "Accounts", icon: Wallet },
  { to: "/fund-transfer", label: "Fund Transfer", icon: ArrowLeftRight },
  { to: "/beneficiaries", label: "Beneficiaries", icon: Users },
  { to: "/pay-bills", label: "Pay Bills", icon: Receipt },
  { to: "/mobile-recharge", label: "Mobile Recharge", icon: Smartphone },
  { to: "/deposits", label: "Deposits", icon: PiggyBank },
  { to: "/loans", label: "Loans", icon: Landmark },
  { to: "/cards", label: "Cards", icon: CreditCard },
  { to: "/investments", label: "Investments", icon: TrendingUp },
  { to: "/insurance", label: "Insurance", icon: ShieldCheck },
  { to: "/government-schemes", label: "Government Schemes", icon: Building2 },
  { to: "/statements", label: "Statements", icon: FileText },
  { to: "/bank-statement", label: "Bank Statement", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/support", label: "Support", icon: HelpCircle },
] as const;

const IDLE_MS = 3 * 60 * 1000;

export function AppShell() {
  const { user, isAuthenticated, logout, touch } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const loading = useRouteLoading(700);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) navigate({ to: "/" });
  }, [isAuthenticated, navigate]);

  // Auto-logout on inactivity
  useEffect(() => {
    if (!isAuthenticated) return;
    let timer = window.setTimeout(doLogout, IDLE_MS);
    const reset = () => {
      touch();
      window.clearTimeout(timer);
      timer = window.setTimeout(doLogout, IDLE_MS);
    };
    const evs = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    evs.forEach((e) => window.addEventListener(e, reset));
    function doLogout() {
      logout();
      navigate({ to: "/" });
    }
    return () => {
      window.clearTimeout(timer);
      evs.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [isAuthenticated, logout, navigate, touch]);

  // Logout on refresh / tab close — sessionStorage marker
  useEffect(() => {
    if (!isAuthenticated) return;
    const marker = sessionStorage.getItem("fedbiz_session");
    if (!marker) {
      // first paint after a fresh load → no in-memory state existed before, so this branch
      // only fires when state was rehydrated; for our zustand (no persist), reload clears it anyway.
      sessionStorage.setItem("fedbiz_session", "1");
    }
    const onUnload = () => sessionStorage.removeItem("fedbiz_session");
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [isAuthenticated]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-secondary">
      <LoadingOverlay show={loading} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-fed-blue text-white shadow-md border-b-4 border-fed-orange">
        <div className="flex items-center h-16 px-3 md:px-5 gap-3">
          <button
            className="lg:hidden p-2 rounded hover:bg-white/10"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <img src={FEDERAL_LOGO_HORIZONTAL} alt="FED BUSINESS" className="h-9 w-auto bg-white px-2 py-1 rounded-sm" />
          <span className="hidden md:inline text-xs uppercase tracking-widest opacity-90 border-l border-white/30 pl-3 ml-1">
            FED BUSINESS
          </span>
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-1">
            <IconBtn title="Support"><HelpCircle size={18} /></IconBtn>
            <IconBtn title="Refresh" onClick={() => location.reload()}><RefreshCw size={18} /></IconBtn>
            <IconBtn title="Notifications">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 bg-fed-orange text-[10px] rounded-full w-4 h-4 grid place-items-center">0</span>
            </IconBtn>
          </div>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 pl-3 ml-1 border-l border-white/30 hover:opacity-90"
          >
            <div className="w-9 h-9 rounded-full bg-white/15 grid place-items-center">
              <UserIcon size={18} />
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-xs font-semibold truncate max-w-[160px]">{user.customerName}</div>
              <div className="text-[10px] opacity-80">Last Login: {new Date().toLocaleString("en-IN")}</div>
            </div>
          </button>
        </div>

        {profileOpen && (
          <div className="absolute right-3 top-16 mt-2 w-80 bg-white text-foreground rounded-md shadow-xl border z-50 overflow-hidden">
            <div className="bg-fed-blue text-white p-4 flex items-center gap-3">
              <img src={FEDERAL_LOGO_FULL} alt="" className="w-10 h-10 bg-white rounded p-1" />
              <div>
                <div className="font-semibold text-sm">{user.customerName}</div>
                <div className="text-xs opacity-80">{user.customerId}</div>
              </div>
            </div>
            <dl className="text-xs p-4 space-y-2">
              <Row k="CIF" v={user.cif} />
              <Row k="Account No." v={user.accountNumber} />
              <Row k="IFSC" v={user.ifsc} />
              <Row k="Mobile" v={user.mobile} />
              <Row k="Email" v={user.email} />
            </dl>
            <button
              onClick={handleLogout}
              className="w-full p-3 text-sm bg-secondary hover:bg-fed-sidebar-hover flex items-center justify-center gap-2 border-t"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${mobileOpen ? "fixed inset-0 top-16 z-30 block" : "hidden"} lg:block lg:sticky lg:top-16 lg:self-start w-64 bg-fed-sidebar border-r min-h-[calc(100vh-4rem)] overflow-y-auto`}
        >
          <nav className="py-2">
            {NAV.map((item) => {
              const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-5 py-3 text-sm border-l-4 transition ${
                    active
                      ? "bg-white border-fed-orange text-fed-blue font-semibold"
                      : "border-transparent text-foreground/80 hover:bg-fed-sidebar-hover"
                  }`}
                >
                  <Icon size={18} />
                  <span className="uppercase tracking-wide text-xs">{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-3 text-sm border-l-4 border-transparent text-destructive hover:bg-fed-sidebar-hover"
            >
              <LogOut size={18} />
              <span className="uppercase tracking-wide text-xs">Logout</span>
            </button>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 p-4 md:p-6 bg-secondary">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function IconBtn({ children, title, onClick }: { children: React.ReactNode; title: string; onClick?: () => void }) {
  return (
    <button title={title} onClick={onClick} className="relative p-2 rounded-full hover:bg-white/10">
      {children}
    </button>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium text-right">{v}</dd>
    </div>
  );
}