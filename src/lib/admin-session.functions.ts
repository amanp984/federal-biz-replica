import { createServerFn } from "@tanstack/react-start";
import { DEFAULT_ADMIN_CREDENTIALS } from "@/lib/admin-credentials";

export const startAdminSession = createServerFn({ method: "POST" })
  .inputValidator((input: { userId: string; password: string }) => input)
  .handler(async ({ data }) => {
    console.log("[admin-auth] session creation requested", {
      userId: data.userId,
      hasPassword: Boolean(data.password),
    });
    if (
      data.userId !== DEFAULT_ADMIN_CREDENTIALS.userId ||
      data.password !== DEFAULT_ADMIN_CREDENTIALS.password
    ) {
      const err = new Error("admin_session_invalid_credentials") as Error & {
        statusCode?: number;
      };
      err.statusCode = 401;
      throw err;
    }
    const { issueAdminSessionCookie } = await import("@/lib/admin-session.server");
    issueAdminSessionCookie(data.userId);
    console.log("[admin-auth] session created", { userId: data.userId });
    return { ok: true, userId: data.userId };
  });

export const endAdminSession = createServerFn({ method: "POST" }).handler(
  async () => {
    const { clearAdminSessionCookie } = await import("@/lib/admin-session.server");
    clearAdminSessionCookie();
    return { ok: true };
  },
);
