import { createFileRoute } from "@tanstack/react-router";
import { PiggyBank } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_app/deposits")({
  head: () => ({ meta: [{ title: "Deposits — FED BIZ" }] }),
  component: () => (
    <div className="space-y-5">
      <PageHeader title="Deposits" />
      <EmptyCard icon={PiggyBank} title="No Fixed Deposit available" desc="Please contact your branch to open a new fixed deposit." />
    </div>
  ),
});

function EmptyCard({ icon: Icon, title, desc }: { icon: React.ComponentType<{ size?: number }>; title: string; desc: string }) {
  return (
    <div className="bg-white border rounded-md p-12 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-fed-blue/10 text-fed-blue grid place-items-center mb-4"><Icon size={28}/></div>
      <div className="text-lg font-bold text-fed-blue">{title}</div>
      <div className="text-sm text-muted-foreground mt-1">{desc}</div>
    </div>
  );
}