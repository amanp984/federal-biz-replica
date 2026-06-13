import { Link } from "@tanstack/react-router";
import { FEDERAL_LOGO_HORIZONTAL } from "@/lib/logos";
import { ArrowLeft } from "lucide-react";

export function LegalPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex flex-col">
      <div className="bg-white border-b-4 border-fed-orange shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <img src={FEDERAL_LOGO_HORIZONTAL} alt="FED BUSINESS" className="h-10 w-auto" />
          <div className="border-l border-border h-8" />
          <div>
            <div className="text-lg font-bold text-fed-blue tracking-wide">FED BUSINESS</div>
            <div className="text-[11px] text-muted-foreground -mt-0.5">Corporate Workspace</div>
          </div>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-1.5 text-sm text-fed-blue hover:underline"
          >
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        <div className="bg-white rounded-md shadow-sm border overflow-hidden">
          <div className="bg-fed-blue text-white px-6 py-5 border-b-4 border-fed-orange">
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle && <p className="text-sm opacity-90 mt-1">{subtitle}</p>}
          </div>
          <article className="p-6 md:p-8 prose prose-sm md:prose-base max-w-none text-foreground leading-relaxed [&_h2]:text-fed-blue [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-1 [&_p]:my-3 [&_ul]:my-3 [&_ul]:pl-6 [&_ul]:list-disc [&_li]:my-1">
            {children}
          </article>
        </div>
      </div>

      <footer className="bg-fed-blue text-white text-xs text-center py-3">
        © {new Date().getFullYear()} FED BUSINESS — Educational Demonstration Portal.
      </footer>
    </div>
  );
}

export function DemoNotice() {
  return (
    <div className="border-l-4 border-fed-orange bg-fed-orange/10 p-4 rounded">
      <p className="font-bold text-fed-blue mb-1">Educational Demonstration Notice</p>
      <p className="text-sm">
        This website is a banking interface demonstration created for educational, testing
        and UI showcase purposes only. No real banking services are provided, no real
        financial transactions occur, and this platform has no affiliation with any
        actual banking institution. This is a demonstration environment only.
      </p>
    </div>
  );
}