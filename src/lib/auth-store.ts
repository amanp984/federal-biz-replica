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
  userId: "Fed99265419",
  customerName: "AMAN J",
  customerId: "Fed99265419",
  cif: "CIF864399782",
  accountNumber: "3755684427690",
  ifsc: "FDRL0085586",
  branch: "Mumbai Main Office",
  branchAddress: "FED BUSINESS, Fort Office, Mumbai - 400001",
  accountType: "Current",
  mobile: "+91 9873225439",
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

export const DEMO_CREDENTIALS = { userId: "Fed99265419", password: "Praja@1999" };
export { DEMO_USER };