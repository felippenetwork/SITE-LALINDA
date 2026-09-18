"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Package } from "lucide-react";
import { formatBRL } from "@/lib/format";
import type { VendaPorProduto } from "@/lib/data/financeiro";

interface VendasPorProdutoTableProps {
  vendas: VendaPorProduto[];
  isLoading: boolean;
}

export const VendasPorProdutoTable = ({ vendas, isLoading }: VendasPorProdutoTableProps) => {
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
            Produto
          </TableHead>
          <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black text-right">
            Quantidade Vendida
          </TableHead>
          <TableHead className="text-right pr-8 py-6 text-[10px] uppercase tracking-widest font-black">
            Valor Total
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vendas.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={3} className="py-16 px-6">
              <div className="flex flex-col items-center justify-center text-center">
                <Package className="text-stone-300 mb-4" size={32} />
                <p className="text-sm text-muted-foreground">
                  Nenhuma venda confirmada nesse período.
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          vendas.map((venda) => (
            <TableRow
              key={venda.produtoId}
              className="border-border hover:bg-background/50 transition-colors"
            >
              <TableCell className="pl-8 py-6">
                <span className="font-sans font-semibold text-sm text-foreground">
                  {venda.produtoNome}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className="text-sm text-muted-foreground font-sans">
                  {venda.quantidadeVendida}
                </span>
              </TableCell>
              <TableCell className="text-right pr-8">
                <span className="text-sm font-sans font-semibold text-foreground">
                  {formatBRL(venda.valorTotal)}
                </span>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
