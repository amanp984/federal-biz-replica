import { createServerFn } from "@tanstack/react-start";

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

async function guardedAdmin(action: string) {
  const { assertAdminSession } = await import("@/lib/admin-session.server");
  const admin = assertAdminSession(action);
  const { supabaseAdmin } = await import(
    "@/integrations/supabase/client.server"
  );
  return { supabaseAdmin, admin };
}

export const adminUpsertTransaction = createServerFn({ method: "POST" })
  .inputValidator((data: TxnPayload) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin, admin } = await guardedAdmin("adminUpsertTransaction");
    console.log("[admin-api] upsert request", {
      userId: admin.userId,
      mode: data.id ? "update" : "insert",
      utr: data.utr_number,
    });
    if (data.id) {
      const { id, ...rest } = data;
      const { error } = await supabaseAdmin
        .from("bank_transactions")
        .update(rest)
        .eq("id", id);
      if (error) {
        console.error("[admin-api] update failed", { id, error: error.message });
        throw new Error(error.message);
      }
      console.log("[admin-api] update success", { id });
      return { ok: true, id };
    }
    const { data: row, error } = await supabaseAdmin
      .from("bank_transactions")
      .insert(data)
      .select("id")
      .single();
    if (error) {
      console.error("[admin-api] insert failed", { error: error.message });
      throw new Error(error.message);
    }
    console.log("[admin-api] insert success", { id: row?.id });
    return { ok: true, id: row?.id };
  });

export const adminDeleteTransaction = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin, admin } = await guardedAdmin("adminDeleteTransaction");
    console.log("[admin-api] delete request", { userId: admin.userId, id: data.id });
    const { error } = await supabaseAdmin
      .from("bank_transactions")
      .delete()
      .eq("id", data.id);
    if (error) {
      console.error("[admin-api] delete failed", { id: data.id, error: error.message });
      throw new Error(error.message);
    }
    console.log("[admin-api] delete success", { id: data.id });
    return { ok: true };
  });
