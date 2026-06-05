import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_app/insurance")({
  head: () => ({ meta: [{ title: "Insurance — FED BIZ" }] }),
  component: () => (
    <div className="space-y-5">
      <PageHeader title="Insurance" />
      <div className="bg-white border rounded-md p-12 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-fed-blue/10 text-fed-blue grid place-items-center mb-4"><ShieldCheck size={28}/></div>
        <div className="text-lg font-bold text-fed-blue">No insurance policies linked</div>
        <div className="text-sm text-muted-foreground mt-1">Please contact your branch for insurance products.</div>
      </div>
    </div>
  ),
});