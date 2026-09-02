"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Tags } from "lucide-react";
import { saveGrupoPreco, deleteGrupoPreco } from "@/lib/actions/grupos-preco";
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
import { GrupoPrecoForm } from "@/components/forms/GrupoPrecoForm";
import type { GrupoPreco } from "@/lib/data/clientes";
import type { GrupoPrecoValues } from "@/lib/validation/preco";

interface GruposPrecoPanelProps {
  grupos: GrupoPreco[];
  isLoading: boolean;
}

export const GruposPrecoPanel = ({ grupos, isLoading }: GruposPrecoPanelProps) => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState<GrupoPreco | null>(null);
  const [grupoPendingDelete, setGrupoPendingDelete] = useState<GrupoPreco | null>(null);

  const saveMutation = useMutation({
    mutationFn: saveGrupoPreco,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grupos-preco"] });
      toast.success(editingGrupo ? "Grupo atualizado" : "Grupo criado");
      setIsDialogOpen(false);
      setEditingGrupo(null);
    },
    onError: (error: Error) => {
      toast.error("Erro ao salvar: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGrupoPreco,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grupos-preco"] });
      toast.success("Grupo removido");
      setGrupoPendingDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setGrupoPendingDelete(null);
    },
  });

  const handleSave = (data: GrupoPrecoValues) => {
    saveMutation.mutate({ ...data, id: editingGrupo?.id });
  };

  return (
    <Card className="rounded-[1.5rem] md:rounded-[2rem] border-border shadow-sm overflow-hidden">
      <CardHeader className="bg-background/50 border-b border-border p-6 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-muted-foreground">
          Grupos de Preço
        </CardTitle>

        <Dialog
          open={isDialogOpen || !!editingGrupo}
          onOpenChange={(open) => {
            if (!open) {
              setIsDialogOpen(false);
              setEditingGrupo(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => setIsDialogOpen(true)}
              size="icon"
              className="bg-primary hover:scale-105 transition-transform text-white rounded-full h-9 w-9 shadow-lg shadow-primary/20 shrink-0"
              aria-label="Novo grupo"
            >
              <Plus size={16} />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-[460px] rounded-[1.5rem] sm:rounded-[2rem] border-border p-6 sm:p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-3xl font-serif italic">
                {editingGrupo ? "Editar Grupo" : "Novo Grupo"}
              </DialogTitle>
            </DialogHeader>
            <GrupoPrecoForm
              editingGrupo={editingGrupo}
              onSubmit={handleSave}
              isPending={saveMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : grupos.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <Tags className="text-stone-300 mb-4" size={32} />
            <p className="text-sm text-muted-foreground mb-4">Nenhum grupo cadastrado ainda.</p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary text-white rounded-full px-6 py-5 font-black text-[10px] uppercase tracking-widest h-auto"
            >
              <Plus size={14} className="mr-2" /> Criar Primeiro Grupo
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="pl-6 text-[10px] uppercase tracking-widest font-black">
                  Nome
                </TableHead>
                <TableHead className="text-right pr-6 text-[10px] uppercase tracking-widest font-black">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grupos.map((grupo) => (
                <TableRow
                  key={grupo.id}
                  className="border-border hover:bg-background/50 transition-colors group"
                >
                  <TableCell className="pl-6 py-4">
                    <span className="font-sans font-semibold text-sm text-foreground">
                      {grupo.nome}
                    </span>
                    {grupo.descricao && (
                      <p className="text-xs text-muted-foreground mt-0.5">{grupo.descricao}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6 space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Editar grupo"
                      onClick={() => setEditingGrupo(grupo)}
                      className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm hover:text-primary transition-all"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Excluir grupo"
                      disabled={deleteMutation.isPending && deleteMutation.variables === grupo.id}
                      onClick={() => setGrupoPendingDelete(grupo)}
                      className="h-9 w-9 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all"
                    >
                      {deleteMutation.isPending && deleteMutation.variables === grupo.id ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <AlertDialog
        open={!!grupoPendingDelete}
        onOpenChange={(open) => !open && setGrupoPendingDelete(null)}
      >
        <AlertDialogContent className="rounded-[1.5rem] border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir grupo</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente excluir o grupo &quot;{grupoPendingDelete?.nome}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => grupoPendingDelete && deleteMutation.mutate(grupoPendingDelete.id)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
