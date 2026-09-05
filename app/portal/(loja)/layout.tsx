import type { ReactNode } from "react";
import { CartProvider } from "@/components/portal/CartContext";

// Route group — não muda a URL (continua /portal/catalogo,
// /portal/checkout, /portal/pedidos/[id]), só agrupa as páginas de
// compra sob o CartProvider. Cadastro/completar-cadastro/aguardando-
// aprovacao ficam de fora de propósito, não precisam de carrinho.
export default function LojaLayout({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
