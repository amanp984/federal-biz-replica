/**
 * Parse Indian bank SMS messages into bank_transactions row shape.
 * Heuristic regexes — covers most major bank formats (HDFC, SBI, ICICI, Axis,
 * Federal, Kotak) for UPI / IMPS / NEFT / RTGS credit & debit alerts.
 */

export interface ParsedSms {
  transaction_date: string; // YYYY-MM-DD
  transaction_type: "CREDIT" | "DEBIT";
  payment_mode: "UPI" | "IMPS" | "NEFT" | "RTGS";
  account_holder_name: string;
  utr_number: string;
  beneficiary_account_last_digits: string | null;
  amount: number;
}

const CREDIT_WORDS = /\b(credited|credit|received|deposited|added to)\b/i;
const DEBIT_WORDS = /\b(debited|debit|withdrawn|paid|sent|spent|purchase|txn of)\b/i;

function detectMode(msg: string): ParsedSms["payment_mode"] | null {
  if (/\bUPI\b/i.test(msg) || /VPA|@ok|@ybl|@axl|@paytm|@upi/i.test(msg)) return "UPI";
  if (/\bIMPS\b/i.test(msg)) return "IMPS";
  if (/\bNEFT\b/i.test(msg)) return "NEFT";
  if (/\bRTGS\b/i.test(msg)) return "RTGS";
  return null;
}

function detectType(msg: string): ParsedSms["transaction_type"] | null {
  if (CREDIT_WORDS.test(msg)) return "CREDIT";
  if (DEBIT_WORDS.test(msg)) return "DEBIT";
  return null;
}

function extractAmount(msg: string): number | null {
  const m =
    msg.match(/(?:INR|Rs\.?|₹)\s*([0-9,]+(?:\.\d{1,2})?)/i) ||
    msg.match(/\b([0-9,]+\.\d{2})\b/);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function extractUtr(msg: string): string | null {
  // Look for explicit labels first
  const labeled = msg.match(
    /(?:UTR|RRN|Ref(?:erence)?(?:\s*No\.?)?|Txn(?:\s*ID)?|IMPS\s*Ref|UPI\s*Ref(?:\s*No)?)[\s:.#-]*([A-Z0-9]{8,})/i,
  );
  if (labeled) return labeled[1].toUpperCase();
  // Fallback: any 10-22 digit numeric token
  const num = msg.match(/\b(\d{10,22})\b/);
  return num ? num[1] : null;
}

function extractName(msg: string): string {
  // "to NAME", "from NAME", "by NAME" — case-insensitive, stop at next field.
  const m = msg.match(
    /\b(?:to|from|by|frm)\s+([A-Za-z][A-Za-z .'-]{1,60}?)(?=\s+(?:on|via|UPI|IMPS|NEFT|RTGS|Ref|UTR|A\/c|Acc)\b|\s*[.,-]|\s*$)/i,
  );
  if (m) return m[1].trim().replace(/\s+/g, " ").toUpperCase();
  // VPA like "name@bank"
  const vpa = msg.match(/\b([a-zA-Z0-9._-]{2,})@[a-zA-Z]{2,}\b/);
  if (vpa) return vpa[1].replace(/[._-]/g, " ").toUpperCase();
  return "UNKNOWN";
}

function extractBeneficiaryLast(msg: string): string | null {
  // Prefer the beneficiary account after "to A/c" / "to ... A/c XX####".
  const to = msg.match(/\bto\b[\s\S]{0,80}?A\/c[^\d]*([Xx*]{2,}\s*)?(\d{3,6})\b/i);
  if (to) return to[2];
  const m =
    msg.match(/(?:A\/c|Acc(?:ount)?)[^\d]*([Xx*]{2,}\s*)?(\d{3,6})\b/i) ||
    msg.match(/\bXX+(\d{3,6})\b/i) ||
    msg.match(/\*{2,}(\d{3,6})\b/);
  return m ? m[m.length - 1] : null;
}

export function parseSms(message: string, timestamp?: string): ParsedSms | null {
  if (!message || typeof message !== "string") return null;
  const msg = message.replace(/\s+/g, " ").trim();

  const transaction_type = detectType(msg);
  const payment_mode = detectMode(msg);
  const amount = extractAmount(msg);
  if (!transaction_type || !payment_mode || amount == null) return null;

  const utr_number = extractUtr(msg) ?? `SMS${Date.now()}`;
  const account_holder_name = extractName(msg);
  const beneficiary_account_last_digits = extractBeneficiaryLast(msg);

  const d = timestamp ? new Date(Number(timestamp) || timestamp) : new Date();
  const transaction_date = (Number.isNaN(d.getTime()) ? new Date() : d)
    .toISOString()
    .slice(0, 10);

  return {
    transaction_date,
    transaction_type,
    payment_mode,
    account_holder_name,
    utr_number,
    beneficiary_account_last_digits,
    amount,
  };
}