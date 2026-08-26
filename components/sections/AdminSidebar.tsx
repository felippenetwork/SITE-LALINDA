"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  KeyRound,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChangePasswordForm } from "@/components/forms/ChangePasswordForm";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  isAdmin: boolean;
}

export const AdminSidebar = ({ isAdmin }: AdminSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const navItems = [
    { label: "Catálogo", href: "/admin/catalogo", icon: LayoutDashboard },
    { label: "Leads", href: "/admin/leads", icon: MessageSquare },
    ...(isAdmin ? [{ label: "Config", href: "/admin/config", icon: Settings }] : []),
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const passwordDialog = (
    <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
      <DialogContent className="w-[95vw] sm:max-w-[520px] rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-3xl font-serif italic">Trocar Senha</DialogTitle>
        </DialogHeader>
        <ChangePasswordForm />
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <aside className="hidden lg:flex w-72 bg-stone-950 text-white flex-col p-8 fixed h-full border-r border-stone-800">
        <div className="mb-12">
          <h1 className="text-2xl font-serif italic text-white leading-none">La Linda</h1>
          <span className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-primary-light mt-2 block">
            Dashboard
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-sans uppercase tracking-[0.2em] font-black transition-all",
                pathname === item.href
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                  : "text-stone-500 hover:text-white hover:bg-white/5",
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-stone-800 space-y-4">
          <Link
            href="/"
            className="flex items-center gap-4 px-4 py-2 text-stone-500 hover:text-white transition-colors text-xs uppercase tracking-widest font-black"
          >
            <ExternalLink size={14} /> Site Público
          </Link>
          <button
            onClick={() => setIsPasswordDialogOpen(true)}
            className="flex items-center gap-4 px-4 py-2 text-stone-500 hover:text-white transition-colors text-xs uppercase tracking-widest font-black"
          >
            <KeyRound size={14} /> Trocar Senha
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-rose-500 hover:bg-rose-500/10 rounded-xl font-bold transition-all"
          >
            <LogOut size={18} />
            <span className="text-sm uppercase tracking-widest">Sair</span>
          </button>
        </div>
      </aside>

      <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-stone-950 text-white sticky top-0 z-40">
        <span className="text-xl font-serif italic">La Linda</span>
        <Sheet>
          <SheetTrigger asChild>
            <button aria-label="Menu" className="p-2 hover:text-primary transition-colors">
              <Menu size={22} />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="bg-stone-950 border-stone-800 text-white p-8 flex flex-col"
          >
            <span className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-primary-light mb-8 block">
              Dashboard
            </span>
            <nav className="flex-1 space-y-2">
              {navItems.map((item) => (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-sans uppercase tracking-[0.2em] font-black transition-all",
                      pathname === item.href
                        ? "bg-primary text-white"
                        : "text-stone-500 hover:text-white hover:bg-white/5",
                    )}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
            <div className="mt-auto pt-8 border-t border-stone-800 space-y-4">
              <SheetClose asChild>
                <Link
                  href="/"
                  className="flex items-center gap-4 px-4 py-2 text-stone-500 hover:text-white transition-colors text-xs uppercase tracking-widest font-black"
                >
                  <ExternalLink size={14} /> Site Público
                </Link>
              </SheetClose>
              <button
                onClick={() => setIsPasswordDialogOpen(true)}
                className="flex items-center gap-4 px-4 py-2 text-stone-500 hover:text-white transition-colors text-xs uppercase tracking-widest font-black"
              >
                <KeyRound size={14} /> Trocar Senha
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-3 text-rose-500 hover:bg-rose-500/10 rounded-xl font-bold transition-all"
              >
                <LogOut size={18} />
                <span className="text-sm uppercase tracking-widest">Sair</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {passwordDialog}
    </>
  );
};
