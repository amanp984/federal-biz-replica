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
  lastActivity: number;
  login: (user: User) => void;
  logout: () => void;
  touch: () => void;
}

const DEMO_USER: User = {
  userId: "Ram825520",
  customerName: "AMAN J",
  customerId: "FB10029384",
  cif: "CIF8472619",
  accountNumber: "99980128569460",
  ifsc: "FDRL0083457",
  branch: "Mumbai Main Office",
  branchAddress: "FED BUSINESS, Fort Office, Mumbai - 400001",
  accountType: "Current",
  mobile: "+91 98******12",
  email: "ra*****@gmail.com",
  kyc: "KYC-9384-2019",
  address: "Plot 21, Sector 14, Mumbai, Maharashtra - 400706",
  accountLimit: 5000000,
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  lastActivity: Date.now(),
  login: (user) =>
    set({ user, isAuthenticated: true, lastActivity: Date.now() }),
  logout: () =>
    set({ user: null, isAuthenticated: false }),
  touch: () => set({ lastActivity: Date.now() }),
}));

export const DEMO_CREDENTIALS = { userId: "Ram825520", password: "Guru@1999" };
export { DEMO_USER };