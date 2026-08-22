import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Weight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getProductById } from "@/lib/data/products";

interface ProductDetailPageProps {
  params: Promise<{ productId: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = await getProductById(productId);

  if (!product) {
    return { title: "Produto não encontrado | La Linda Pães Especiais" };
  }

  const title = `${product.name} | La Linda Pães Especiais`;
  const description =
    product.description ?? `Conheça o ${product.name}, um pão artesanal La Linda.`;

  return {
    title,
    description,
    openGraph: { title, description, images: [product.image] },
    twitter: { card: "summary_large_image" },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId } = await params;
  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-50 font-serif text-foreground selection:bg-primary selection:text-white">
      <Navbar activeItem="Produtos" />

      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-28 md:pt-40 pb-24">
        <Link
          href="/produtos"
          className="inline-flex items-center gap-4 text-stone-400 font-sans uppercase tracking-widest text-[8px] md:text-[9px] font-black mb-8 md:mb-12 hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Voltar
          para Produtos
        </Link>

        <div className="bg-white rounded-[3rem] md:rounded-[5rem] shadow-sm overflow-hidden flex flex-col lg:flex-row border border-stone-100">
          <div className="lg:w-1/2 relative aspect-[4/3] sm:aspect-[4/5] lg:aspect-auto group overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover grayscale-[0.2] transition-transform duration-[2s] group-hover:grayscale-0 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            {!product.available && (
              <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-white text-stone-900 text-[10px] font-sans font-black uppercase tracking-widest px-6 py-3 rounded-full shadow-2xl">
                  Indisponível no Momento
                </span>
              </div>
            )}
          </div>

          <div className="lg:w-1/2 p-8 md:p-16 lg:p-28 flex flex-col justify-center relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-bl-full -z-10 opacity-50"></div>
            <Badge className="w-fit mb-6 md:mb-8 bg-stone-50 text-primary hover:bg-stone-100 border-none font-sans uppercase tracking-widest text-[8px] md:text-[9px] px-4 md:px-6 py-2 rounded-full">
              {product.category}
            </Badge>

            <h2 className="text-5xl md:text-7xl lg:text-9xl font-serif italic text-stone-900 mb-6 md:mb-8 leading-[0.85] tracking-tighter">
              {product.name}
            </h2>

            <p className="text-stone-500 font-sans leading-relaxed text-base md:text-lg mb-8 md:mb-12 italic">
              {product.description ||
                "Uma criação exclusiva que une tradição milenar com a excelência dos melhores trigos selecionados."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-10 md:mb-16">
              <div className="p-6 md:p-8 bg-stone-50 rounded-[1.5rem] md:rounded-[2rem] border border-stone-100 group">
                <div className="flex items-center gap-4 text-primary mb-3 md:mb-4">
                  <Weight className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
                  <span className="text-[8px] md:text-[9px] font-sans uppercase tracking-widest font-black text-stone-400">
                    Peso Unitário
                  </span>
                </div>
                <span className="text-2xl md:text-3xl font-serif italic text-stone-900">
                  {product.weight}
                </span>
              </div>
              <div className="p-6 md:p-8 bg-stone-50 rounded-[1.5rem] md:rounded-[2rem] border border-stone-100 group">
                <div className="flex items-center gap-4 text-primary mb-3 md:mb-4">
                  <Package className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
                  <span className="text-[8px] md:text-[9px] font-sans uppercase tracking-widest font-black text-stone-400">
                    Volume Caixa
                  </span>
                </div>
                <span className="text-2xl md:text-3xl font-serif italic text-stone-900">
                  {product.boxWeight || "Sob Consulta"}
                </span>
              </div>
            </div>

            <Link
              href="/#contato"
              className="w-full py-6 bg-primary text-white rounded-full text-center font-sans uppercase tracking-[0.3em] text-[10px] font-black hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-lg shadow-primary/10"
            >
              Solicitar Orçamento
            </Link>

            <p className="mt-8 text-[9px] font-sans uppercase tracking-widest text-stone-300 text-center font-bold">
              * Valores aproximados sujeitos a variação natural da panificação artesanal.
            </p>
          </div>
        </div>
      </main>

      <Footer variant="dark" />
    </div>
  );
}
