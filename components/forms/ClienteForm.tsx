"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Cliente, GrupoPreco } from "@/lib/data/clientes";
import { clienteSchema, type ClienteInput, type ClienteValues } from "@/lib/validation/cliente";

// Sublead de origem, só os campos usados para pré-preencher o cadastro
// avulso a partir de "Converter em cliente" em /admin/leads.
interface LeadPrefill {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface ClienteFormProps {
  editingCliente: Cliente | null;
  prefillLead: LeadPrefill | null;
  gruposPreco: GrupoPreco[];
  onSubmit: (data: ClienteValues) => void;
  isPending: boolean;
}

const SEM_GRUPO = "__sem_grupo__";

export const ClienteForm = ({
  editingCliente,
  prefillLead,
  gruposPreco,
  onSubmit,
  isPending,
}: ClienteFormProps) => {
  const [novoPrazo, setNovoPrazo] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClienteInput, unknown, ClienteValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      id: editingCliente?.id,
      razao_social: editingCliente?.razao_social ?? "",
      cnpj: editingCliente?.cnpj ?? "",
      inscricao_estadual: editingCliente?.inscricao_estadual ?? "",
      email: editingCliente?.email ?? prefillLead?.email ?? "",
      contato_nome: editingCliente?.contato_nome ?? prefillLead?.name ?? "",
      telefone: editingCliente?.telefone ?? prefillLead?.phone ?? "",
      logradouro: editingCliente?.logradouro ?? "",
      numero: editingCliente?.numero ?? "",
      bairro: editingCliente?.bairro ?? "",
      cidade: editingCliente?.cidade ?? "",
      uf: editingCliente?.uf ?? "",
      cep: editingCliente?.cep ?? "",
      grupo_preco_id: editingCliente?.grupo_preco_id ?? null,
      boleto_liberado: editingCliente?.boleto_liberado ?? false,
      boleto_prazos_dias: editingCliente?.boleto_prazos_dias ?? [],
    },
  });

  const boletoLiberado = watch("boleto_liberado") ?? false;
  const prazos = watch("boleto_prazos_dias") ?? [];

  const addPrazo = () => {
    const dias = Number(novoPrazo);
    if (!Number.isInteger(dias) || dias <= 0) return;
    if (prazos.includes(dias)) {
      setNovoPrazo("");
      return;
    }
    setValue(
      "boleto_prazos_dias",
      [...prazos, dias].sort((a, b) => a - b),
      {
        shouldValidate: true,
      },
    );
    setNovoPrazo("");
  };

  const removePrazo = (dias: number) => {
    setValue(
      "boleto_prazos_dias",
      prazos.filter((d) => d !== dias),
      { shouldValidate: true },
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-h-[70vh] overflow-y-auto pr-1"
      noValidate
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 sm:col-span-2">
          <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
            Razão Social
          </Label>
          <Input
            {...register("razao_social")}
            className="rounded-xl border-border bg-background h-12"
          />
          {errors.razao_social && (
            <p className="text-[10px] text-rose-500">{errors.razao_social.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
            CNPJ
          </Label>
          <Input
            {...register("cnpj")}
            placeholder="00.000.000/0000-00"
            className="rounded-xl border-border bg-background h-12"
          />
          {errors.cnpj && <p className="text-[10px] text-rose-500">{errors.cnpj.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
            Inscrição Estadual
          </Label>
          <Input
            {...register("inscricao_estadual")}
            className="rounded-xl border-border bg-background h-12"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
            E-mail
          </Label>
          <Input
            type="email"
            {...register("email")}
            className="rounded-xl border-border bg-background h-12"
          />
          {errors.email && <p className="text-[10px] text-rose-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
            Telefone
          </Label>
          <Input
            {...register("telefone")}
            className="rounded-xl border-border bg-background h-12"
          />
          {errors.telefone && (
            <p className="text-[10px] text-rose-500">{errors.telefone.message}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
            Nome do Contato
          </Label>
          <Input
            {...register("contato_nome")}
            className="rounded-xl border-border bg-background h-12"
          />
          {errors.contato_nome && (
            <p className="text-[10px] text-rose-500">{errors.contato_nome.message}</p>
          )}
        </div>
      </div>

      <div className="border-t border-border pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 sm:col-span-2">
          <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
            Logradouro
          </Label>
          <Input
            {...register("logradouro")}
            className="rounded-xl border-border bg-background h-12"
          />
          {errors.logradouro && (
            <p className="text-[10px] text-rose-500">{errors.logradouro.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
            Número
          </Label>
          <Input {...register("numero")} className="rounded-xl border-border bg-background h-12" />
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
            Bairro
          </Label>
          <Input {...register("bairro")} className="rounded-xl border-border bg-background h-12" />
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
            Cidade
          </Label>
          <Input {...register("cidade")} className="rounded-xl border-border bg-background h-12" />
          {errors.cidade && <p className="text-[10px] text-rose-500">{errors.cidade.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
              UF
            </Label>
            <Input
              {...register("uf")}
              maxLength={2}
              placeholder="SP"
              className="rounded-xl border-border bg-background h-12 uppercase"
            />
            {errors.uf && <p className="text-[10px] text-rose-500">{errors.uf.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
              CEP
            </Label>
            <Input
              {...register("cep")}
              placeholder="00000-000"
              className="rounded-xl border-border bg-background h-12"
            />
            {errors.cep && <p className="text-[10px] text-rose-500">{errors.cep.message}</p>}
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6 space-y-2">
        <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
          Grupo de Preço
        </Label>
        <Select
          value={watch("grupo_preco_id") ?? SEM_GRUPO}
          onValueChange={(value) =>
            setValue("grupo_preco_id", value === SEM_GRUPO ? null : value, {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger className="rounded-xl border-border bg-background h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SEM_GRUPO}>Sem grupo definido</SelectItem>
            {gruposPreco.map((grupo) => (
              <SelectItem key={grupo.id} value={grupo.id}>
                {grupo.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Obrigatório para aprovar o cliente — pode ficar em branco por enquanto.
        </p>
      </div>

      <div className="border-t border-border pt-6 space-y-4">
        <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
          Formas de Pagamento
        </Label>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          PIX e cartão são automáticos para todos os clientes. Boleto é opcional, por cliente.
        </p>

        <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
          <span className="text-sm font-sans font-semibold text-foreground">
            Liberar boleto para este cliente
          </span>
          <Switch
            checked={boletoLiberado}
            onCheckedChange={(checked) => setValue("boleto_liberado", checked)}
          />
        </div>

        {boletoLiberado && (
          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
              Prazos (dias)
            </Label>
            <div className="flex flex-wrap gap-2">
              {prazos.map((dias) => (
                <Badge
                  key={dias}
                  variant="outline"
                  className="bg-primary/5 border-primary/10 text-primary text-xs font-sans font-semibold px-3 py-1.5 gap-2"
                >
                  {dias} dias
                  <button
                    type="button"
                    onClick={() => removePrazo(dias)}
                    aria-label={`Remover prazo de ${dias} dias`}
                    className="hover:text-rose-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
              {prazos.length === 0 && (
                <p className="text-xs text-muted-foreground italic">Nenhum prazo adicionado.</p>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                min={1}
                value={novoPrazo}
                onChange={(e) => setNovoPrazo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addPrazo();
                  }
                }}
                placeholder="ex: 28"
                className="rounded-xl border-border bg-background h-11 w-32"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addPrazo}
                className="rounded-xl h-11 border-border"
              >
                <Plus size={14} className="mr-1" /> Adicionar
              </Button>
            </div>
          </div>
        )}
      </div>

      <DialogFooter className="pt-6">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary text-white rounded-full py-6 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 h-auto"
        >
          {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
          {editingCliente ? "Salvar Alterações" : "Cadastrar Cliente"}
        </Button>
      </DialogFooter>
    </form>
  );
};
