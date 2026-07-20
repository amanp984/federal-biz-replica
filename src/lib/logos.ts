import fullLogo from "@/assets/federal-bank-full.asset.json";
import horizontalLogo from "@/assets/federal-bank-horizontal.asset.json";
import { getBranding } from "@/lib/admin-config";

const DEFAULT_FULL = (fullLogo as { url: string }).url;
const DEFAULT_HORIZONTAL = (horizontalLogo as { url: string }).url;

// Legacy string exports — read live from admin-config on each access via a Proxy-like getter.
// Consumers use these as `src` attributes at render time; because they're evaluated per-render
// (through the getters below), branding overrides propagate on next render/refresh.
export const FEDERAL_LOGO_FULL: string = new Proxy({} as { toString(): string }, {
  get() { return getBranding().logoUrl || DEFAULT_FULL; },
}) as unknown as string;
export const FEDERAL_LOGO_HORIZONTAL: string = new Proxy({} as { toString(): string }, {
  get() { return getBranding().loginLogoUrl || getBranding().logoUrl || DEFAULT_HORIZONTAL; },
}) as unknown as string;

export function resolveFullLogo(): string {
  return getBranding().logoUrl || DEFAULT_FULL;
}
export function resolveHorizontalLogo(): string {
  return getBranding().loginLogoUrl || getBranding().logoUrl || DEFAULT_HORIZONTAL;
}