import { create } from "zustand";

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

const DEMO_USER: User = {
  userId: "FEDBIZ001",
  customerName: "ANJAN JATASHANKAR PRAJAPATI",
  customerId: "FB10029384",
  cif: "CIF8472619",
  accountNumber: "99980128562266",
  ifsc: "FDRL0001234",
  branch: "Mumbai Main Branch",
  branchAddress: "Federal Bank, Fort Branch, Mumbai - 400001",
  accountType: "Savings",
  mobile: "+91 98******12",
  email: "ra*****@gmail.com",
  kyc: "KYC-9384-2019",
  address: "Plot 21, Sector 14, Mumbai, Maharashtra - 400706",
  accountLimit: 5000000,
};

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

export const DEMO_CREDENTIALS = { userId: "fedbiz", password: "fedbiz123" };
export { DEMO_USER };