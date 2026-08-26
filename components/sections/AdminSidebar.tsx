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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChangePasswordForm } from "@/components/forms/ChangePasswordForm";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  isAdmin: boolean;
  userEmail: string;
}

export const AdminSidebar = ({ isAdmin, userEmail }: AdminSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const navItems = [
    { label: "Catálogo", href: "/admin/catalogo", icon: LayoutDashboard },
    { label: "Leads", href: "/admin/leads", icon: MessageSquare },
    ...(isAdmin ? [{ label: "Config", href: "/admin/config", icon: Settings }] : []),
  ];

  const initials = userEmail.slice(0, 2).toUpperCase() || "?";
  const roleLabel = isAdmin ? "Administrador" : "Operador";

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const accountMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[11px] font-black uppercase shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-xs font-sans font-semibold text-white truncate" title={userEmail}>
              {userEmail}
            </p>
            <p className="text-[9px] font-sans uppercase tracking-widest text-stone-500">
              {roleLabel}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="top"
        sideOffset={8}
        className="w-64 bg-stone-900 border-stone-800 text-white p-2 rounded-2xl"
      >
        <DropdownMenuItem
          onClick={() => setIsPasswordDialogOpen(true)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs uppercase tracking-widest font-black text-stone-300 focus:bg-white/10 focus:text-white cursor-pointer"
        >
          <KeyRound size={14} /> Trocar Senha
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs uppercase tracking-widest font-black text-rose-500 focus:bg-rose-500/10 focus:text-rose-500 cursor-pointer"
        >
          <LogOut size={14} /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

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

        <nav className="flex-1 flex flex-col justify-center space-y-2">
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
          {accountMenu}
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
            <nav className="flex-1 flex flex-col justify-center space-y-2">
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
              {accountMenu}
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {passwordDialog}
    </>
  );
};
