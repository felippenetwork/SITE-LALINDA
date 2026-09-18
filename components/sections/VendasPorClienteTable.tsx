"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, BarChart3 } from "lucide-react";
import { formatBRL } from "@/lib/format";
import type { VendaPorCliente } from "@/lib/data/financeiro";

interface VendasPorClienteTableProps {
  vendas: VendaPorCliente[];
  isLoading: boolean;
}

export const VendasPorClienteTable = ({ vendas, isLoading }: VendasPorClienteTableProps) => {
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
            Cliente
          </TableHead>
          <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black text-right">
            Pedidos
          </TableHead>
          <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black text-right">
            Ticket Médio
          </TableHead>
          <TableHead className="text-right pr-8 py-6 text-[10px] uppercase tracking-widest font-black">
            Total Vendido
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vendas.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={4} className="py-16 px-6">
              <div className="flex flex-col items-center justify-center text-center">
                <BarChart3 className="text-stone-300 mb-4" size={32} />
                <p className="text-sm text-muted-foreground">
                  Nenhuma venda confirmada nesse período.
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          vendas.map((venda) => (
            <TableRow
              key={venda.clienteId}
              className="border-border hover:bg-background/50 transition-colors"
            >
              <TableCell className="pl-8 py-6">
                <span className="font-sans font-semibold text-sm text-foreground">
                  {venda.clienteNome}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className="text-sm text-muted-foreground font-sans">{venda.qtdPedidos}</span>
              </TableCell>
              <TableCell className="text-right">
                <span className="text-sm text-muted-foreground font-sans">
                  {formatBRL(venda.ticketMedio)}
                </span>
              </TableCell>
              <TableCell className="text-right pr-8">
                <span className="text-sm font-sans font-semibold text-foreground">
                  {formatBRL(venda.totalVendido)}
                </span>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
