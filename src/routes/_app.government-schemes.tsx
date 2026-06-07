import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_app/government-schemes")({
  head: () => ({ meta: [{ title: "Government Schemes — FED BUSINESS" }] }),
  component: () => (
    <div className="space-y-5">
      <PageHeader title="Government Schemes" />
      <div className="bg-white border rounded-md p-12 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-fed-blue/10 text-fed-blue grid place-items-center mb-4"><Building2 size={28}/></div>
        <div className="text-lg font-bold text-fed-blue">No schemes available</div>
        <div className="text-sm text-muted-foreground mt-1">Please contact our support team for active government schemes.</div>
      </div>
    </div>
  ),
});