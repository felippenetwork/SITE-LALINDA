import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { getPortalDestination } from "@/lib/data/portal";
import { PortalLogoutButton } from "@/components/shared/PortalLogoutButton";

export const metadata: Metadata = {
  title: "Catálogo | La Linda",
};

// Placeholder até a próxima tarefa do Sprint 4 (catálogo/carrinho/pedido)
// — só existe pra fechar o fluxo de aprovação num destino de verdade.
export default async function PortalCatalogoPage() {
  const destination = await getPortalDestination();
  if (destination !== "/portal/catalogo") redirect(destination);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8 text-center">
      <div className="w-full max-w-[480px]">
        <h1 className="text-4xl md:text-5xl font-serif italic text-foreground mb-8 leading-none">
          La Linda
        </h1>

        <div className="bg-card border border-border rounded-[2rem] p-10 shadow-sm">
          <PackageSearch className="mx-auto mb-6 text-primary" size={40} />
          <h2 className="text-2xl font-serif italic text-foreground mb-3">Catálogo em Breve</h2>
          <p className="text-sm text-muted-foreground font-sans leading-relaxed">
            Seu cadastro foi aprovado! O catálogo de compras ainda está sendo construído.
          </p>
        </div>

        <div className="mt-8">
          <PortalLogoutButton />
        </div>
      </div>
    </div>
  );
}
