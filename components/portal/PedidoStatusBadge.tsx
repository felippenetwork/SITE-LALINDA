import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  recebido: "Recebido",
  aprovado: "Aprovado",
  em_producao: "Em Produção",
  em_rota: "Em Rota de Entrega",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const STATUS_STYLE: Record<string, string> = {
  recebido: "bg-background border-border text-muted-foreground",
  aprovado: "bg-sky-50 border-sky-100 text-sky-700",
  em_producao: "bg-amber-50 border-amber-100 text-amber-700",
  em_rota: "bg-primary/10 border-primary/20 text-primary",
  entregue: "bg-emerald-50 border-emerald-100 text-emerald-700",
  cancelado: "bg-rose-50 border-rose-100 text-rose-600",
};

// Compartilhado entre a lista (/portal/pedidos) e o detalhe
// (/portal/pedidos/[id]) — mesmo rótulo/cor nos dois lugares. Pedido
// cancelado não é escondido em nenhuma tela, só marcado com esta cor.
export function PedidoStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[9px] uppercase tracking-widest font-black px-3 py-1 shrink-0",
        STATUS_STYLE[status] ?? STATUS_STYLE["recebido"],
      )}
    >
      {STATUS_LABEL[status] ?? status}
    </Badge>
  );
}
