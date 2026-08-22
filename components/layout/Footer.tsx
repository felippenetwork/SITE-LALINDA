"use client";

import { cn } from "@/lib/utils";

interface FooterProps {
  variant?: "light" | "dark";
}

export const Footer = ({ variant = "light" }: FooterProps) => {
  const isDark = variant === "dark";

  return (
    <footer
      className={cn(
        "py-20 text-center",
        isDark
          ? "bg-stone-900 text-stone-400 border-t border-white/5"
          : "bg-background text-stone-400 border-t border-stone-100",
      )}
    >
      <div className="container mx-auto px-8">
        <h3
          className={cn(
            "text-3xl font-serif italic mb-8",
            isDark ? "text-white" : "text-foreground",
          )}
        >
          La Linda
        </h3>
        <p className="text-[10px] font-sans uppercase tracking-[0.5em] font-bold">
          &copy; 2026 La Linda Pães Especiais — Uma Herança Artesanal
        </p>
      </div>
    </footer>
  );
};
