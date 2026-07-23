import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import {
  deleteCookie,
  getCookie,
  getRequest,
  getRequestHeader,
  setCookie,
} from "@tanstack/react-start/server";

const COOKIE_NAME = "fb_admin_sess";
const MAX_AGE = 60 * 60 * 8; // 8 hours

function getSecret(): string {
  const s =
    process.env.DEMO_SESSION_SECRET ||
    process.env.WEBHOOK_SECRET ||
    "fed-business-admin-session-dev-secret-please-override";
  if (s.length < 16) return (s + "0000000000000000").slice(0, 32);
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function makeAuthError(reason: string) {
  const err = new Error(reason) as Error & { statusCode?: number };
  err.statusCode = 401;
  return err;
}

function parseAdminToken(token: string): { userId: string } {
  const [payload, mac] = token.split(".");
  if (!payload || !mac) throw makeAuthError("admin_session_malformed");

  const expected = sign(payload);
  const a = Buffer.from(mac, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw makeAuthError("admin_session_invalid_signature");
  }

  let decoded: { userId?: unknown; exp?: unknown };
  try {
    decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    throw makeAuthError("admin_session_invalid_payload");
  }

  if (typeof decoded.userId !== "string" || !decoded.userId) {
    throw makeAuthError("admin_session_missing_user_id");
  }
  if (typeof decoded.exp !== "number" || decoded.exp < Date.now()) {
    throw makeAuthError("admin_session_expired");
  }
  return { userId: decoded.userId };
}

export function issueAdminSessionCookie(userId: string): void {
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      nonce: randomBytes(16).toString("hex"),
      exp: Date.now() + MAX_AGE * 1000,
    }),
  ).toString("base64url");
  const token = `${payload}.${sign(payload)}`;
  setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearAdminSessionCookie(): void {
  deleteCookie(COOKIE_NAME, { path: "/" });
}

export function assertAdminSession(action: string): { userId: string } {
  const request = getRequest();
  const cookie = getCookie(COOKIE_NAME);
  const authHeader = getRequestHeader("authorization");
  const cookieHeader = getRequestHeader("cookie");

  console.log("[admin-auth] request", {
    action,
    sent: true,
    url: request.url,
    method: request.method,
    hasAuthorizationHeader: Boolean(authHeader),
    hasCookieHeader: Boolean(cookieHeader),
    hasAdminSessionCookie: Boolean(cookie),
  });

  if (!cookie) {
    console.warn("[admin-auth] denied", {
      action,
      reason: "admin_session_cookie_missing",
    });
    throw makeAuthError("admin_session_cookie_missing");
  }

  const result = parseAdminToken(cookie);
  console.log("[admin-auth] accepted", { action, userId: result.userId });
  return result;
}
