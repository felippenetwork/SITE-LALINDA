"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Grid3x3 } from "lucide-react";
import { savePreco } from "@/lib/actions/precos";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PriceCell } from "@/components/shared/PriceCell";
import type { BreadItem } from "@/lib/data/products";
import type { GrupoPreco } from "@/lib/data/clientes";
import type { Preco } from "@/lib/data/precos";

interface PrecoMatrixProps {
  products: BreadItem[];
  grupos: GrupoPreco[];
  precos: Preco[];
  isLoading: boolean;
}

export const PrecoMatrix = ({ products, grupos, precos, isLoading }: PrecoMatrixProps) => {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (variables: { produto_id: string; grupo_preco_id: string; valor: number | null }) =>
      savePreco(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["precos"] });
    },
    onError: (error: Error) => {
      toast.error("Erro ao salvar preço: " + error.message);
    },
  });

  const valorByKey = new Map(precos.map((p) => [`${p.produto_id}|${p.grupo_preco_id}`, p.valor]));

  return (
    <Card className="rounded-[1.5rem] md:rounded-[2rem] border-border shadow-sm overflow-hidden">
      <CardHeader className="bg-background/50 border-b border-border p-6 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-muted-foreground">
          Matriz de Preços
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : grupos.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <Grid3x3 className="text-stone-300 mb-4" size={32} />
            <p className="text-sm text-muted-foreground">
              Crie um grupo de preço ao lado para começar a definir preços.
            </p>
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
                <TableHead className="text-[10px] uppercase tracking-widest font-black">
                  Linha
                </TableHead>
                {grupos.map((grupo) => (
                  <TableHead
                    key={grupo.id}
                    className="text-center text-[10px] uppercase tracking-widest font-black"
                  >
                    {grupo.nome}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product.id}
                  className="border-border hover:bg-background/50 transition-colors"
                >
                  <TableCell className="pl-6 font-sans font-semibold text-sm text-foreground">
                    {product.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-sans">
                    {product.category}
                  </TableCell>
                  {grupos.map((grupo) => {
                    const key = `${product.id}|${grupo.id}`;
                    const isSaving =
                      saveMutation.isPending &&
                      saveMutation.variables?.produto_id === product.id &&
                      saveMutation.variables?.grupo_preco_id === grupo.id;
                    return (
                      <TableCell key={grupo.id} className="text-center p-1">
                        <PriceCell
                          value={valorByKey.get(key) ?? null}
                          isSaving={isSaving}
                          onSave={(valor) =>
                            saveMutation.mutate({
                              produto_id: product.id,
                              grupo_preco_id: grupo.id,
                              valor,
                            })
                          }
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
