"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Minus, Plus, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useCart } from "@/components/portal/CartContext";
import { confirmarPedido } from "@/lib/actions/pedido";
import { calcularProximaDataEntrega } from "@/lib/delivery/calcular-proxima-data-entrega";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ProdutoComPreco {
  id: string;
  nome: string;
  available: boolean;
  valor: number | null;
}

interface RegiaoEntrega {
  id: string;
  nome: string;
  diasSemanaEntrega: number[];
  horarioCorte: string;
}

interface CheckoutFormProps {
  produtos: ProdutoComPreco[];
  boletoLiberado: boolean;
  boletoPrazosDias: number[];
  regiao: RegiaoEntrega;
}

type MetodoPagamento = "pix" | "cartao" | "boleto";

function formatarDataExibicao(isoDate: string): string {
  const [ano, mes, dia] = isoDate.split("-").map(Number);
  return new Date(ano!, mes! - 1, dia!).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export function CheckoutForm({
  produtos,
  boletoLiberado,
  boletoPrazosDias,
  regiao,
}: CheckoutFormProps) {
  const router = useRouter();
  const { itens, atualizarQuantidade, removerItem, limparCarrinho } = useCart();
  const [metodoPagamento, setMetodoPagamento] = useState<MetodoPagamento>("pix");
  const [prazoDiasEscolhido, setPrazoDiasEscolhido] = useState<number | null>(
    boletoPrazosDias[0] ?? null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const produtoPorId = new Map(produtos.map((p) => [p.id, p]));

  const linhasCarrinho = itens.map((item) => {
    const produto = produtoPorId.get(item.produtoId);
    const indisponivel = !produto || !produto.available || produto.valor === null;
    const valor = produto?.valor ?? null;
    const subtotal = valor !== null ? valor * item.quantidade : null;
    return { ...item, indisponivel, valor, subtotal, nomeAtual: produto?.nome ?? item.nome };
  });

  const temItemIndisponivel = linhasCarrinho.some((l) => l.indisponivel);
  const total = linhasCarrinho.reduce((soma, l) => soma + (l.subtotal ?? 0), 0);

  const dataEntregaPrevista = calcularProximaDataEntrega(
    new Date(),
    regiao.diasSemanaEntrega,
    regiao.horarioCorte,
  );

  const boletoDisponivel = boletoLiberado && boletoPrazosDias.length > 0;

  const podeConfirmar =
    itens.length > 0 &&
    !temItemIndisponivel &&
    (metodoPagamento !== "boleto" || prazoDiasEscolhido !== null);

  const handleConfirmar = async () => {
    setIsSubmitting(true);
    try {
      const resultado = await confirmarPedido({
        itens: itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade })),
        metodoPagamento,
        prazoDiasEscolhido: metodoPagamento === "boleto" ? prazoDiasEscolhido : null,
      });
      if (!resultado.success) {
        toast.error(resultado.error);
        return;
      }
      limparCarrinho();
      router.push(`/portal/pedidos/${resultado.pedidoId}`);
    } catch {
      toast.error("Erro inesperado ao confirmar o pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <Link
          href="/portal/catalogo"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-black text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Voltar ao Catálogo
        </Link>

        <h1 className="text-4xl md:text-5xl font-serif italic text-foreground mb-10">
          Finalizar Pedido
        </h1>

        {itens.length === 0 ? (
          <div className="bg-card border border-border rounded-[2rem] p-10 text-center">
            <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-card border border-border rounded-[2rem] overflow-hidden">
              {linhasCarrinho.map((linha) => (
                <div
                  key={linha.produtoId}
                  className="flex items-center justify-between gap-4 px-6 py-5 border-b border-border last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="font-sans font-semibold text-sm text-foreground truncate">
                      {linha.nomeAtual}
                    </p>
                    {linha.indisponivel ? (
                      <Badge
                        variant="outline"
                        className="mt-1 bg-rose-50 border-rose-100 text-rose-600 text-[9px] uppercase tracking-widest font-black px-2"
                      >
                        Indisponível — remova para continuar
                      </Badge>
                    ) : (
                      <p className="text-xs text-muted-foreground font-sans">
                        {formatBRL(linha.valor!)} / un.
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center border border-border rounded-full">
                      <button
                        type="button"
                        onClick={() => atualizarQuantidade(linha.produtoId, linha.quantidade - 1)}
                        aria-label="Diminuir quantidade"
                        className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm font-sans font-semibold">
                        {linha.quantidade}
                      </span>
                      <button
                        type="button"
                        onClick={() => atualizarQuantidade(linha.produtoId, linha.quantidade + 1)}
                        aria-label="Aumentar quantidade"
                        className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="w-20 text-right text-sm font-sans font-semibold text-foreground">
                      {linha.subtotal !== null ? formatBRL(linha.subtotal) : "—"}
                    </span>
                    <button
                      type="button"
                      onClick={() => removerItem(linha.produtoId)}
                      aria-label={`Remover ${linha.nomeAtual}`}
                      className="text-muted-foreground hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between px-6 py-5 bg-background/50">
                <span className="text-xs uppercase tracking-widest font-black text-muted-foreground">
                  Total
                </span>
                <span className="text-xl font-serif italic text-primary">{formatBRL(total)}</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-[2rem] p-6">
              <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                Forma de Pagamento
              </Label>
              <div
                className={cn(
                  "grid gap-2 bg-background border border-border rounded-xl p-1 mt-2",
                  boletoDisponivel ? "grid-cols-3" : "grid-cols-2",
                )}
              >
                {(["pix", "cartao", "boleto"] as const)
                  .filter((m) => m !== "boleto" || boletoDisponivel)
                  .map((metodo) => (
                    <button
                      key={metodo}
                      type="button"
                      onClick={() => setMetodoPagamento(metodo)}
                      className={cn(
                        "rounded-lg py-2.5 text-[10px] font-black uppercase tracking-widest transition-all",
                        metodoPagamento === metodo
                          ? "bg-primary text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {metodo === "pix" ? "PIX" : metodo === "cartao" ? "Cartão" : "Boleto"}
                    </button>
                  ))}
              </div>

              {metodoPagamento === "boleto" && (
                <div className="mt-4 space-y-2">
                  <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                    Prazo
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {boletoPrazosDias.map((prazo) => (
                      <button
                        key={prazo}
                        type="button"
                        onClick={() => setPrazoDiasEscolhido(prazo)}
                        className={cn(
                          "rounded-full px-4 py-2 text-xs font-sans font-semibold border transition-colors",
                          prazoDiasEscolhido === prazo
                            ? "bg-primary text-white border-primary"
                            : "border-border text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {prazo} dias
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-[2rem] p-6 flex items-start gap-4">
              <Truck className="text-primary shrink-0 mt-1" size={20} />
              <div>
                <p className="text-xs uppercase tracking-widest font-black text-muted-foreground mb-1">
                  Previsão de Entrega
                </p>
                <p className="text-sm font-sans font-semibold text-foreground capitalize">
                  {formatarDataExibicao(dataEntregaPrevista)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Região: {regiao.nome} — a data final é confirmada ao finalizar o pedido.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleConfirmar}
              disabled={!podeConfirmar || isSubmitting}
              className="w-full bg-primary text-white rounded-full py-6 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 h-auto"
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Confirmar Pedido
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
