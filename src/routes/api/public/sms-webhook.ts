import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { parseSms } from "@/lib/sms-parser";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-webhook-secret",
} as const;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

const DirectTxn = z.object({
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  transaction_type: z.enum(["CREDIT", "DEBIT"]),
  payment_mode: z.enum(["UPI", "IMPS", "NEFT", "RTGS"]),
  account_holder_name: z.string().min(1).max(120),
  utr_number: z.string().min(4).max(40),
  beneficiary_account_last_digits: z
    .string()
    .regex(/^\d{3,6}$/)
    .nullable()
    .optional(),
  amount: z.number().positive().max(1e11),
});

const SmsPayload = z.object({
  message: z.string().min(3).max(2000),
  sender: z.string().max(80).optional(),
  id: z.union([z.string(), z.number()]).optional(),
  timestamp: z.union([z.string(), z.number()]).optional(),
});

export const Route = createFileRoute("/api/public/sms-webhook")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),

      GET: async () =>
        json({
          ok: true,
          endpoint: "/api/public/sms-webhook",
          method: "POST",
          required_header: "x-webhook-secret: <your secret>",
          accepts: ["Direct transaction JSON", "SMS forwarder JSON"],
        }),

      POST: async ({ request }) => {
        const secret = request.headers.get("x-webhook-secret");
        const expected = process.env.WEBHOOK_SECRET;
        if (!expected) {
          console.error("[sms-webhook] WEBHOOK_SECRET not configured");
          return json({ ok: false, error: "server_misconfigured" }, 500);
        }
        if (!secret || secret !== expected) {
          return json({ ok: false, error: "unauthorized" }, 401);
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json({ ok: false, error: "invalid_json" }, 400);
        }

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        // Direct transaction shape
        const direct = DirectTxn.safeParse(body);
        if (direct.success) {
          const { error, data } = await supabaseAdmin
            .from("bank_transactions")
            .insert(direct.data)
            .select()
            .single();
          if (error) {
            if ((error as { code?: string }).code === "23505") {
              return json({ ok: false, error: "duplicate_utr", utr_number: direct.data.utr_number }, 409);
            }
            console.error("[sms-webhook] insert error", error);
            return json({ ok: false, error: "database_error" }, 500);
          }
          console.log("[sms-webhook] direct insert", data.id);
          return json({ ok: true, source: "direct", transaction: data }, 201);
        }

        // SMS forwarder shape
        const sms = SmsPayload.safeParse(body);
        if (!sms.success) {
          return json(
            {
              ok: false,
              error: "invalid_payload",
              details: sms.error.flatten(),
              hint: "Send either a direct transaction JSON or { message, sender, timestamp }",
            },
            400,
          );
        }

        const ts =
          typeof sms.data.timestamp === "number"
            ? String(sms.data.timestamp)
            : sms.data.timestamp;
        const parsed = parseSms(sms.data.message, ts);
        if (!parsed) {
          console.warn("[sms-webhook] unparseable sms", {
            sender: sms.data.sender,
            preview: sms.data.message.slice(0, 80),
          });
          return json(
            {
              ok: false,
              error: "unparseable_sms",
              message: "Could not extract transaction details from SMS body.",
            },
            422,
          );
        }

        const { data, error } = await supabaseAdmin
          .from("bank_transactions")
          .insert(parsed)
          .select()
          .single();
        if (error) {
          if ((error as { code?: string }).code === "23505") {
            return json({ ok: false, error: "duplicate_utr", utr_number: parsed.utr_number }, 409);
          }
          console.error("[sms-webhook] insert error (sms)", error);
          return json({ ok: false, error: "database_error" }, 500);
        }
        console.log("[sms-webhook] sms insert", data.id, parsed.payment_mode);
        return json(
          { ok: true, source: "sms", parsed, transaction: data },
          201,
        );
      },
    },
  },
});