import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { getPortalDestination } from "@/lib/data/portal";
import { getMeusPedidos } from "@/lib/data/pedido";
import { PortalLogoutButton } from "@/components/shared/PortalLogoutButton";
import { CartSummaryButton } from "@/components/portal/CartSummaryButton";
import { PedidoStatusBadge } from "@/components/portal/PedidoStatusBadge";
import { formatBRL } from "@/lib/format";

export const metadata: Metadata = {
  title: "Meus Pedidos | La Linda",
};

function formatarDataPedido(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatarDataEntrega(isoDate: string): string {
  const [ano, mes, dia] = isoDate.split("-").map(Number);
  return new Date(ano!, mes! - 1, dia!).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export default async function PortalPedidosPage() {
  const destination = await getPortalDestination();
  if (destination !== "/portal/catalogo") redirect(destination);

  const pedidos = await getMeusPedidos();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="flex items-center justify-between mb-12 md:mb-16 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif italic text-foreground mb-2">
              Meus Pedidos
            </h1>
            <p className="text-muted-foreground font-sans text-xs md:text-sm tracking-wide">
              Histórico de pedidos da sua conta
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <CartSummaryButton />
            <PortalLogoutButton />
          </div>
        </div>

        {pedidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24">
            <PackageSearch className="text-stone-300 mb-4" size={40} />
            <p className="text-sm text-muted-foreground mb-6">Você ainda não fez nenhum pedido.</p>
            <Link
              href="/portal/catalogo"
              className="text-xs uppercase tracking-widest font-black text-primary hover:underline"
            >
              Ver Catálogo
            </Link>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-[2rem] overflow-hidden">
            {pedidos.map((pedido) => (
              <Link
                key={pedido.id}
                href={`/portal/pedidos/${pedido.id}`}
                className="flex items-center justify-between gap-4 px-6 py-5 border-b border-border last:border-b-0 hover:bg-background/50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-sans font-semibold text-sm text-foreground">
                    {formatarDataPedido(pedido.createdAt)}
                  </p>
                  <p className="text-xs text-muted-foreground font-sans mt-0.5">
                    Entrega prevista: {formatarDataEntrega(pedido.dataEntregaPrevista)}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <PedidoStatusBadge status={pedido.status} />
                  <span className="text-sm font-sans font-semibold text-foreground w-20 text-right">
                    {formatBRL(pedido.valorTotal)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
