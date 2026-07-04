import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import {
  getCookie,
  setCookie,
  deleteCookie,
} from "@tanstack/react-start/server";

const COOKIE_NAME = "fb_demo_sess";
const MAX_AGE = 60 * 60 * 8; // 8 hours

function getSecret(): string {
  const s = process.env.WEBHOOK_SECRET;
  if (!s || s.length < 16) {
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