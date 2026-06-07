/**
 * SMS-forwarded transaction ingestion stub. A webhook (e.g. forwarded by a
 * mobile companion app) will POST raw SMS bodies; this service parses them
 * into normalized Transaction rows and stores them via Supabase.
 */
import type { Transaction } from "@/lib/transactions-store";

export interface RawSmsPayload {
  sender: string;
  body: string;
  receivedAt: string; // ISO
}

export const smsIngestService = {
  /** Parse a raw SMS into a partial Transaction. Returns null if unrecognised. */
  parse(_sms: RawSmsPayload): Omit<Transaction, "id"> | null {
    // TODO: real regex-based parsers per bank format.
    return null;
  },
  /** Send a raw SMS payload to the backend for storage + realtime fan-out. */
  async ingest(_sms: RawSmsPayload): Promise<void> {
    // TODO: call POST /api/public/sms-webhook once Supabase + server route exist.
  },
};