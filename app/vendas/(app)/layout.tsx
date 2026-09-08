import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CartProvider } from "@/components/portal/CartContext";

// Route group — não muda a URL (continua /vendas, /vendas/pedidos/...),
// só isola o gate de has_role(vendedor) + CartProvider das páginas
// realmente protegidas. /vendas/login fica FORA deste grupo de propósito
// — senão o próprio formulário de login ficaria preso no redirect abaixo.
export default async function VendasAppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/vendas/login");

  const { data: isVendedor } = await supabase.rpc("has_role", {
    _user_id: user.id,
    _role: "vendedor",
  });
  if (!isVendedor) redirect("/vendas/login");

  // Chave de storage própria — nunca a mesma do carrinho de um cliente
  // de verdade (components/portal/CartContext.tsx), caso as duas sessões
  // por acaso rodem no mesmo navegador.
  return <CartProvider storageKey="lalinda-vendas-carrinho">{children}</CartProvider>;
}
