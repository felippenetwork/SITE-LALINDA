import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/sections/AdminSidebar";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AdminRoleProvider } from "@/components/providers/AdminRoleProvider";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt-and-suspenders: middleware.ts already gates `/admin/*`, but
  // Supabase's own guidance is not to rely on middleware alone.
  if (!user) {
    redirect("/auth?redirect=/admin");
  }

  const [{ data: isAdmin }, { data: isOperador }] = await Promise.all([
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: user.id, _role: "operador" }),
  ]);

  // Real access gate, not just "has a session" — an authenticated user with
  // no admin/operador role (e.g. a future cliente account, once
  // clientes.user_id accounts exist) must never reach the admin shell at
  // all, same reasoning as app/admin/config/layout.tsx's isAdmin check.
  if (!isAdmin && !isOperador) {
    redirect("/auth?redirect=/admin");
  }

  return (
    <QueryProvider>
      <AdminRoleProvider isAdmin={!!isAdmin}>
        <div className="min-h-screen bg-background flex flex-col lg:flex-row font-sans">
          <AdminSidebar isAdmin={!!isAdmin} userEmail={user.email ?? ""} />
          <main className="flex-1 lg:ml-72 p-6 md:p-12 lg:p-16">{children}</main>
        </div>
      </AdminRoleProvider>
    </QueryProvider>
  );
}
