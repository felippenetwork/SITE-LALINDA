import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClienteParaVendedor, getPrecosParaVendedor } from "@/lib/data/vendas";
import { getRegiaoEntrega } from "@/lib/data/portal";
import { getProducts } from "@/lib/data/products";
import { VendaCheckoutForm } from "./VendaCheckoutForm";

export const metadata: Metadata = {
  title: "Finalizar Pedido | La Linda",
};

export default async function VendasCheckoutPage({
  params,
}: {
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;

  const cliente = await getClienteParaVendedor(clienteId);
  if (!cliente) notFound();

  const clientePronto = !!cliente.grupoPrecoId && !!cliente.regiaoEntregaId;

  const [products, precos, regiao] = await Promise.all([
    getProducts(),
    cliente.grupoPrecoId
      ? getPrecosParaVendedor(cliente.id, cliente.grupoPrecoId)
      : Promise.resolve(new Map<string, number>()),
    cliente.regiaoEntregaId ? getRegiaoEntrega(cliente.regiaoEntregaId) : Promise.resolve(null),
  ]);

  const produtosComPreco = products.map((p) => ({
    id: p.id,
    nome: p.name,
    available: p.available,
    valor: precos.get(p.id) ?? null,
  }));

  return (
    <VendaCheckoutForm
      clienteId={clienteId}
      clienteNome={cliente.razaoSocial}
      clientePronto={clientePronto}
      produtos={produtosComPreco}
      boletoLiberado={cliente.boletoLiberado}
      boletoPrazosDias={cliente.boletoPrazosDias ?? []}
      regiao={regiao}
    />
  );
}
