"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, TrendingUp } from "lucide-react";
import { formatBRL } from "@/lib/format";
import type { VendasPorPeriodo } from "@/lib/data/financeiro";

interface VendasPorPeriodoTableProps {
  dados: VendasPorPeriodo | undefined;
  isLoading: boolean;
}

const GRANULARIDADE_LABEL: Record<string, string> = {
  diario: "Dia",
  semanal: "Semana de",
  mensal: "Mês",
};

function formatarPeriodo(chave: string, granularidade: string): string {
  if (granularidade === "mensal") {
    const [ano, mes] = chave.split("-").map(Number);
    return new Date(ano!, mes! - 1, 1).toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  }
  const [ano, mes, dia] = chave.split("-").map(Number);
  return new Date(ano!, mes! - 1, dia!).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export const VendasPorPeriodoTable = ({ dados, isLoading }: VendasPorPeriodoTableProps) => {
  if (isLoading || !dados) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const rotuloColuna = GRANULARIDADE_LABEL[dados.granularidade] ?? "Período";

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="pl-8 py-6 text-[10px] uppercase tracking-widest font-black">
            {rotuloColuna}
          </TableHead>
          <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black text-right">
            Pedidos
          </TableHead>
          <TableHead className="text-right pr-8 py-6 text-[10px] uppercase tracking-widest font-black">
            Total Vendido
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dados.buckets.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={3} className="py-16 px-6">
              <div className="flex flex-col items-center justify-center text-center">
                <TrendingUp className="text-stone-300 mb-4" size={32} />
                <p className="text-sm text-muted-foreground">
                  Nenhuma venda confirmada nesse período.
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          dados.buckets.map((bucket) => (
            <TableRow
              key={bucket.periodo}
              className="border-border hover:bg-background/50 transition-colors"
            >
              <TableCell className="pl-8 py-6">
                <span className="font-sans font-semibold text-sm text-foreground capitalize">
                  {formatarPeriodo(bucket.periodo, dados.granularidade)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className="text-sm text-muted-foreground font-sans">{bucket.qtdPedidos}</span>
              </TableCell>
              <TableCell className="text-right pr-8">
                <span className="text-sm font-sans font-semibold text-foreground">
                  {formatBRL(bucket.totalVendido)}
                </span>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
