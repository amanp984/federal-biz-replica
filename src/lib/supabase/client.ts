/**
 * Supabase client scaffold — NOT YET CONNECTED.
 *
 * When ready to enable Lovable Cloud / Supabase:
 *   1. Provide VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY env vars.
 *   2. `bun add @supabase/supabase-js`.
 *   3. Replace the `null` export below with a real `createClient(...)` call.
 *
 * Until then, `supabase` is null and every service in `@/lib/services/*`
 * falls back to local in-memory data. No runtime calls are made.
 */

export const SUPABASE_URL: string | undefined = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_PUBLISHABLE_KEY: string | undefined =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

// Real client will be initialised here once credentials + SDK are added.
export const supabase: unknown = null;

export type SupabaseRealtimeUnsubscribe = () => void;