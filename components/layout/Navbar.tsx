"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavbarProps {
  variant?: "light" | "dark" | "transparent";
  activeItem?: string;
}

export const Navbar = ({ variant = "light", activeItem }: NavbarProps) => {
  const isTransparent = variant === "transparent";
  const isDark = variant === "dark";

  const menuItems = [
    { label: "Início", path: "/" },
    { label: "Produtos", path: "/produtos" },
    { label: "A Lalinda", path: "/a-lalinda" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-500",
        isTransparent
          ? "bg-stone-900/40 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border-b border-white/5 lg:border-none"
          : "bg-white/80 backdrop-blur-md border-b border-stone-100",
      )}
    >
      <nav className="mx-auto px-4 md:px-8 py-3 md:py-6 flex items-center justify-between">
        <Link href="/" className="group">
          <h1
            className={cn(
              "text-xl md:text-3xl font-serif italic group-hover:text-primary transition-colors",
              isTransparent || isDark ? "text-white mix-blend-difference" : "text-foreground",
            )}
          >
            La Linda
          </h1>
        </Link>

        <div
          className={cn(
            "hidden lg:flex items-center gap-12 px-10 py-4 rounded-full border shadow-sm backdrop-blur-md",
            isTransparent || isDark
              ? "bg-white/5 border-white/10"
              : "bg-stone-50/50 border-stone-100",
          )}
        >
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.path}
              className={cn(
                "relative text-[10px] font-sans uppercase tracking-[0.2em] font-bold transition-all duration-300 hover:text-primary group/nav",
                (isTransparent || isDark) && activeItem !== item.label ? "text-white" : "",
                !isTransparent && !isDark && activeItem !== item.label
                  ? "text-stone-400 hover:text-foreground"
                  : "",
                activeItem === item.label ? "text-primary" : "",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover/nav:w-full",
                  activeItem === item.label ? "w-full" : "",
                )}
              />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Link
            href="/#contato"
            className="bg-primary text-white px-5 md:px-8 py-2 md:py-3 rounded-full text-[8px] md:text-[10px] font-sans uppercase tracking-[0.2em] font-black hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-primary/20"
          >
            Fale Conosco
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <button
                className={cn(
                  "lg:hidden p-2 hover:text-primary transition-colors",
                  isTransparent || isDark ? "text-white mix-blend-difference" : "text-stone-900",
                )}
                aria-label="Menu"
              >
                <Menu size={20} className="md:w-6 md:h-6" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-stone-900 border-stone-800 text-white p-12 flex flex-col justify-center"
            >
              <nav className="flex flex-col gap-8 text-center">
                {menuItems.map((item) => (
                  <SheetClose asChild key={item.label}>
                    <Link
                      href={item.path}
                      className="text-2xl font-serif italic hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};
