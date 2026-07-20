import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BankProfile {
  bankName: string;
  appName: string;
  websiteName: string;
  customerName: string;
  customerId: string;
  cif: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  branchAddress: string;
  bankAddress: string;
  accountType: string;
  mobile: string;
  email: string;
  kyc: string;
  pan: string;
  aadhaar: string;
  address: string;
  accountLimit: number;
}

export interface Branding {
  logoUrl: string | null;
  splashLogoUrl: string | null;
  loginLogoUrl: string | null;
  favicon: string | null;
  themePrimary: string;
  themeAccent: string;
}

export interface Creds {
  userId: string;
  password: string;
}

interface AdminConfigState {
  profile: BankProfile;
  branding: Branding;
  merchantCreds: Creds;
  adminCreds: Creds;
  totpEnabled: boolean;
  adminAuthed: boolean;
  updateProfile: (p: Partial<BankProfile>) => void;
  updateBranding: (b: Partial<Branding>) => void;
  updateMerchantCreds: (c: Partial<Creds>) => void;
  updateAdminCreds: (c: Partial<Creds>) => void;
  setTotpEnabled: (v: boolean) => void;
  loginAdmin: (userId: string, password: string) => boolean;
  logoutAdmin: () => void;
}

const DEFAULT_PROFILE: BankProfile = {
  bankName: "FED BUSINESS",
  appName: "FED BUSINESS",
  websiteName: "FED BUSINESS Corporate Workspace",
  customerName: "AMAN J",
  customerId: "FB10029384",
  cif: "CIF8472619",
  accountNumber: "99543369219460",
  ifsc: "FDRL0083457",
  branch: "Mumbai Main Office",
  branchAddress: "FED BUSINESS, Fort Office, Mumbai - 400001",
  bankAddress: "FED BUSINESS HQ, Fort, Mumbai - 400001",
  accountType: "Current",
  mobile: "+91 98******12",
  email: "ra*****@gmail.com",
  kyc: "KYC-9384-2019",
  pan: "ABCDE1234F",
  aadhaar: "XXXX-XXXX-1234",
  address: "Plot 21, Sector 14, Mumbai, Maharashtra - 400706",
  accountLimit: 5000000,
};

const DEFAULT_BRANDING: Branding = {
  logoUrl: null,
  splashLogoUrl: null,
  loginLogoUrl: null,
  favicon: null,
  themePrimary: "#004080",
  themeAccent: "#F58220",
};

export const useAdminConfig = create<AdminConfigState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      branding: DEFAULT_BRANDING,
      merchantCreds: { userId: "FED763390653", password: "Sohil@2026" },
      adminCreds: { userId: "admin", password: "USER1947" },
      totpEnabled: true,
      adminAuthed: false,
      updateProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      updateBranding: (b) => set((s) => ({ branding: { ...s.branding, ...b } })),
      updateMerchantCreds: (c) => set((s) => ({ merchantCreds: { ...s.merchantCreds, ...c } })),
      updateAdminCreds: (c) => set((s) => ({ adminCreds: { ...s.adminCreds, ...c } })),
      setTotpEnabled: (v) => set({ totpEnabled: v }),
      loginAdmin: (userId, password) => {
        const { adminCreds } = get();
        const ok = userId === adminCreds.userId && password === adminCreds.password;
        if (ok) set({ adminAuthed: true });
        return ok;
      },
      logoutAdmin: () => set({ adminAuthed: false }),
    }),
    {
      name: "fedbiz_admin_config_v1",
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        const state = (persisted ?? {}) as Partial<AdminConfigState>;
        if (version < 2) {
          state.merchantCreds = { userId: "FED763390653", password: "Sohil@2026" };
        }
        return state as AdminConfigState;
      },
    },
  ),
);

/** Snapshot helpers for non-React consumers. */
export const getMerchantCreds = () => useAdminConfig.getState().merchantCreds;
export const getBankProfile = () => useAdminConfig.getState().profile;
export const getBranding = () => useAdminConfig.getState().branding;