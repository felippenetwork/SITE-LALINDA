"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, ClipboardList } from "lucide-react";
import { PedidoStatusBadge } from "@/components/portal/PedidoStatusBadge";
import { formatBRL } from "@/lib/format";
import type { PedidoFilaProducao } from "@/lib/data/pedido-admin";

const METODO_LABEL: Record<string, string> = {
  pix: "PIX",
  boleto: "Boleto",
};

function formatarData(isoDate: string): string {
  const [ano, mes, dia] = isoDate.split("-").map(Number);
  return new Date(ano!, mes! - 1, dia!).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

interface FilaProducaoTableProps {
  pedidos: PedidoFilaProducao[];
  isLoading: boolean;
}

export const FilaProducaoTable = ({ pedidos, isLoading }: FilaProducaoTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="pl-8 py-6 text-[10px] uppercase tracking-widest font-black">
            Entrega
          </TableHead>
          <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black">
            Cliente
          </TableHead>
          <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black">
            Itens
          </TableHead>
          <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black">
            Pagamento
          </TableHead>
          <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black">
            Status
          </TableHead>
          <TableHead className="text-right pr-8 py-6 text-[10px] uppercase tracking-widest font-black">
            Valor
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pedidos.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={6} className="py-16 px-6">
              <div className="flex flex-col items-center justify-center text-center">
                <ClipboardList className="text-stone-300 mb-4" size={32} />
                <p className="text-sm text-muted-foreground">
                  Nenhum pedido pronto para produção no momento.
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          pedidos.map((pedido) => (
            <TableRow
              key={pedido.id}
              className="border-border hover:bg-background/50 transition-colors"
            >
              <TableCell className="pl-8 py-6">
                <span className="text-[10px] font-sans font-black uppercase tracking-widest text-muted-foreground">
                  {formatarData(pedido.dataEntregaPrevista)}
                </span>
              </TableCell>
              <TableCell>
                <span className="font-sans font-semibold text-sm text-foreground">
                  {pedido.clienteNome}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground font-sans">
                  {pedido.itensCount} {pedido.itensCount === 1 ? "item" : "itens"}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="bg-primary/5 border-primary/10 text-primary text-[9px] uppercase tracking-widest font-black px-3"
                >
                  {METODO_LABEL[pedido.metodoPagamento] ?? pedido.metodoPagamento}
                </Badge>
              </TableCell>
              <TableCell>
                <PedidoStatusBadge status={pedido.status} />
              </TableCell>
              <TableCell className="text-right pr-8">
                <span className="text-sm font-sans font-semibold text-foreground">
                  {formatBRL(pedido.valorTotal)}
                </span>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
