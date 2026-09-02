"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { GrupoPreco } from "@/lib/data/clientes";
import {
  grupoPrecoSchema,
  type GrupoPrecoInput,
  type GrupoPrecoValues,
} from "@/lib/validation/preco";

interface GrupoPrecoFormProps {
  editingGrupo: GrupoPreco | null;
  onSubmit: (data: GrupoPrecoValues) => void;
  isPending: boolean;
}

export const GrupoPrecoForm = ({ editingGrupo, onSubmit, isPending }: GrupoPrecoFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GrupoPrecoInput, unknown, GrupoPrecoValues>({
    resolver: zodResolver(grupoPrecoSchema),
    defaultValues: {
      id: editingGrupo?.id,
      nome: editingGrupo?.nome ?? "",
      descricao: editingGrupo?.descricao ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-2">
        <Label
          htmlFor="nome"
          className="text-xs uppercase tracking-widest font-bold text-muted-foreground"
        >
          Nome do Grupo
        </Label>
        <Input
          id="nome"
          {...register("nome")}
          className="rounded-xl border-border bg-background focus:ring-primary h-12"
        />
        {errors.nome && <p className="text-[10px] text-rose-500">{errors.nome.message}</p>}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="descricao"
          className="text-xs uppercase tracking-widest font-bold text-muted-foreground"
        >
          Descrição
        </Label>
        <Textarea
          id="descricao"
          {...register("descricao")}
          className="rounded-xl border-border bg-background min-h-[100px]"
        />
      </div>

      <DialogFooter className="pt-6">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary text-white rounded-full py-6 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 h-auto"
        >
          {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
          {editingGrupo ? "Salvar Alterações" : "Criar Grupo"}
        </Button>
      </DialogFooter>
    </form>
  );
};
