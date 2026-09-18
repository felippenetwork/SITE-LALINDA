import type { ReactNode } from "react";

// /auth é usado só pelo login do admin (ver middleware.ts) — fica na paleta
// "de staff" (terracota), fora do rebrand rosê do site público/portal.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="theme-staff contents">{children}</div>;
}
