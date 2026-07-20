/**
 * Auth abstraction layer. Currently backed by the local zustand demo store;
 * swap the internals for Supabase Auth without changing call sites.
 */
import { useAuth, DEMO_CREDENTIALS, DEMO_USER, type User } from "@/lib/auth-store";
import { endDemoSession } from "@/lib/demo-session.functions";

export interface AuthService {
  signIn(userId: string, password: string): Promise<{ user: User } | { error: string }>;
  signOut(): Promise<void>;
  currentUser(): User | null;
}

export const authService: AuthService = {
  async signIn(userId, password) {
    if (userId !== DEMO_CREDENTIALS.userId || password !== DEMO_CREDENTIALS.password) {
      return { error: "Invalid credentials" };
    }
    return { user: { ...DEMO_USER, userId } };
  },
  async signOut() {
    try {
      await endDemoSession();
    } catch {
      // Best-effort cookie clear; ignore network errors on sign-out.
    }
    useAuth.getState().logout();
  },
  currentUser() {
    return useAuth.getState().user;
  },
};