"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductLinesAction,
  saveProductLine,
  deleteProductLine,
} from "@/lib/actions/product-lines";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { ProductLineForm } from "@/components/forms/ProductLineForm";
import type { ProductLine } from "@/lib/data/product-lines";
import type { ProductLineValues } from "@/lib/validation/product-line";

export default function AdminLinhasPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<ProductLine | null>(null);

  const { data: lines = [], isLoading } = useQuery({
    queryKey: ["product-lines"],
    queryFn: getProductLinesAction,
  });

  const saveLineMutation = useMutation({
    mutationFn: saveProductLine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-lines"] });
      toast.success(editingLine ? "Linha atualizada" : "Nova linha adicionada");
      setIsDialogOpen(false);
      setEditingLine(null);
    },
    onError: (error: Error) => {
      toast.error("Erro ao salvar: " + error.message);
    },
  });

  const deleteLineMutation = useMutation({
    mutationFn: deleteProductLine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-lines"] });
      toast.success("Linha removida com sucesso");
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir: " + error.message);
    },
  });

  const handleSave = (data: ProductLineValues) => {
    saveLineMutation.mutate({ ...data, id: editingLine?.id });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-12 lg:mb-16">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif italic text-stone-900 mb-2">
            Linhas de Produtos
          </h2>
          <p className="text-stone-400 font-sans text-xs md:text-sm tracking-wide">
            Gestão das linhas do catálogo La Linda
          </p>
        </div>

        <Dialog
          open={isDialogOpen || !!editingLine}
          onOpenChange={(open) => {
            if (!open) {
              setIsDialogOpen(false);
              setEditingLine(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="w-full sm:w-auto bg-primary hover:scale-105 transition-transform text-white font-black px-8 py-6 rounded-full text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 h-auto"
            >
              <Plus size={16} className="mr-2" /> Nova Linha
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-[500px] rounded-[1.5rem] sm:rounded-[2rem] border-stone-100 p-6 sm:p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-3xl font-serif italic">
                {editingLine ? "Editar Linha" : "Nova Linha"}
              </DialogTitle>
            </DialogHeader>
            <ProductLineForm
              editingLine={editingLine}
              onSubmit={handleSave}
              isPending={saveLineMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border-stone-100 shadow-sm overflow-hidden">
        <CardHeader className="bg-stone-50/50 border-b border-stone-100 p-6 md:p-8">
          <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-stone-500">
            {lines.length} Linhas Cadastradas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-stone-100 hover:bg-transparent">
                <TableHead className="w-[100px] pl-8 py-6 text-[10px] uppercase tracking-widest font-black">
                  Visual
                </TableHead>
                <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black">
                  Nome
                </TableHead>
                <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black">
                  Slug
                </TableHead>
                <TableHead className="text-right pr-8 py-6 text-[10px] uppercase tracking-widest font-black">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line) => (
                <TableRow
                  key={line.id}
                  className="border-stone-50 hover:bg-stone-50/50 transition-colors group"
                >
                  <TableCell className="pl-4 md:pl-8 py-4">
                    <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl overflow-hidden border border-stone-100 bg-stone-100 group-hover:scale-110 transition-transform">
                      {line.image && (
                        <Image src={line.image} alt="" fill sizes="56px" className="object-cover" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-serif italic text-lg text-stone-900">
                    {line.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-stone-400">{line.slug}</TableCell>
                  <TableCell className="text-right pr-8 space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingLine(line)}
                      className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-lg hover:text-primary transition-all"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deleteLineMutation.isPending}
                      onClick={() => {
                        if (confirm(`Deseja realmente excluir a linha "${line.name}"?`)) {
                          deleteLineMutation.mutate(line.id);
                        }
                      }}
                      className="h-10 w-10 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all"
                    >
                      {deleteLineMutation.isPending ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
