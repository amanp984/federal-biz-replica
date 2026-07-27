import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_app/webhook-docs")({
  head: () => ({ meta: [{ title: "SMS Webhook — FED BUSINESS" }] }),
  component: WebhookDocs,
});

const WEBHOOK_PATH = "/api/public/sms-webhook";

function CodeBlock({ code, language = "json" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <button
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="absolute right-2 top-2 p-1.5 rounded bg-white/10 hover:bg-white/20 text-white opacity-0 group-hover:opacity-100 transition"
        aria-label="Copy"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
      <pre className="bg-slate-900 text-slate-100 text-xs p-4 rounded-md overflow-x-auto whitespace-pre">
        <code data-lang={language}>{code}</code>
      </pre>
    </div>
  );
}

function WebhookDocs() {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://your-app.lovable.app";
  const fullUrl = `${origin}${WEBHOOK_PATH}`;

  const directExample = JSON.stringify(
    {
      transaction_date: "2026-06-08",
      transaction_type: "CREDIT",
      payment_mode: "IMPS",
      account_holder_name: "GANESH SHARMA",
      utr_number: "553244862478",
      beneficiary_account_last_digits: "8572",
      amount: 5000,
    },
    null,
    2,
  );

  const smsExample = JSON.stringify(
    {
      message:
        "Rs.5000 credited to A/c XX8572 on 08-06-26 via IMPS Ref 553244862478 from GANESH SHARMA. Avl Bal: Rs.42,500.",
      sender: "VK-HDFCBK",
      id: "1717843200000",
      timestamp: "1717843200000",
    },
    null,
    2,
  );

  const curlDirect = `curl -X POST '${fullUrl}' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer <YOUR_SECRET>' \\
  -d '${directExample.replace(/\n\s*/g, " ")}'`;

  const smsForwarderTemplate = JSON.stringify(
    { message: "{msg}", sender: "{from}", id: "{time}", timestamp: "{time}" },
    null,
    2,
  );

  const successResponse = JSON.stringify(
    {
      ok: true,
      source: "sms",
      parsed: {
        transaction_date: "2026-06-08",
        transaction_type: "CREDIT",
        payment_mode: "IMPS",
        account_holder_name: "GANESH SHARMA",
        utr_number: "553244862478",
        beneficiary_account_last_digits: "8572",
        amount: 5000,
      },
      transaction: { id: "uuid", created_at: "2026-06-08T12:00:00Z" },
    },
    null,
    2,
  );

  return (
    <div className="space-y-6">
      <PageHeader title="SMS Webhook" subtitle="Ingest bank SMS or direct transactions into Bank Statement" />

      <section className="bg-white border rounded-md shadow-sm p-5 space-y-3">
        <h2 className="font-semibold text-fed-blue">Endpoint</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold text-xs">POST</span>
          <code className="font-mono text-xs sm:text-sm break-all">{fullUrl}</code>
        </div>
        <p className="text-xs text-muted-foreground">
          Required header (either one):{" "}
          <code className="font-mono">Authorization: Bearer &lt;your secret&gt;</code> or{" "}
          <code className="font-mono">x-webhook-secret: &lt;your secret&gt;</code>
        </p>
      </section>

      <section className="bg-white border rounded-md shadow-sm p-5 space-y-3">
        <h2 className="font-semibold text-fed-blue">1. Direct transaction JSON</h2>
        <p className="text-xs text-muted-foreground">
          Inserts the row as-is after validation. Required fields:
          <code className="font-mono"> transaction_date, transaction_type, payment_mode, account_holder_name, utr_number, amount</code>.
        </p>
        <CodeBlock code={directExample} />
        <h3 className="text-sm font-semibold mt-3">cURL</h3>
        <CodeBlock code={curlDirect} language="bash" />
      </section>

      <section className="bg-white border rounded-md shadow-sm p-5 space-y-3">
        <h2 className="font-semibold text-fed-blue">2. SMS Forwarder JSON</h2>
        <p className="text-xs text-muted-foreground">
          For Android SMS-forwarding apps. Configure the JSON template as:
        </p>
        <CodeBlock code={smsForwarderTemplate} />
        <p className="text-xs text-muted-foreground mt-2">Example actual payload:</p>
        <CodeBlock code={smsExample} />
        <p className="text-xs text-muted-foreground">
          The parser detects CREDIT / DEBIT, mode (UPI / IMPS / NEFT / RTGS), amount, UTR / reference number,
          account holder, and beneficiary last digits automatically.
        </p>
      </section>

      <section className="bg-white border rounded-md shadow-sm p-5 space-y-3">
        <h2 className="font-semibold text-fed-blue">Response</h2>
        <p className="text-xs text-muted-foreground">Success (HTTP 201):</p>
        <CodeBlock code={successResponse} />
        <p className="text-xs text-muted-foreground mt-2">Errors:</p>
        <ul className="text-xs text-muted-foreground list-disc ml-5 space-y-1">
          <li><code>401 unauthorized</code> — missing or wrong secret header</li>
          <li><code>400 invalid_json</code> — body is not valid JSON</li>
          <li><code>400 invalid_payload</code> — schema validation failed (see <code>details</code>)</li>
          <li><code>422 unparseable_sms</code> — SMS body could not be parsed</li>
          <li><code>500</code> — server / database error</li>
        </ul>
      </section>

      <section className="bg-white border rounded-md shadow-sm p-5 space-y-2">
        <h2 className="font-semibold text-fed-blue">JSON Schema</h2>
        <CodeBlock
          code={JSON.stringify(
            {
              direct_transaction: {
                transaction_date: "string (YYYY-MM-DD)",
                transaction_type: "CREDIT | DEBIT",
                payment_mode: "UPI | IMPS | NEFT | RTGS",
                account_holder_name: "string (1-120)",
                utr_number: "string (4-40)",
                beneficiary_account_last_digits: "string (3-6 digits, optional)",
                amount: "number > 0",
              },
              sms_payload: {
                message: "string (3-2000)",
                sender: "string (optional)",
                id: "string | number (optional)",
                timestamp: "string | number (epoch ms, optional)",
              },
            },
            null,
            2,
          )}
        />
      </section>
    </div>
  );
}