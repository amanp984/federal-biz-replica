import * as OTPAuth from "otpauth";

const SECRET_KEY = (uid: string) => `fedbiz_totp_secret_v1_${uid.toLowerCase()}`;
const FAIL_KEY = (uid: string) => `fedbiz_totp_fail_v1_${uid.toLowerCase()}`;

export const ISSUER = "FED BUSINESS";
export const MAX_ATTEMPTS = 5;
export const LOCK_MS = 5 * 60 * 1000;

export interface TotpBundle {
  base32: string;
  totp: OTPAuth.TOTP;
  uri: (userId: string) => string;
}

export function hasTotpSecret(userId: string): boolean {
  if (typeof window === "undefined") return false;
  return !!window.localStorage.getItem(SECRET_KEY(userId));
}

export function getTotpSecret(userId: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SECRET_KEY(userId));
}

export function saveTotpSecret(userId: string, secretBase32: string) {
  window.localStorage.setItem(SECRET_KEY(userId), secretBase32);
}

export function generateTotpSecret(): TotpBundle {
  const secret = new OTPAuth.Secret({ size: 20 });
  const base32 = secret.base32;
  return {
    base32,
    totp: makeTotp(base32),
    uri: (userId: string) =>
      new OTPAuth.TOTP({
        issuer: ISSUER,
        label: userId,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret,
      }).toString(),
  };
}

export function makeTotp(base32: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: ISSUER,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(base32),
  });
}

/** Validates code with ±1 window (±30s). Returns "ok" | "invalid" | "expired". */
export function verifyTotp(base32: string, code: string): "ok" | "invalid" | "expired" {
  const clean = code.replace(/\D/g, "");
  if (clean.length !== 6) return "invalid";
  const totp = makeTotp(base32);
  const delta = totp.validate({ token: clean, window: 1 });
  if (delta === null) return "invalid";
  // delta === -1 means the previous period was accepted (still within tolerance)
  return "ok";
}

export interface LockState {
  locked: boolean;
  remainingMs: number;
  attempts: number;
}

interface FailRecord {
  count: number;
  lockedUntil: number;
}

function readFail(userId: string): FailRecord {
  if (typeof window === "undefined") return { count: 0, lockedUntil: 0 };
  try {
    const raw = window.localStorage.getItem(FAIL_KEY(userId));
    if (!raw) return { count: 0, lockedUntil: 0 };
    return JSON.parse(raw) as FailRecord;
  } catch {
    return { count: 0, lockedUntil: 0 };
  }
}

function writeFail(userId: string, rec: FailRecord) {
  window.localStorage.setItem(FAIL_KEY(userId), JSON.stringify(rec));
}

export function getLockState(userId: string): LockState {
  const rec = readFail(userId);
  const now = Date.now();
  if (rec.lockedUntil > now) {
    return { locked: true, remainingMs: rec.lockedUntil - now, attempts: rec.count };
  }
  return { locked: false, remainingMs: 0, attempts: rec.count };
}

export function registerFailure(userId: string): LockState {
  const rec = readFail(userId);
  const now = Date.now();
  if (rec.lockedUntil > now) {
    return { locked: true, remainingMs: rec.lockedUntil - now, attempts: rec.count };
  }
  const count = rec.count + 1;
  if (count >= MAX_ATTEMPTS) {
    const lockedUntil = now + LOCK_MS;
    writeFail(userId, { count: 0, lockedUntil });
    return { locked: true, remainingMs: LOCK_MS, attempts: MAX_ATTEMPTS };
  }
  writeFail(userId, { count, lockedUntil: 0 });
  return { locked: false, remainingMs: 0, attempts: count };
}

export function clearFailures(userId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(FAIL_KEY(userId));
}

/** Format a base32 secret in 4-char groups for manual entry. */
export function formatSecret(base32: string): string {
  return base32.replace(/(.{4})/g, "$1 ").trim();
}