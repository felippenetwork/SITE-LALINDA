"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, Loader2, Pencil, Plus, ShieldCheck, ShieldOff, Tags } from "lucide-react";
import { useIsAdmin } from "@/components/providers/AdminRoleProvider";
import {
  getClientesAction,
  getGruposPrecoAction,
  saveCliente,
  approveCliente,
  suspendCliente,
} from "@/lib/actions/clientes";
import type { ClienteValues } from "@/lib/validation/cliente";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClienteForm } from "@/components/forms/ClienteForm";
import type { Cliente } from "@/lib/data/clientes";
import { cn } from "@/lib/utils";

type StatusFilter = "todos" | "pendente_aprovacao" | "aprovado" | "suspenso";

const STATUS_LABEL: Record<Cliente["status"], string> = {
  pendente_aprovacao: "Pendente",
  aprovado: "Aprovado",
  suspenso: "Suspenso",
};

const STATUS_STYLE: Record<Cliente["status"], string> = {
  pendente_aprovacao: "text-muted-foreground bg-background border border-border",
  aprovado: "text-stone-700 bg-accent",
  suspenso: "text-rose-600 bg-rose-50",
};

function formatDocumento(tipo: string, digits: string): string {
  if (tipo === "cpf") {
    return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

interface LeadPrefill {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface ClientesManagerProps {
  initialPrefillLead: LeadPrefill | null;
  onPrefillConsumed: () => void;
}

export const ClientesManager = ({
  initialPrefillLead,
  onPrefillConsumed,
}: ClientesManagerProps) => {
  const queryClient = useQueryClient();
  const isAdmin = useIsAdmin();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [prefillLead, setPrefillLead] = useState<LeadPrefill | null>(null);
  const [clientePendingSuspend, setClientePendingSuspend] = useState<Cliente | null>(null);

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ["clientes"],
    queryFn: getClientesAction,
  });

  const { data: gruposPreco = [] } = useQuery({
    queryKey: ["grupos-preco"],
    queryFn: getGruposPrecoAction,
  });

  // Chegou via "Converter em cliente" em /admin/leads — abre o formulário
  // já preenchido. Ajuste de estado durante a renderização (não em efeito)
  // porque é uma reação direta à prop mudar, não uma sincronização com
  // sistema externo; só o aviso ao pai (que mexe na URL) vai para o efeito
  // abaixo.
  if (initialPrefillLead && initialPrefillLead.id !== prefillLead?.id) {
    setPrefillLead(initialPrefillLead);
    setEditingCliente(null);
    setIsDialogOpen(true);
  }

  useEffect(() => {
    if (prefillLead) onPrefillConsumed();
  }, [prefillLead, onPrefillConsumed]);

  const gruposPrecoById = new Map(gruposPreco.map((g) => [g.id, g.nome]));

  const saveMutation = useMutation({
    mutationFn: saveCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      queryClient.invalidateQueries({ queryKey: ["converted-lead-ids"] });
      toast.success(editingCliente ? "Cliente atualizado" : "Cliente cadastrado");
      setIsDialogOpen(false);
      setEditingCliente(null);
      setPrefillLead(null);
    },
    onError: (error: Error) => {
      toast.error("Erro ao salvar: " + error.message);
    },
  });

  const approveMutation = useMutation({
    mutationFn: approveCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente aprovado");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const suspendMutation = useMutation({
    mutationFn: suspendCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente suspenso");
      setClientePendingSuspend(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSave = (data: ClienteValues) => {
    // origem_lead_id não passa por register() no formulário (nunca é
    // editado pelo usuário) — igual ao padrão de `id` em
    // CatalogLinesPanel, precisa ser reanexado aqui na hora de salvar.
    saveMutation.mutate({
      ...data,
      id: editingCliente?.id,
      origem_lead_id: editingCliente?.origem_lead_id ?? prefillLead?.id ?? null,
    });
  };

  const filteredClientes = clientes.filter(
    (c) => statusFilter === "todos" || c.status === statusFilter,
  );

  return (
    <Card className="rounded-[1.5rem] md:rounded-[2rem] border-border shadow-sm overflow-hidden">
      <CardHeader className="bg-background/50 border-b border-border p-6 flex-row items-center justify-between space-y-0 gap-4">
        <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-muted-foreground shrink-0">
          Clientes — {filteredClientes.length}
        </CardTitle>

        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="rounded-xl border-border bg-background h-9 w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="pendente_aprovacao">Pendente</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="suspenso">Suspenso</SelectItem>
            </SelectContent>
          </Select>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingCliente(null);
                setPrefillLead(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingCliente(null);
                  setPrefillLead(null);
                  setIsDialogOpen(true);
                }}
                size="icon"
                className="bg-primary hover:scale-105 transition-transform text-white rounded-full h-9 w-9 shadow-lg shadow-primary/20 shrink-0"
                aria-label="Novo cliente"
              >
                <Plus size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-[600px] rounded-[1.5rem] sm:rounded-[2rem] border-border p-6 sm:p-8">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-3xl font-serif italic">
                  {editingCliente ? "Editar Cliente" : "Novo Cliente"}
                </DialogTitle>
              </DialogHeader>
              <ClienteForm
                editingCliente={editingCliente}
                prefillLead={prefillLead}
                gruposPreco={gruposPreco}
                onSubmit={handleSave}
                isPending={saveMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <Building2 className="text-stone-300 mb-4" size={32} />
            <p className="text-sm text-muted-foreground">Nenhum cliente encontrado.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="pl-8 py-6 text-[10px] uppercase tracking-widest font-black">
                  Razão Social
                </TableHead>
                <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black">
                  CPF/CNPJ
                </TableHead>
                <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black">
                  Cidade/UF
                </TableHead>
                <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black">
                  Status
                </TableHead>
                <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black">
                  Grupo de Preço
                </TableHead>
                <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black">
                  Cadastro
                </TableHead>
                <TableHead className="text-right pr-8 py-6 text-[10px] uppercase tracking-widest font-black">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.map((cliente) => (
                <TableRow
                  key={cliente.id}
                  className="border-border hover:bg-background/50 transition-colors"
                >
                  <TableCell className="pl-8 font-sans font-semibold text-sm text-foreground">
                    {cliente.razao_social}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-sans">
                    {formatDocumento(cliente.tipo_documento, cliente.documento)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-sans">
                    {cliente.cidade}/{cliente.uf}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full",
                        STATUS_STYLE[cliente.status as Cliente["status"]],
                      )}
                    >
                      {STATUS_LABEL[cliente.status as Cliente["status"]] ?? cliente.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-sans">
                    {cliente.grupo_preco_id
                      ? (gruposPrecoById.get(cliente.grupo_preco_id) ?? "—")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-[10px] font-sans font-black uppercase tracking-widest text-muted-foreground">
                    {cliente.created_at
                      ? new Date(cliente.created_at).toLocaleDateString("pt-BR")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingCliente(cliente);
                          setPrefillLead(null);
                          setIsDialogOpen(true);
                        }}
                        className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm hover:text-primary transition-all"
                      >
                        <Pencil size={14} />
                      </Button>
                      {cliente.status !== "aprovado" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={approveMutation.isPending}
                          title="Aprovar cliente"
                          onClick={() => approveMutation.mutate(cliente.id)}
                          className="h-9 w-9 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                        >
                          <ShieldCheck size={14} />
                        </Button>
                      )}
                      {cliente.status === "aprovado" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Suspender cliente"
                          onClick={() => setClientePendingSuspend(cliente)}
                          className="h-9 w-9 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all"
                        >
                          <ShieldOff size={14} />
                        </Button>
                      )}
                      {isAdmin && (
                        <Button
                          asChild={!!cliente.grupo_preco_id}
                          variant="ghost"
                          size="icon"
                          disabled={!cliente.grupo_preco_id}
                          title={
                            cliente.grupo_preco_id
                              ? "Ver preços"
                              : "Defina um grupo de preço para ver os preços deste cliente"
                          }
                          className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30"
                        >
                          {cliente.grupo_preco_id ? (
                            <Link href={`/admin/precos/clientes/${cliente.id}`}>
                              <Tags size={14} />
                            </Link>
                          ) : (
                            <Tags size={14} />
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <AlertDialog
        open={!!clientePendingSuspend}
        onOpenChange={(open) => !open && setClientePendingSuspend(null)}
      >
        <AlertDialogContent className="rounded-[1.5rem] border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Suspender cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente suspender &quot;{clientePendingSuspend?.razao_social}&quot;? Ele
              deixa de conseguir comprar até ser aprovado novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                clientePendingSuspend && suspendMutation.mutate(clientePendingSuspend.id)
              }
            >
              Suspender
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
