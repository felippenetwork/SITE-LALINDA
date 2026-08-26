import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Config (site settings, panel-user management) is Administrador-only.
// The sidebar already hides this link for Operador, but that's just UX —
// this is the real gate, same belt-and-suspenders reasoning as
// app/admin/layout.tsx's login check.
export default async function AdminConfigLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?redirect=/admin/config");

  const { data: isAdmin } = await supabase.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });
  if (!isAdmin) redirect("/admin/catalogo");

  return children;
}
