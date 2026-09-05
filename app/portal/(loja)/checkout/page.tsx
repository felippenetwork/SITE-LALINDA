import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HelpCircle } from "lucide-react";
import {
  getPortalDestination,
  getMinhaCliente,
  getMeusPrecos,
  getRegiaoEntrega,
} from "@/lib/data/portal";
import { getProducts } from "@/lib/data/products";
import { MensagemCard } from "@/components/portal/MensagemCard";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = {
  title: "Finalizar Pedido | La Linda",
};

export default async function PortalCheckoutPage() {
  const destination = await getPortalDestination();
  if (destination !== "/portal/catalogo") redirect(destination);

  const cliente = await getMinhaCliente();
  if (!cliente) {
    return (
      <MensagemCard
        icon={HelpCircle}
        titulo="Cadastro não encontrado"
        mensagem="Não encontramos seu cadastro de cliente. Faça login novamente ou entre em contato com nosso time."
      />
    );
  }
  if (!cliente.grupoPrecoId) {
    return (
      <MensagemCard
        icon={HelpCircle}
        titulo="Preços em Configuração"
        mensagem="Seu cadastro está aprovado, mas ainda não tem uma tabela de preços associada. Entre em contato com nosso time."
      />
    );
  }
  if (!cliente.regiaoEntregaId) {
    return (
      <MensagemCard
        icon={HelpCircle}
        titulo="Região de Entrega Pendente"
        mensagem="Seu cadastro está aprovado, mas ainda não tem uma região de entrega associada. Entre em contato com nosso time antes de finalizar um pedido."
      />
    );
  }

  const [products, precos, regiao] = await Promise.all([
    getProducts(),
    getMeusPrecos(cliente.id, cliente.grupoPrecoId),
    getRegiaoEntrega(cliente.regiaoEntregaId),
  ]);

  if (!regiao) {
    return (
      <MensagemCard
        icon={HelpCircle}
        titulo="Região de Entrega Pendente"
        mensagem="Sua região de entrega cadastrada não foi encontrada. Entre em contato com nosso time."
      />
    );
  }

  const produtosComPreco = products.map((p) => ({
    id: p.id,
    nome: p.name,
    available: p.available,
    valor: precos.get(p.id) ?? null,
  }));

  return (
    <CheckoutForm
      produtos={produtosComPreco}
      boletoLiberado={cliente.boletoLiberado}
      boletoPrazosDias={cliente.boletoPrazosDias ?? []}
      regiao={regiao}
    />
  );
}
