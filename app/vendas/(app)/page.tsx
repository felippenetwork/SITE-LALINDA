import type { Metadata } from "next";
import { PortalLogoutButton } from "@/components/shared/PortalLogoutButton";
import { VendasBusca } from "./VendasBusca";

export const metadata: Metadata = {
  title: "Vendas | La Linda",
};

export default function VendasPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="flex items-center justify-between mb-12 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif italic text-foreground mb-2">Vendas</h1>
            <p className="text-muted-foreground font-sans text-xs md:text-sm tracking-wide">
              Selecione um cliente ou cadastre um novo para montar um pedido
            </p>
          </div>
          <PortalLogoutButton />
        </div>

        <VendasBusca />
      </div>
    </div>
  );
}
