import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PackageSearch, HelpCircle } from "lucide-react";
import { getPortalDestination, getMinhaCliente, getMeusPrecos } from "@/lib/data/portal";
import { getProducts } from "@/lib/data/products";
import { getProductLines } from "@/lib/data/product-lines";
import { PortalProductCard } from "@/components/portal/PortalProductCard";
import { PortalLogoutButton } from "@/components/shared/PortalLogoutButton";

export const metadata: Metadata = {
  title: "Catálogo | La Linda",
};

function MensagemCard({
  icon: Icon,
  titulo,
  mensagem,
}: {
  icon: typeof PackageSearch;
  titulo: string;
  mensagem: string;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8 text-center">
      <div className="w-full max-w-[480px]">
        <h1 className="text-4xl md:text-5xl font-serif italic text-foreground mb-8 leading-none">
          La Linda
        </h1>
        <div className="bg-card border border-border rounded-[2rem] p-10 shadow-sm">
          <Icon className="mx-auto mb-6 text-primary" size={40} />
          <h2 className="text-2xl font-serif italic text-foreground mb-3">{titulo}</h2>
          <p className="text-sm text-muted-foreground font-sans leading-relaxed">{mensagem}</p>
        </div>
        <div className="mt-8">
          <PortalLogoutButton />
        </div>
      </div>
    </div>
  );
}

export default async function PortalCatalogoPage() {
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
        mensagem="Seu cadastro está aprovado, mas ainda não tem uma tabela de preços associada. Entre em contato com nosso time para liberar o catálogo."
      />
    );
  }

  const [products, lines, precos] = await Promise.all([
    getProducts(),
    getProductLines(),
    getMeusPrecos(cliente.id, cliente.grupoPrecoId),
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
        <div className="flex items-center justify-between mb-12 md:mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif italic text-foreground mb-2">
              Catálogo
            </h1>
            <p className="text-muted-foreground font-sans text-xs md:text-sm tracking-wide">
              Preços exclusivos para o seu cadastro
            </p>
          </div>
          <PortalLogoutButton />
        </div>

        {linhasComProdutos.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24">
            <PackageSearch className="text-stone-300 mb-4" size={40} />
            <p className="text-sm text-muted-foreground">Nenhum produto disponível no momento.</p>
          </div>
        ) : (
          <div className="space-y-16 md:space-y-24">
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
