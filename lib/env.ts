// Fails the build/dev-start itself (imported from next.config.ts, which
// runs synchronously before anything else) rather than letting a missing
// var surface later as a runtime 500 on whichever request happens to touch
// it first. Every var here already had its own lazy check at first use
// (lib/supabase/server.ts, admin.ts, lib/security/lead-form-token.ts) —
// this doesn't replace those, it just catches the same problem earlier.
const REQUIRED_SERVER_ENV = [
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "LEAD_FORM_SECRET",
] as const;

export function assertRequiredEnv(): void {
  const missing = REQUIRED_SERVER_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
        `Set them in .env (local) or the Vercel project settings (Production and Preview).`,
    );
  }
}
