import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { getClienteParaVendedor, getPrecosParaVendedor } from "@/lib/data/vendas";
import { getProducts } from "@/lib/data/products";
import { getProductLines } from "@/lib/data/product-lines";
import { PortalProductCard } from "@/components/portal/PortalProductCard";
import { CartSummaryButton } from "@/components/portal/CartSummaryButton";

export const metadata: Metadata = {
  title: "Montar Pedido | La Linda",
};

const STATUS_LABEL: Record<string, string> = {
  pendente_aprovacao: "Pendente de Aprovação",
  aprovado: "Aprovado",
  suspenso: "Suspenso",
};

export default async function VendasClienteCatalogoPage({
  params,
}: {
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;

  const cliente = await getClienteParaVendedor(clienteId);
  if (!cliente) notFound();

  const clientePronto = !!cliente.grupoPrecoId && !!cliente.regiaoEntregaId;

  const [products, lines, precos] = await Promise.all([
    getProducts(),
    getProductLines(),
    cliente.grupoPrecoId
      ? getPrecosParaVendedor(cliente.id, cliente.grupoPrecoId)
      : Promise.resolve(new Map<string, number>()),
  ]);

  const linhasComProdutos = lines
    .filter((line) => line.available)
    .map((line) => ({
      line,
      produtos: products.filter((p) => p.categoryId === line.id && p.available),
    }))
    .filter(({ produtos }) => produtos.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <Link
          href="/vendas"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-black text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Trocar Cliente
        </Link>

        <div className="flex items-center justify-between mb-4 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif italic text-foreground mb-2">
              {cliente.razaoSocial}
            </h1>
            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-background border border-border text-muted-foreground">
              {STATUS_LABEL[cliente.status] ?? cliente.status}
            </span>
          </div>
          <CartSummaryButton href={`/vendas/pedidos/${clienteId}/checkout`} />
        </div>

        {!clientePronto && (
          <div className="mb-12 bg-primary/5 border border-primary/10 rounded-2xl px-6 py-4">
            <p className="text-xs font-sans text-foreground leading-relaxed">
              Este cliente ainda não tem{" "}
              {!cliente.grupoPrecoId && !cliente.regiaoEntregaId
                ? "grupo de preço nem região de entrega definidos"
                : !cliente.grupoPrecoId
                  ? "grupo de preço definido"
                  : "região de entrega definida"}
              . O pedido vai ficar como <strong>rascunho</strong> até o admin aprovar e completar o
              cadastro — você pode montar o carrinho normalmente, mesmo sem preço aparecendo ainda.
            </p>
          </div>
        )}

        {linhasComProdutos.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24">
            <PackageSearch className="text-stone-300 mb-4" size={40} />
            <p className="text-sm text-muted-foreground">Nenhum produto disponível no momento.</p>
          </div>
        ) : (
          <div className="space-y-16 md:space-y-24 mt-8">
            {linhasComProdutos.map(({ line, produtos }) => (
              <section key={line.id}>
                <h2 className="text-2xl md:text-3xl font-serif italic text-foreground mb-8 md:mb-10">
                  {line.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                  {produtos.map((produto) => (
                    <PortalProductCard
                      key={produto.id}
                      item={produto}
                      valor={precos.get(produto.id) ?? null}
                      permitirSemPreco={!clientePronto}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
