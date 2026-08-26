import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/sections/AdminSidebar";
import { QueryProvider } from "@/components/providers/QueryProvider";

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

  const { data: isAdmin } = await supabase.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });

  return (
    <QueryProvider>
      <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row font-sans">
        <AdminSidebar isAdmin={!!isAdmin} userEmail={user.email ?? ""} />
        <main className="flex-1 lg:ml-72 p-6 md:p-12 lg:p-16">{children}</main>
      </div>
    </QueryProvider>
  );
}
