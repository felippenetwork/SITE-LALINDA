import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductLinesShowcase } from "@/components/sections/ProductLinesShowcase";
import { getProductLines } from "@/lib/data/product-lines";

export const metadata: Metadata = {
  title: "Nossas Linhas de Produtos | La Linda Pães Especiais",
  description: "Conheça nossas linhas: Tradicional, Fermentação Natural, Confeitaria e muito mais.",
  openGraph: {
    title: "Nossas Linhas de Produtos | La Linda Pães Especiais",
    description:
      "Conheça nossas linhas: Tradicional, Fermentação Natural, Confeitaria e muito mais.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function ProdutosPage() {
  const lines = await getProductLines();

  return (
    <div className="min-h-screen bg-stone-50 font-serif text-foreground selection:bg-primary selection:text-white">
      <Navbar activeItem="Produtos" />

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-28 md:pt-40 pb-24">
        <div className="mb-12 md:mb-20 max-w-2xl">
          <span className="text-primary font-serif italic text-lg md:text-xl mb-3 md:mb-4 block">
            A Coleção La Linda
          </span>
          <h2 className="text-5xl md:text-8xl font-serif italic leading-[0.9] text-foreground mb-6 md:mb-8">
            Nossas <br />
            Linhas
          </h2>
          <p className="text-stone-500 font-sans leading-relaxed text-sm md:text-base">
            Descubra a harmonia entre o trigo selecionado e o tempo de repouso, resultando em
            texturas e sabores inconfundíveis.
          </p>
        </div>

        <ProductLinesShowcase lines={lines} />
      </main>

      <Footer variant="dark" />
    </div>
  );
}
