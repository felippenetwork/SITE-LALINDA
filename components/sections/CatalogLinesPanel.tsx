"use client";

import { useState } from "react";
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
  saveProductLine,
  deleteProductLine,
  toggleProductLineAvailability,
  reorderProductLines,
} from "@/lib/actions/product-lines";
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
import { Loader2, Plus, Pencil, Trash2, GripVertical, Layers } from "lucide-react";
import { ProductLineForm } from "@/components/forms/ProductLineForm";
import type { ProductLine } from "@/lib/data/product-lines";
import type { ProductLineValues } from "@/lib/validation/product-line";
import { cn } from "@/lib/utils";

interface CatalogLinesPanelProps {
  lines: ProductLine[];
  isLoading: boolean;
  selectedLineId: string | null;
  onSelectLine: (id: string) => void;
}

interface SortableLineRowProps {
  line: ProductLine;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (available: boolean) => void;
  isToggling: boolean;
  isDeleting: boolean;
}

const SortableLineRow = ({
  line,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onToggle,
  isToggling,
  isDeleting,
}: SortableLineRowProps) => {
  const { setNodeRef, transform, transition, isDragging, attributes, listeners } = useSortable({
    id: line.id,
  });

  return (
    <TableRow
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={onSelect}
      className={cn(
        "border-stone-50 cursor-pointer transition-colors group",
        isDragging ? "relative z-10 bg-white opacity-70" : "",
        isSelected ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-stone-50/50",
      )}
    >
      <TableCell className="pl-4 py-4 w-8">
        <button
          type="button"
          aria-label={`Reordenar ${line.name}`}
          onClick={(e) => e.stopPropagation()}
          className="text-stone-300 opacity-40 group-hover:opacity-100 hover:text-stone-500 transition-opacity cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>
      </TableCell>
      <TableCell className="pl-2 py-4 w-14">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-stone-100 bg-stone-100">
          {line.image && (
            <Image src={line.image} alt="" fill sizes="40px" className="object-cover" />
          )}
        </div>
      </TableCell>
      <TableCell
        className={cn(
          "font-sans font-semibold text-sm",
          isSelected ? "text-primary" : "text-stone-900",
        )}
      >
        {line.name}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Switch checked={line.available} disabled={isToggling} onCheckedChange={onToggle} />
      </TableCell>
      <TableCell className="text-right pr-4 space-x-1" onClick={(e) => e.stopPropagation()}>
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

export const CatalogLinesPanel = ({
  lines,
  isLoading,
  selectedLineId,
  onSelectLine,
}: CatalogLinesPanelProps) => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<ProductLine | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const saveLineMutation = useMutation({
    mutationFn: saveProductLine,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["product-lines"] });
      toast.success(editingLine ? "Linha atualizada" : "Nova linha adicionada");
      setIsDialogOpen(false);
      if (!editingLine) onSelectLine(result.id);
      setEditingLine(null);
    },
    onError: (error: Error) => {
      toast.error("Erro ao salvar: " + error.message);
    },
  });

  const deleteLineMutation = useMutation({
    mutationFn: ({ id, cascade }: { id: string; cascade?: boolean }) =>
      deleteProductLine(id, cascade ? { cascade } : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-lines"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Linha removida com sucesso");
    },
    onError: (error: Error, variables) => {
      if (error.message.includes("existem produtos cadastrados")) {
        const line = lines.find((l) => l.id === variables.id);
        const confirmCascade = confirm(
          `A linha "${line?.name ?? ""}" possui produtos cadastrados nela.\n\n` +
            "Deseja excluir a linha E todos os produtos cadastrados nela? Essa ação não pode ser desfeita.",
        );
        if (confirmCascade) {
          deleteLineMutation.mutate({ id: variables.id, cascade: true });
        }
        return;
      }
      toast.error("Erro ao excluir: " + error.message);
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) =>
      toggleProductLineAvailability(id, available),
    onSuccess: (_data, { available }) => {
      queryClient.invalidateQueries({ queryKey: ["product-lines"] });
      toast.success(available ? "Linha ativada" : "Linha pausada");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar status: " + error.message);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: reorderProductLines,
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: ["product-lines"] });
      toast.error("Erro ao reordenar: " + error.message);
    },
  });

  const handleSave = (data: ProductLineValues) => {
    saveLineMutation.mutate({ ...data, id: editingLine?.id });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = lines.findIndex((l) => l.id === active.id);
    const newIndex = lines.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(lines, oldIndex, newIndex);

    queryClient.setQueryData(["product-lines"], reordered);
    reorderMutation.mutate(reordered.map((l) => l.id));
  };

  return (
    <Card className="rounded-[1.5rem] md:rounded-[2rem] border-stone-100 shadow-sm overflow-hidden">
      <CardHeader className="bg-stone-50/50 border-b border-stone-100 p-6 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-stone-500">
          Linhas de Produtos
        </CardTitle>

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
              size="icon"
              className="bg-primary hover:scale-105 transition-transform text-white rounded-full h-9 w-9 shadow-lg shadow-primary/20 shrink-0"
              aria-label="Nova linha"
            >
              <Plus size={16} />
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
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : lines.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <Layers className="text-stone-300 mb-4" size={32} />
            <p className="text-sm text-stone-500 mb-4">Nenhuma linha cadastrada ainda.</p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary text-white rounded-full px-6 py-5 font-black text-[10px] uppercase tracking-widest h-auto"
            >
              <Plus size={14} className="mr-2" /> Criar Primeira Linha
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
                <TableRow className="border-stone-100 hover:bg-transparent">
                  <TableHead className="w-8 pl-4"></TableHead>
                  <TableHead className="w-14 pl-2"></TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest font-black">
                    Nome
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest font-black">
                    Ativa
                  </TableHead>
                  <TableHead className="text-right pr-4 text-[10px] uppercase tracking-widest font-black">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SortableContext
                  items={lines.map((l) => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {lines.map((line) => (
                    <SortableLineRow
                      key={line.id}
                      line={line}
                      isSelected={line.id === selectedLineId}
                      onSelect={() => onSelectLine(line.id)}
                      onEdit={() => setEditingLine(line)}
                      onDelete={() => {
                        if (confirm(`Deseja realmente excluir a linha "${line.name}"?`)) {
                          deleteLineMutation.mutate({ id: line.id });
                        }
                      }}
                      onToggle={(available) =>
                        toggleAvailabilityMutation.mutate({ id: line.id, available })
                      }
                      isToggling={toggleAvailabilityMutation.isPending}
                      isDeleting={
                        deleteLineMutation.isPending && deleteLineMutation.variables?.id === line.id
                      }
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
};
