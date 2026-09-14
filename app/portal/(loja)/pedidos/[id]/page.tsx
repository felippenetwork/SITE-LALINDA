import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { CheckCircle2, ArrowLeft, Receipt, AlertTriangle, Clock } from "lucide-react";
import { getPortalDestination } from "@/lib/data/portal";
import { getMeuPedido } from "@/lib/data/pedido";
import { PedidoStatusBadge } from "@/components/portal/PedidoStatusBadge";
import { CopiarPixButton } from "@/components/portal/CopiarPixButton";
import { formatBRL } from "@/lib/format";

export const metadata: Metadata = {
  title: "Pedido | La Linda",
};

const METODO_LABEL: Record<string, string> = {
  pix: "PIX",
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

// Esta tela serve dois papéis: confirmação logo após o checkout
// (?confirmado=1, mandado só pelo redirect do CheckoutForm) e detalhe de
// um pedido antigo, acessado pela lista (/portal/pedidos). O conteúdo
// (itens, preço no momento da compra, pagamento, total) é idêntico nos
// dois casos — só o cabeçalho/link de voltar mudam.
export default async function PortalPedidoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ confirmado?: string }>;
}) {
  const { id } = await params;
  const { confirmado } = await searchParams;
  const vemDoCheckout = confirmado === "1";

  const destination = await getPortalDestination();
  if (destination !== "/portal/catalogo") redirect(destination);

  const pedido = await getMeuPedido(id);
  if (!pedido) notFound();

  const pixExpirado = pedido.pixExpiracao ? new Date(pedido.pixExpiracao) < new Date() : false;
  const pixQrCodeDataUrl =
    pedido.metodoPagamento === "pix" && pedido.pixQrcode && !pixExpirado
      ? await QRCode.toDataURL(pedido.pixQrcode, { width: 240, margin: 1 })
      : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="flex items-center gap-6 mb-8">
          <Link
            href={vemDoCheckout ? "/portal/catalogo" : "/portal/pedidos"}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-black text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} /> {vemDoCheckout ? "Voltar ao Catálogo" : "Voltar aos Pedidos"}
          </Link>
          {vemDoCheckout && (
            <Link
              href="/portal/pedidos"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-black text-muted-foreground hover:text-foreground transition-colors"
            >
              <Receipt size={14} /> Meus Pedidos
            </Link>
          )}
        </div>

        <div className="text-center mb-10">
          {vemDoCheckout && <CheckCircle2 className="mx-auto mb-4 text-primary" size={48} />}
          <h1 className="text-3xl md:text-4xl font-serif italic text-foreground mb-3">
            {vemDoCheckout ? "Pedido Confirmado" : `Pedido #${pedido.id.slice(0, 8)}`}
          </h1>
          <div className="flex justify-center mb-3">
            <PedidoStatusBadge status={pedido.status} />
          </div>
          <p className="text-muted-foreground font-sans text-sm">
            Previsão de entrega:{" "}
            <span className="font-semibold text-foreground capitalize">
              {formatarDataExibicao(pedido.dataEntregaPrevista)}
            </span>
          </p>
        </div>

        {pedido.metodoPagamento === "pix" && (
          <div className="bg-card border border-border rounded-[2rem] p-6 mb-6 text-center">
            {pixQrCodeDataUrl && pedido.pixQrcode ? (
              <>
                <p className="text-xs uppercase tracking-widest font-black text-muted-foreground mb-4">
                  Pague com PIX
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element -- data: URL gerada no servidor, next/image não se aplica */}
                <img
                  src={pixQrCodeDataUrl}
                  alt="QR Code para pagamento PIX"
                  width={240}
                  height={240}
                  className="mx-auto rounded-xl border border-border"
                />
                <p className="text-[10px] text-muted-foreground mt-4 mb-3">
                  Escaneie com o app do seu banco ou copie o código abaixo
                </p>
                <CopiarPixButton texto={pedido.pixQrcode} />
              </>
            ) : pedido.pixQrcode && pixExpirado ? (
              <div className="flex flex-col items-center gap-2 text-rose-600">
                <Clock size={28} />
                <p className="text-sm font-sans font-semibold">Este código PIX expirou</p>
                <p className="text-xs text-muted-foreground">
                  Entre em contato com nosso time para gerar um novo código.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <AlertTriangle size={28} />
                <p className="text-sm font-sans font-semibold text-foreground">
                  Não foi possível gerar o código PIX
                </p>
                <p className="text-xs">
                  Entre em contato com nosso time para finalizar o pagamento.
                </p>
              </div>
            )}
          </div>
        )}

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
