/**
 * Format a date as DD/MM/YYYY with leading zeros.
 * Accepts a Date, ISO string, or timestamp.
 */
export function formatDDMMYYYY(input: Date | string | number): string {
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}