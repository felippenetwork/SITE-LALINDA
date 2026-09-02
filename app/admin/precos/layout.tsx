import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Preço (grupos, matriz, exceções por cliente) é admin-only, sem exceção
// — nem leitura pro Operador. A sidebar já esconde o link, mas esse é o
// gate de verdade, mesmo raciocínio de app/admin/config/layout.tsx.
export default async function AdminPrecosLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?redirect=/admin/precos");

  const { data: isAdmin } = await supabase.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });
  if (!isAdmin) redirect("/admin/catalogo");

  return children;
}
