import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { OtpStep } from "@/components/OtpStep";
import { useAuth, DEMO_USER } from "@/lib/auth-store";
import { FEDERAL_LOGO_HORIZONTAL } from "@/lib/logos";
import { consumeOtp } from "@/lib/otp-pool";

export const Route = createFileRoute("/otp")({
  head: () => ({ meta: [{ title: "OTP Verification — FED BUSINESS" }] }),
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
          <img src={FEDERAL_LOGO_HORIZONTAL} alt="FED BUSINESS" className="h-10" />
          <div className="border-l h-7 mx-1" />
          <div className="text-fed-blue font-bold">FED BUSINESS</div>
        </div>
      </div>
      <div className="flex-1 grid place-items-center p-4">
        <div className="w-full max-w-md">
          <OtpStep
            seconds={60}
            onVerify={(otp) => {
              const err = consumeOtp(otp);
              if (err) return err;
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