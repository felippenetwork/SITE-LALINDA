import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { getPortalDestination } from "@/lib/data/portal";
import { getMeuPedido } from "@/lib/data/pedido";
import { formatBRL } from "@/lib/format";

export const metadata: Metadata = {
  title: "Pedido Confirmado | La Linda",
};

const METODO_LABEL: Record<string, string> = {
  pix: "PIX",
  cartao: "Cartão",
  boleto: "Boleto",
};

function formatarDataExibicao(isoDate: string): string {
  const [ano, mes, dia] = isoDate.split("-").map(Number);
  return new Date(ano!, mes! - 1, dia!).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export default async function PortalPedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const destination = await getPortalDestination();
  if (destination !== "/portal/catalogo") redirect(destination);

  const pedido = await getMeuPedido(id);
  if (!pedido) notFound();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <Link
          href="/portal/catalogo"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-black text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Voltar ao Catálogo
        </Link>

        <div className="text-center mb-10">
          <CheckCircle2 className="mx-auto mb-4 text-primary" size={48} />
          <h1 className="text-3xl md:text-4xl font-serif italic text-foreground mb-2">
            Pedido Confirmado
          </h1>
          <p className="text-muted-foreground font-sans text-sm">
            Previsão de entrega:{" "}
            <span className="font-semibold text-foreground capitalize">
              {formatarDataExibicao(pedido.dataEntregaPrevista)}
            </span>
          </p>
        </div>

        <div className="bg-card border border-border rounded-[2rem] overflow-hidden">
          {pedido.itens.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border last:border-b-0"
            >
              <div className="min-w-0">
                <p className="font-sans font-semibold text-sm text-foreground truncate">
                  {item.produtoNome}
                </p>
                <p className="text-xs text-muted-foreground font-sans">
                  {item.quantidade} × {formatBRL(item.precoUnitario)}
                </p>
              </div>
              <span className="text-sm font-sans font-semibold text-foreground shrink-0">
                {formatBRL(item.subtotal)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between px-6 py-5 bg-background/50">
            <span className="text-xs uppercase tracking-widest font-black text-muted-foreground">
              Total
            </span>
            <span className="text-xl font-serif italic text-primary">
              {formatBRL(pedido.valorTotal)}
            </span>
          </div>
        </div>

        <div className="mt-6 bg-card border border-border rounded-[2rem] p-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-sans">Forma de pagamento</span>
            <span className="font-semibold text-foreground">
              {METODO_LABEL[pedido.metodoPagamento] ?? pedido.metodoPagamento}
              {pedido.prazoDiasEscolhido ? ` — ${pedido.prazoDiasEscolhido} dias` : ""}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-sans">Número do pedido</span>
            <span className="font-mono text-xs text-foreground">{pedido.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
