"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  saveProduct,
  deleteProduct,
  toggleProductAvailability,
  reorderProducts,
} from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Croissant,
  MousePointerClick,
} from "lucide-react";
import { ProductForm } from "@/components/forms/ProductForm";
import type { BreadItem } from "@/lib/data/products";
import type { ProductLine } from "@/lib/data/product-lines";
import type { ProductFormValues } from "@/lib/validation/product";
import { cn } from "@/lib/utils";

interface CatalogProductsPanelProps {
  products: BreadItem[];
  allLines: ProductLine[];
  selectedLine: ProductLine | null;
  isLoading: boolean;
}

interface SortableProductRowProps {
  product: BreadItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (available: boolean) => void;
  isToggling: boolean;
  isDeleting: boolean;
}

const SortableProductRow = ({
  product,
  onEdit,
  onDelete,
  onToggle,
  isToggling,
  isDeleting,
}: SortableProductRowProps) => {
  const { setNodeRef, transform, transition, isDragging, attributes, listeners } = useSortable({
    id: product.id,
  });

  return (
    <TableRow
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "border-border hover:bg-background/50 transition-colors group",
        isDragging ? "relative z-10 bg-white opacity-70" : "",
      )}
    >
      <TableCell className="pl-4 py-4 w-8">
        <button
          type="button"
          aria-label={`Reordenar ${product.name}`}
          className="text-stone-300 opacity-40 group-hover:opacity-100 hover:text-muted-foreground transition-opacity cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>
      </TableCell>
      <TableCell className="pl-2 py-4 w-14">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-border group-hover:scale-110 transition-transform">
          <Image src={product.image} alt="" fill sizes="40px" className="object-cover" />
        </div>
      </TableCell>
      <TableCell className="font-sans font-semibold text-sm text-foreground">
        {product.name}
      </TableCell>
      <TableCell className="font-sans text-xs text-muted-foreground">
        {product.weight} / <span className="text-muted-foreground">{product.boxWeight || "-"}</span>
      </TableCell>
      <TableCell>
        <Switch checked={product.available} disabled={isToggling} onCheckedChange={onToggle} />
      </TableCell>
      <TableCell className="text-right pr-4 space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm hover:text-primary transition-all"
        >
          <Pencil size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={isDeleting}
          onClick={onDelete}
          className="h-9 w-9 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all"
        >
          {isDeleting ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
        </Button>
      </TableCell>
    </TableRow>
  );
};

export const CatalogProductsPanel = ({
  products,
  allLines,
  selectedLine,
  isLoading,
}: CatalogProductsPanelProps) => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BreadItem | null>(null);
  const [productPendingDelete, setProductPendingDelete] = useState<BreadItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const lineProducts = useMemo(
    () => products.filter((p) => p.categoryId === selectedLine?.id),
    [products, selectedLine],
  );

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
      setProductPendingDelete(null);
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir: " + error.message);
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) =>
      toggleProductAvailability(id, available),
    onSuccess: (_data, { available }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(available ? "Produto ativado" : "Produto pausado");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar status: " + error.message);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: reorderProducts,
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.error("Erro ao reordenar: " + error.message);
    },
  });

  const handleSave = (data: ProductFormValues) => {
    saveProductMutation.mutate({ ...data, id: editingItem?.id });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = lineProducts.findIndex((p) => p.id === active.id);
    const newIndex = lineProducts.findIndex((p) => p.id === over.id);
    const reorderedLineProducts = arrayMove(lineProducts, oldIndex, newIndex);
    const reorderedIds = new Set(reorderedLineProducts.map((p) => p.id));

    // Splice the reordered subset back into the full products list, keeping
    // products from other lines untouched (the query cache holds all of them).
    let cursor = 0;
    const fullReordered = products.map((p) =>
      reorderedIds.has(p.id) ? reorderedLineProducts[cursor++]! : p,
    );

    queryClient.setQueryData(["products"], fullReordered);
    reorderMutation.mutate(reorderedLineProducts.map((p) => p.id));
  };

  if (!selectedLine) {
    return (
      <Card className="rounded-[1.5rem] md:rounded-[2rem] border-border shadow-sm overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center text-center py-24 px-6">
          <MousePointerClick className="text-stone-300 mb-4" size={32} />
          <p className="text-sm text-muted-foreground">
            Crie ou selecione uma linha à esquerda para gerenciar os produtos dela.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[1.5rem] md:rounded-[2rem] border-border shadow-sm overflow-hidden">
      <CardHeader className="bg-background/50 border-b border-border p-6 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-muted-foreground">
          Produtos — {selectedLine.name}
        </CardTitle>

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
              size="icon"
              className="bg-primary hover:scale-105 transition-transform text-white rounded-full h-9 w-9 shadow-lg shadow-primary/20 shrink-0"
              aria-label="Novo produto"
            >
              <Plus size={16} />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-[500px] rounded-[1.5rem] sm:rounded-[2rem] border-border p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-3xl font-serif italic">
                {editingItem ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              editingItem={editingItem}
              lines={allLines}
              defaultCategoryId={selectedLine.id}
              onSubmit={handleSave}
              isPending={saveProductMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : lineProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <Croissant className="text-stone-300 mb-4" size={32} />
            <p className="text-sm text-muted-foreground mb-4">
              Nenhum produto cadastrado nesta linha ainda.
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary text-white rounded-full px-6 py-5 font-black text-[10px] uppercase tracking-widest h-auto"
            >
              <Plus size={14} className="mr-2" /> Novo Produto
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-8 pl-4"></TableHead>
                  <TableHead className="w-14 pl-2"></TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest font-black">
                    Produto
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest font-black">
                    Peso/Caixa
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest font-black">
                    Ativo
                  </TableHead>
                  <TableHead className="text-right pr-4 text-[10px] uppercase tracking-widest font-black">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SortableContext
                  items={lineProducts.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {lineProducts.map((product) => (
                    <SortableProductRow
                      key={product.id}
                      product={product}
                      onEdit={() => setEditingItem(product)}
                      onDelete={() => setProductPendingDelete(product)}
                      onToggle={(available) =>
                        toggleAvailabilityMutation.mutate({ id: product.id, available })
                      }
                      isToggling={toggleAvailabilityMutation.isPending}
                      isDeleting={
                        deleteProductMutation.isPending &&
                        deleteProductMutation.variables === product.id
                      }
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </DndContext>
        )}
      </CardContent>

      <AlertDialog
        open={!!productPendingDelete}
        onOpenChange={(open) => !open && setProductPendingDelete(null)}
      >
        <AlertDialogContent className="rounded-[1.5rem] border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente excluir o produto &quot;{productPendingDelete?.name}&quot;? Essa ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                productPendingDelete && deleteProductMutation.mutate(productPendingDelete.id)
              }
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
