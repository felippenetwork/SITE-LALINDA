"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Loader2, UserPlus, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { buscarClientesParaVendedorAction } from "@/lib/actions/vendas";
import { ClienteAvulsoForm } from "@/components/forms/ClienteAvulsoForm";
import type { ClienteParaVendedor } from "@/lib/data/vendas";

const STATUS_LABEL: Record<string, string> = {
  pendente_aprovacao: "Pendente",
  aprovado: "Aprovado",
  suspenso: "Suspenso",
};

function formatDocumento(tipo: string, digits: string): string {
  if (tipo === "cpf") return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

export function VendasBusca() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<ClienteParaVendedor[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [buscou, setBuscou] = useState(false);
  const [isNovoClienteOpen, setIsNovoClienteOpen] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    clearTimeout(debounceTimer.current);
    if (!value.trim()) {
      setResultados([]);
      setBuscou(false);
      return;
    }
    debounceTimer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const clientes = await buscarClientesParaVendedorAction(value);
        setResultados(clientes);
        setBuscou(true);
      } catch {
        toast.error("Erro ao buscar clientes");
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <Input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Buscar cliente por nome ou CPF/CNPJ"
            className="rounded-full border-border bg-background h-14 pl-11 font-sans text-sm"
          />
        </div>
        <Button
          type="button"
          onClick={() => setIsNovoClienteOpen(true)}
          variant="outline"
          className="rounded-full h-14 border-border font-sans font-semibold gap-2 px-6"
        >
          <UserPlus size={16} /> Cadastrar Novo Cliente
        </Button>
      </div>

      {isSearching ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : buscou && resultados.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <Building2 className="text-stone-300 mb-4" size={32} />
          <p className="text-sm text-muted-foreground">
            Nenhum cliente encontrado para &quot;{query}&quot;.
          </p>
        </div>
      ) : resultados.length > 0 ? (
        <div className="bg-card border border-border rounded-[2rem] overflow-hidden">
          {resultados.map((cliente) => (
            <button
              key={cliente.id}
              type="button"
              onClick={() => router.push(`/vendas/pedidos/${cliente.id}`)}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 border-b border-border last:border-b-0 text-left hover:bg-background/50 transition-colors"
            >
              <div className="min-w-0">
                <p className="font-sans font-semibold text-sm text-foreground truncate">
                  {cliente.razaoSocial}
                </p>
                <p className="text-xs text-muted-foreground font-sans">
                  {formatDocumento(cliente.tipoDocumento, cliente.documento)}
                </p>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-background border border-border text-muted-foreground shrink-0">
                {STATUS_LABEL[cliente.status] ?? cliente.status}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <Dialog open={isNovoClienteOpen} onOpenChange={setIsNovoClienteOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[600px] rounded-[1.5rem] sm:rounded-[2rem] border-border p-6 sm:p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-serif italic">Cadastrar Novo Cliente</DialogTitle>
          </DialogHeader>
          <ClienteAvulsoForm
            onCriado={(clienteId) => router.push(`/vendas/pedidos/${clienteId}`)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
