import type { ReactNode } from "react";

// Layout puramente de escopo de CSS — aplica .theme-staff (paleta antiga,
// terracota) em cima de /vendas/(app)/* e /vendas/login, que ficam de fora
// do rebrand rosê do site público/portal. "contents" garante que a div não
// interfere em layout/flex, só carrega as custom properties.
export default function VendasLayout({ children }: { children: ReactNode }) {
  return <div className="theme-staff contents">{children}</div>;
}
