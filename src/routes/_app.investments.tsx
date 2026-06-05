import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_app/investments")({
  head: () => ({ meta: [{ title: "Investments — FED BIZ" }] }),
  component: () => (
    <div className="space-y-5">
      <PageHeader title="Investments" />
      <div className="bg-white border rounded-md p-12 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-fed-blue/10 text-fed-blue grid place-items-center mb-4"><TrendingUp size={28}/></div>
        <div className="text-lg font-bold text-fed-blue">No investments available</div>
        <div className="text-sm text-muted-foreground mt-1">Visit your branch to explore investment options.</div>
      </div>
    </div>
  ),
});