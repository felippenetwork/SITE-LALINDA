"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { getClienteByIdAction, getGruposPrecoAction } from "@/lib/actions/clientes";
import { getProductsAction } from "@/lib/actions/products";
import { getPrecosAction, getPrecoExcecoesAction } from "@/lib/actions/precos";
import { ClientePrecoTable } from "@/components/sections/ClientePrecoTable";

export default function AdminClientePrecosPage() {
  const { clienteId } = useParams<{ clienteId: string }>();

  const { data: cliente, isLoading: isLoadingCliente } = useQuery({
    queryKey: ["cliente", clienteId],
    queryFn: () => getClienteByIdAction(clienteId),
  });

  const { data: grupos = [] } = useQuery({
    queryKey: ["grupos-preco"],
    queryFn: getGruposPrecoAction,
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: getProductsAction,
  });

  const { data: precos = [], isLoading: isLoadingPrecos } = useQuery({
    queryKey: ["precos"],
    queryFn: getPrecosAction,
  });

  const { data: excecoes = [], isLoading: isLoadingExcecoes } = useQuery({
    queryKey: ["preco-excecoes", clienteId],
    queryFn: () => getPrecoExcecoesAction(clienteId),
  });

  const grupoNome = grupos.find((g) => g.id === cliente?.grupo_preco_id)?.nome;
  const precosDoGrupo = precos.filter((p) => p.grupo_preco_id === cliente?.grupo_preco_id);

  return (
    <>
      <Link
        href="/admin/clientes"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-black text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={14} /> Voltar para Clientes
      </Link>

      <div className="mb-12 lg:mb-16">
        <h2 className="text-3xl md:text-4xl font-serif italic text-foreground mb-2">
          {isLoadingCliente ? "Carregando..." : (cliente?.razao_social ?? "Cliente não encontrado")}
        </h2>
        <p className="text-muted-foreground font-sans text-xs md:text-sm tracking-wide">
          {grupoNome ? `Grupo de preço: ${grupoNome}` : "Sem grupo de preço definido"}
        </p>
      </div>

      {cliente && !cliente.grupo_preco_id ? (
        <p className="text-sm text-muted-foreground">
          Este cliente ainda não tem um grupo de preço definido — defina um grupo em Clientes antes
          de configurar exceções.
        </p>
      ) : (
        <ClientePrecoTable
          clienteId={clienteId}
          products={products}
          precosDoGrupo={precosDoGrupo}
          excecoes={excecoes}
          isLoading={isLoadingProducts || isLoadingPrecos || isLoadingExcecoes}
        />
      )}
    </>
  );
}
