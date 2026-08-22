"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProductsAction, saveProduct, deleteProduct } from "@/lib/actions/products";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { ProductForm } from "@/components/forms/ProductForm";
import type { BreadItem } from "@/lib/data/products";
import type { ProductFormValues } from "@/lib/validation/product";

export default function AdminProdutosPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BreadItem | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProductsAction,
  });

  const saveProductMutation = useMutation({
    mutationFn: saveProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(editingItem ? "Produto atualizado" : "Novo produto adicionado");
      setIsDialogOpen(false);
      setEditingItem(null);
    },
    onError: (error: Error) => {
      toast.error("Erro ao salvar: " + error.message);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto removido com sucesso");
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir: " + error.message);
    },
  });

  const handleSave = (data: ProductFormValues) => {
    saveProductMutation.mutate({ ...data, id: editingItem?.id });
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
            Produtos Cadastrados
          </h2>
          <p className="text-stone-400 font-sans text-xs md:text-sm tracking-wide">
            Gestão do catálogo artesanal La Linda
          </p>
        </div>

        <Dialog
          open={isDialogOpen || !!editingItem}
          onOpenChange={(open) => {
            if (!open) {
              setIsDialogOpen(false);
              setEditingItem(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="w-full sm:w-auto bg-primary hover:scale-105 transition-transform text-white font-black px-8 py-6 rounded-full text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 h-auto"
            >
              <Plus size={16} className="mr-2" /> Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-[500px] rounded-[1.5rem] sm:rounded-[2rem] border-stone-100 p-6 sm:p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-3xl font-serif italic">
                {editingItem ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              editingItem={editingItem}
              onSubmit={handleSave}
              isPending={saveProductMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border-stone-100 shadow-sm overflow-hidden">
        <CardHeader className="bg-stone-50/50 border-b border-stone-100 p-6 md:p-8">
          <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-stone-500">
            Coleção Atual — {products.length} Itens
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
                  Produto
                </TableHead>
                <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black">
                  Categoria
                </TableHead>
                <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black">
                  Peso/Caixa
                </TableHead>
                <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black">
                  Status
                </TableHead>
                <TableHead className="text-right pr-8 py-6 text-[10px] uppercase tracking-widest font-black">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-stone-50 hover:bg-stone-50/50 transition-colors group"
                >
                  <TableCell className="pl-4 md:pl-8 py-4">
                    <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl overflow-hidden border border-stone-100 group-hover:scale-110 transition-transform">
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-serif italic text-lg text-stone-900">
                    {item.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-[9px] uppercase tracking-widest font-black border-stone-200 text-stone-400 rounded-full px-3"
                    >
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-sans text-sm text-stone-500">
                    {item.weight} / <span className="text-stone-300">{item.boxWeight || "-"}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${item.available ? "bg-green-500" : "bg-stone-300"}`}
                      ></div>
                      <span className="text-[10px] uppercase tracking-widest font-black text-stone-400">
                        {item.available ? "Ativo" : "Pausado"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-8 space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingItem(item)}
                      className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-lg hover:text-primary transition-all"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deleteProductMutation.isPending}
                      onClick={() => {
                        if (confirm("Deseja realmente excluir este produto?")) {
                          deleteProductMutation.mutate(item.id);
                        }
                      }}
                      className="h-10 w-10 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all"
                    >
                      {deleteProductMutation.isPending ? (
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
