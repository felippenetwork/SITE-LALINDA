import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/shared/ProductCard";
import { getProductLineBySlug } from "@/lib/data/product-lines";
import { getProductsByLineId } from "@/lib/data/products";

interface LinePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LinePageProps): Promise<Metadata> {
  const { slug } = await params;
  const line = await getProductLineBySlug(slug);

  if (!line || !line.available) {
    return { title: "Linha não encontrada | La Linda Pães Especiais" };
  }

  const title = `${line.name} | La Linda Pães Especiais`;
  const description = line.description ?? `Conheça a linha ${line.name} da La Linda.`;

  return {
    title,
    description,
    openGraph: { title, description, images: line.image ? [line.image] : undefined },
    twitter: { card: "summary_large_image" },
  };
}

export default async function ProductLinePage({ params }: LinePageProps) {
  const { slug } = await params;
  const line = await getProductLineBySlug(slug);

  if (!line || !line.available) {
    notFound();
  }

  const products = await getProductsByLineId(line.id);

  return (
    <div className="min-h-screen bg-stone-50 font-serif text-foreground selection:bg-primary selection:text-white">
      <Navbar activeItem="Produtos" />

      <main className="pb-24">
        <section className="relative h-[45vh] md:h-[55vh] overflow-hidden bg-stone-900">
          {line.image && (
            <Image
              src={line.image}
              alt={line.name}
              fill
              sizes="100vw"
              priority
              className="object-cover opacity-60"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/20 to-transparent" />
          <div className="relative h-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col justify-end pb-12 md:pb-16">
            <Link
              href="/produtos"
              className="inline-flex items-center gap-4 text-white/70 font-sans uppercase tracking-widest text-[8px] md:text-[9px] font-black mb-6 md:mb-8 hover:text-white transition-colors group w-fit"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Todas as Linhas
            </Link>
            <h1 className="text-5xl md:text-8xl font-serif italic leading-[0.9] text-white mb-4 md:mb-6">
              {line.name}
            </h1>
            {line.description && (
              <p className="text-white/70 font-sans leading-relaxed text-sm md:text-base max-w-xl">
                {line.description}
              </p>
            )}
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-16 md:pt-24">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
              {products.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-40 bg-white rounded-[4rem] border border-stone-100 shadow-xl shadow-stone-200/20">
              <p className="text-stone-400 font-serif italic text-2xl">
                Ainda não há produtos cadastrados nesta linha.
              </p>
              <Link
                href="/produtos"
                className="mt-8 inline-block text-primary font-sans text-[10px] uppercase tracking-widest font-black underline underline-offset-8"
              >
                Ver Outras Linhas
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
