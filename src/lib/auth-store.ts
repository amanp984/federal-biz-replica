import { create } from "zustand";
import { getBankProfile } from "@/lib/admin-config";

export interface User {
  userId: string;
  customerName: string;
  customerId: string;
  cif: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  branchAddress: string;
  accountType: string;
  mobile: string;
  email: string;
  kyc: string;
  address: string;
  accountLimit: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  pendingUserId: string | null;
  lastActivity: number;
  setPending: (userId: string) => void;
  login: (user: User) => void;
  logout: () => void;
  touch: () => void;
}

/**
 * Build the live merchant user from the admin-config store so that any
 * profile edit made from the admin workspace propagates to every screen.
 * Legacy `DEMO_USER` export mirrors this at module load for backwards compat.
 */
export function buildDemoUser(userId?: string): User {
  const p = getBankProfile();
  return {
    userId: userId || "FEDBIZ001",
    customerName: p.customerName,
    customerId: p.customerId,
    cif: p.cif,
    accountNumber: p.accountNumber,
    ifsc: p.ifsc,
    branch: p.branch,
    branchAddress: p.branchAddress,
    accountType: p.accountType,
    mobile: p.mobile,
    email: p.email,
    kyc: p.kyc,
    address: p.address,
    accountLimit: p.accountLimit,
  };
}

const DEMO_USER: User = buildDemoUser();

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  pendingUserId: null,
  lastActivity: Date.now(),
  setPending: (userId) => set({ pendingUserId: userId }),
  login: (user) =>
    set({ user, isAuthenticated: true, lastActivity: Date.now(), pendingUserId: null }),
  logout: () =>
    set({ user: null, isAuthenticated: false, pendingUserId: null }),
  touch: () => set({ lastActivity: Date.now() }),
}));

export const DEMO_CREDENTIALS = { userId: "fedbusiness", password: "fedbusiness123" };
export { DEMO_USER };