import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { parseSms } from "@/lib/sms-parser";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-webhook-secret",
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
          required_header:
            "Authorization: Bearer <secret>  OR  x-webhook-secret: <secret>",
          accepts: ["Direct transaction JSON", "SMS forwarder JSON"],
        }),

      POST: async ({ request }) => {
        const reqId = Math.random().toString(36).slice(2, 8);
        const hdrs: Record<string, string> = {};
        request.headers.forEach((v, k) => {
          hdrs[k] = /authorization|secret|cookie/i.test(k)
            ? `${v.slice(0, 6)}…(len ${v.length})`
            : v;
        });
        console.log(`[sms-webhook][${reqId}] POST`, request.url, JSON.stringify(hdrs));

        const auth = request.headers.get("authorization") ?? "";
        const bearer = /^Bearer\s+(.+)$/i.exec(auth.trim())?.[1]?.trim() ?? null;
        const url = new URL(request.url);
        const querySecret = url.searchParams.get("secret")?.trim() || null;
        const secret =
          request.headers.get("x-webhook-secret")?.trim() || bearer || querySecret;
        const expected =
          process.env.SMS_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;
        console.log(
          `[sms-webhook][${reqId}] secret present=${!!secret} source=${
            request.headers.get("x-webhook-secret")
              ? "x-webhook-secret"
              : bearer
                ? "bearer"
                : querySecret
                  ? "query"
                  : "none"
          } match=${!!secret && secret === expected}`,
        );
        if (!expected) {
          console.error("[sms-webhook] SMS_WEBHOOK_SECRET not configured");
          return json({ ok: false, error: "server_misconfigured" }, 500);
        }
        if (!secret || secret !== expected) {
          console.warn(`[sms-webhook][${reqId}] unauthorized`);
          return json(
            {
              ok: false,
              error: "unauthorized",
              reason: secret
                ? "secret_mismatch"
                : "missing x-webhook-secret / Authorization: Bearer header",
            },
            401,
          );
        }

        const raw = await request.text();
        console.log(
          `[sms-webhook][${reqId}] raw body (${raw.length} chars):`,
          raw.slice(0, 1000),
        );
        let body: unknown;
        try {
          body = JSON.parse(raw);
        } catch {
          // Some forwarders POST form-encoded or plain text — accept those too.
          try {
            const params = new URLSearchParams(raw);
            const obj = Object.fromEntries(params.entries());
            if (obj.message || obj.msg || obj.text) {
              body = {
                message: obj.message ?? obj.msg ?? obj.text,
                sender: obj.sender ?? obj.from,
                timestamp: obj.timestamp ?? obj.time,
                id: obj.id,
              };
            } else if (raw.trim().length > 3) {
              body = { message: raw.trim() };
            } else {
              throw new Error("empty");
            }
          } catch {
            console.warn(`[sms-webhook][${reqId}] invalid_json`);
            return json(
              { ok: false, error: "invalid_json", received: raw.slice(0, 200) },
              400,
            );
          }
        }
        console.log(`[sms-webhook][${reqId}] parsed body:`, JSON.stringify(body));

        // Unsubstituted SMS-forwarder placeholders ⇒ tell the user plainly.
        const msgField =
          typeof (body as { message?: unknown })?.message === "string"
            ? ((body as { message: string }).message)
            : "";
        if (/^\{\s*(msg|message|text)\s*\}$/i.test(msgField.trim())) {
          console.warn(`[sms-webhook][${reqId}] placeholder not substituted`);
          return json(
            {
              ok: false,
              error: "placeholder_not_substituted",
              message:
                "The forwarder sent the literal text {msg}. Grant the app SMS/Notification access so it substitutes the real message.",
            },
            422,
          );
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
          console.warn(
            `[sms-webhook][${reqId}] invalid_payload`,
            JSON.stringify(sms.error.flatten()),
            "direct errors:",
            JSON.stringify(direct.error.flatten()),
          );
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
          console.warn(
            `[sms-webhook][${reqId}] unparseable sms from ${sms.data.sender}:`,
            sms.data.message.slice(0, 300),
          );
          return json(
            {
              ok: false,
              error: "unparseable_sms",
              message: "Could not extract transaction details from SMS body.",
              received_message: sms.data.message.slice(0, 300),
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