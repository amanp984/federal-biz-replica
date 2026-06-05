import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_app/support")({
  head: () => ({ meta: [{ title: "Support — FED BIZ" }] }),
  component: () => (
    <div className="space-y-5">
      <PageHeader title="Support" subtitle="We're here to help, 24x7" />
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: Phone, label: "Call Us", value: "1800 425 1199" },
          { icon: Mail, label: "Email", value: "fedbiz@federalbank.co.in" },
          { icon: HelpCircle, label: "Help Center", value: "Browse FAQs" },
        ].map((s) => (
          <div key={s.label} className="bg-white border rounded-md p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-fed-blue/10 text-fed-blue grid place-items-center mb-3"><s.icon /></div>
            <div className="font-semibold text-fed-blue">{s.label}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  ),
});