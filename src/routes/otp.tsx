import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { OtpStep } from "@/components/OtpStep";
import { useAuth, DEMO_USER } from "@/lib/auth-store";
import { FEDERAL_LOGO_HORIZONTAL } from "@/lib/logos";

export const Route = createFileRoute("/otp")({
  head: () => ({ meta: [{ title: "OTP Verification — FED BIZ" }] }),
  component: OtpPage,
});

function OtpPage() {
  const navigate = useNavigate();
  const { pendingUserId, login } = useAuth();

  useEffect(() => {
    if (!pendingUserId) navigate({ to: "/" });
  }, [pendingUserId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex flex-col">
      <div className="bg-white border-b-4 border-fed-orange shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <img src={FEDERAL_LOGO_HORIZONTAL} alt="Federal Bank" className="h-10" />
          <div className="border-l h-7 mx-1" />
          <div className="text-fed-blue font-bold">FED BIZ</div>
        </div>
      </div>
      <div className="flex-1 grid place-items-center p-4">
        <div className="w-full max-w-md">
          <OtpStep
            seconds={60}
            onVerify={() => {
              login({ ...DEMO_USER, userId: pendingUserId ?? DEMO_USER.userId });
              navigate({ to: "/dashboard" });
            }}
          />
          <p className="text-center text-xs text-muted-foreground mt-4">
            Tip: any 6-digit code is accepted in this demo build.
          </p>
        </div>
      </div>
    </div>
  );
}