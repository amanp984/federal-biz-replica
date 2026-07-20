import { createServerFn } from "@tanstack/react-start";
import { parseSms } from "@/lib/sms-parser";

export interface TxnPayload {
  id?: string;
  transaction_date: string;
  transaction_type: "CREDIT" | "DEBIT";
  payment_mode: string;
  account_holder_name: string;
  utr_number: string;
  beneficiary_account_last_digits: string | null;
  amount: number;
  created_at?: string;
}

async function guardedAdmin() {
  const { assertDemoSession } = await import("@/lib/demo-session.server");
  assertDemoSession();
  const { supabaseAdmin } = await import(
    "@/integrations/supabase/client.server"
  );
  return supabaseAdmin;
}

export const adminUpsertTransaction = createServerFn({ method: "POST" })
  .inputValidator((data: TxnPayload) => data)
  .handler(async ({ data }) => {
    const supabase = await guardedAdmin();
    if (data.id) {
      const { id, ...rest } = data;
      const { error } = await supabase
        .from("bank_transactions")
        .update(rest)
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { ok: true, id };
    }
    const { data: row, error } = await supabase
      .from("bank_transactions")
      .insert(data)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row?.id };
  });

export const adminDeleteTransaction = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const supabase = await guardedAdmin();
    const { error } = await supabase
      .from("bank_transactions")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminIngestSms = createServerFn({ method: "POST" })
  .inputValidator((data: { message: string }) => data)
  .handler(async ({ data }) => {
    const supabase = await guardedAdmin();
    const parsed = parseSms(data.message);
    if (!parsed) {
      return { ok: false, error: "Could not parse SMS. Check format." };
    }
    // Dedup by UTR
    const { data: existing } = await supabase
      .from("bank_transactions")
      .select("id")
      .eq("utr_number", parsed.utr_number)
      .maybeSingle();
    if (existing) {
      return { ok: false, error: `Duplicate UTR ${parsed.utr_number} — transaction already exists.` };
    }
    const { data: row, error } = await supabase
      .from("bank_transactions")
      .insert(parsed)
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: row?.id, parsed };
  });