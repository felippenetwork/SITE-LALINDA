"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Grid3x3 } from "lucide-react";
import { savePrecoExcecao } from "@/lib/actions/precos";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriceCell } from "@/components/shared/PriceCell";
import { formatBRL } from "@/lib/format";
import type { BreadItem } from "@/lib/data/products";
import type { Preco, PrecoExcecao } from "@/lib/data/precos";

interface ClientePrecoTableProps {
  clienteId: string;
  products: BreadItem[];
  precosDoGrupo: Preco[];
  excecoes: PrecoExcecao[];
  isLoading: boolean;
}

export const ClientePrecoTable = ({
  clienteId,
  products,
  precosDoGrupo,
  excecoes,
  isLoading,
}: ClientePrecoTableProps) => {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (variables: { cliente_id: string; produto_id: string; valor: number | null }) =>
      savePrecoExcecao(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preco-excecoes", clienteId] });
    },
    onError: (error: Error) => {
      toast.error("Erro ao salvar exceção: " + error.message);
    },
  });

  const herdadoByProduto = new Map(precosDoGrupo.map((p) => [p.produto_id, p.valor]));
  const excecaoByProduto = new Map(excecoes.map((e) => [e.produto_id, e.valor]));

  return (
    <Card className="rounded-[1.5rem] md:rounded-[2rem] border-border shadow-sm overflow-hidden">
      <CardHeader className="bg-background/50 border-b border-border p-6 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-muted-foreground">
          Preços do Cliente
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <Grid3x3 className="text-stone-300 mb-4" size={32} />
            <p className="text-sm text-muted-foreground">Nenhum produto cadastrado ainda.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="pl-6 text-[10px] uppercase tracking-widest font-black">
                  Produto
                </TableHead>
                <TableHead className="text-center text-[10px] uppercase tracking-widest font-black">
                  Preço do Grupo
                </TableHead>
                <TableHead className="text-center pr-6 text-[10px] uppercase tracking-widest font-black">
                  Preço Vigente
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const herdado = herdadoByProduto.get(product.id) ?? null;
                const excecao = excecaoByProduto.get(product.id) ?? null;
                const vigente = excecao ?? herdado;
                const isSaving =
                  saveMutation.isPending && saveMutation.variables?.produto_id === product.id;

                return (
                  <TableRow
                    key={product.id}
                    className="border-border hover:bg-background/50 transition-colors"
                  >
                    <TableCell className="pl-6 font-sans font-semibold text-sm text-foreground">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground font-sans">
                      {herdado !== null ? formatBRL(herdado) : "—"}
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex items-center justify-center gap-2">
                        <PriceCell
                          value={vigente}
                          isSaving={isSaving}
                          onSave={(valor) =>
                            saveMutation.mutate({
                              cliente_id: clienteId,
                              produto_id: product.id,
                              valor,
                            })
                          }
                        />
                        {vigente !== null && (
                          <Badge
                            variant="outline"
                            className={
                              excecao !== null
                                ? "bg-primary/5 border-primary/10 text-primary text-[9px] uppercase tracking-widest font-black px-2"
                                : "bg-background border-border text-muted-foreground text-[9px] uppercase tracking-widest font-black px-2"
                            }
                          >
                            {excecao !== null ? "Exceção" : "Herdado"}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
