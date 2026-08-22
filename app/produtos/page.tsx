import type { Metadata } from "next";
import Image from "next/image";
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

      <main>
        <section className="relative h-[50vh] md:h-[60vh] flex items-end px-6 md:px-8 pb-16 md:pb-20 bg-stone-900 overflow-hidden pt-16 md:pt-0">
          <div className="absolute inset-0 opacity-50">
            <Image
              src="https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2072"
              alt="Pães artesanais La Linda"
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
          <div className="relative z-10 max-w-7xl mx-auto w-full">
            <span className="text-primary font-serif italic text-lg md:text-xl mb-3 md:mb-4 block">
              A Coleção La Linda
            </span>
            <h2 className="text-5xl md:text-8xl font-serif italic leading-[0.9] text-white mb-6 md:mb-8">
              Nossas <br />
              Linhas
            </h2>
            <p className="text-white/70 font-sans leading-relaxed text-sm md:text-base max-w-md">
              Descubra a harmonia entre o trigo selecionado e o tempo de repouso, resultando em
              texturas e sabores inconfundíveis.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-24">
          <ProductLinesShowcase lines={lines} />
        </div>
      </main>

      <Footer variant="dark" />
    </div>
  );
}
