"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/portal/CartContext";

export const CartSummaryButton = () => {
  const { totalItens } = useCart();

  return (
    <Link
      href="/portal/checkout"
      className="relative inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-[10px] font-sans font-black uppercase tracking-widest text-foreground hover:border-primary hover:text-primary transition-colors"
    >
      <ShoppingCart size={14} />
      Carrinho
      {totalItens > 0 && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-black text-white">
          {totalItens}
        </span>
      )}
    </Link>
  );
};
