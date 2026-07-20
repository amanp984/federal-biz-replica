import fullLogo from "@/assets/federal-bank-full.asset.json";
import horizontalLogo from "@/assets/federal-bank-horizontal.asset.json";
import { getBranding } from "@/lib/admin-config";

const DEFAULT_FULL = (fullLogo as { url: string }).url;
const DEFAULT_HORIZONTAL = (horizontalLogo as { url: string }).url;

/**
 * Legacy exports evaluate at module load. Admin overrides applied on next full
 * refresh; ProfileEditor tells the user to reload. Dynamic consumers should
 * call resolveFullLogo/resolveHorizontalLogo at render time.
 */
const b = getBranding();
export const FEDERAL_LOGO_FULL: string = b.logoUrl || DEFAULT_FULL;
export const FEDERAL_LOGO_HORIZONTAL: string = b.loginLogoUrl || b.logoUrl || DEFAULT_HORIZONTAL;

export function resolveFullLogo(): string {
  return getBranding().logoUrl || DEFAULT_FULL;
}
export function resolveHorizontalLogo(): string {
  return getBranding().loginLogoUrl || getBranding().logoUrl || DEFAULT_HORIZONTAL;
}