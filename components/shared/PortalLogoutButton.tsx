"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export const PortalLogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center gap-2 text-[10px] font-sans uppercase tracking-widest font-black text-muted-foreground hover:text-foreground transition-colors"
    >
      <LogOut size={14} /> Sair
    </button>
  );
};
