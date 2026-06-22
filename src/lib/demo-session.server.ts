import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import {
  getCookie,
  setCookie,
  deleteCookie,
} from "@tanstack/react-start/server";

const COOKIE_NAME = "fb_demo_sess";
const MAX_AGE = 60 * 60 * 8; // 8 hours

function getSecret(): string {
  // Prefer an app-scoped secret if set, otherwise fall back to other
  // server-only secrets that are reliably available in the Worker runtime.
  // The Supabase Edge Function `WEBHOOK_SECRET` is NOT injected into the
  // TanStack Start server, so relying on it alone breaks login.
  const s =
    process.env.DEMO_SESSION_SECRET ||
    process.env.WEBHOOK_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    "";
  if (!s || s.length < 16) {
    console.error(
      "[demo-session] No signing secret available in process.env (checked DEMO_SESSION_SECRET, WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_PUBLISHABLE_KEY).",
    );
    throw new Error("server_misconfigured");
  }
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function isValidToken(token: string): boolean {
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return false;
  let expected: string;
  try {
    expected = sign(payload);
  } catch {
    return false;
  }
  const a = Buffer.from(mac, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function issueDemoSessionCookie(): void {
  const payload = `${Date.now()}.${randomBytes(16).toString("hex")}`;
  const token = `${payload}.${sign(payload)}`;
  setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearDemoSessionCookie(): void {
  deleteCookie(COOKIE_NAME, { path: "/" });
}

export function assertDemoSession(): void {
  const token = getCookie(COOKIE_NAME);
  if (!token || !isValidToken(token)) {
    const err = new Error("unauthorized") as Error & { statusCode?: number };
    err.statusCode = 401;
    throw err;
  }
}