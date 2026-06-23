import { createServerFn } from "@tanstack/react-start";
import { DEMO_CREDENTIALS } from "@/lib/auth-store";

export const startDemoSession = createServerFn({ method: "POST" })
  .inputValidator((input: { userId: string; password: string }) => input)
  .handler(async ({ data }) => {
    if (
      data.userId.trim().toLowerCase() !==
        DEMO_CREDENTIALS.userId.toLowerCase() ||
      data.password !== DEMO_CREDENTIALS.password
    ) {
      const err = new Error("invalid_credentials") as Error & {
        statusCode?: number;
      };
      err.statusCode = 401;
      throw err;
    }
    const { issueDemoSessionCookie } = await import(
      "@/lib/demo-session.server"
    );
    issueDemoSessionCookie();
    return { ok: true };
  });

export const endDemoSession = createServerFn({ method: "POST" }).handler(
  async () => {
    const { clearDemoSessionCookie } = await import(
      "@/lib/demo-session.server"
    );
    clearDemoSessionCookie();
    return { ok: true };
  },
);