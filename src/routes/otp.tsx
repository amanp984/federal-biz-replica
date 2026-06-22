import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { OtpStep } from "@/components/OtpStep";
import { useAuth, DEMO_USER } from "@/lib/auth-store";
import { FEDERAL_LOGO_HORIZONTAL } from "@/lib/logos";
import { consumeOtp } from "@/lib/otp-pool";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { startDemoSession } from "@/lib/demo-session.functions";
import { DEMO_CREDENTIALS } from "@/lib/auth-store";

export const Route = createFileRoute("/otp")({
  head: () => ({ meta: [{ title: "OTP Verification — FED BUSINESS" }] }),
  component: OtpPage,
});

function OtpPage() {
  const navigate = useNavigate();
  const { pendingUserId, login } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pendingUserId && !loading) navigate({ to: "/" });
  }, [pendingUserId, navigate, loading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex flex-col">
      <LoadingOverlay show={loading} />
      <div className="bg-white border-b-4 border-fed-orange shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <img src={FEDERAL_LOGO_HORIZONTAL} alt="FED BUSINESS" className="h-10" />
          <div className="border-l h-7 mx-1" />
          <div className="text-fed-blue font-bold">FED BUSINESS</div>
        </div>
      </div>
      <div className="flex-1 grid place-items-center p-4">
        <div className="w-full max-w-md">
          <OtpStep
            seconds={60}
            onVerify={async (otp) => {
              const err = consumeOtp(otp);
              if (err) return err;
              setLoading(true);
              await new Promise((r) => setTimeout(r, 400));
              try {
                await startDemoSession({ data: DEMO_CREDENTIALS });
              } catch (e) {
                setLoading(false);
                const msg =
                  e instanceof Error ? e.message : "unknown_error";
                console.error("[otp] startDemoSession failed:", e);
                return `Could not start session: ${msg}`;
              }
              login({ ...DEMO_USER, userId: pendingUserId ?? DEMO_USER.userId });
              navigate({ to: "/dashboard" });
            }}
          />
          <p className="text-center text-xs text-muted-foreground mt-4">
            Enter a valid OTP from your approved list to continue.
          </p>
        </div>
      </div>
    </div>
  );
}