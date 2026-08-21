import { createFileRoute, Link } from "@tanstack/react-router";
import { getProducts } from "@/lib/catalog-data.functions";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Package, Weight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/produtos/$productId")({
  params: {
    parse: (params) => z.object({ productId: z.string() }).parse(params),
    stringify: (params) => ({ productId: params.productId }),
  },
  loader: async ({ params }) => {
    // Note: We'll fetch client-side for now to keep it consistent with our useQuery pattern
    return { productId: params.productId };
  },
  head: ({ params }) => {
    // In a real SEO scenario, we'd fetch this in the loader to have the name here
    return {
      meta: [
        { title: `Detalhes do Produto | La Linda Pães Especiais` },
        { name: "description", content: `Conheça os detalhes deste pão artesanal La Linda.` },
        { property: "og:title", content: `Detalhes do Produto | La Linda Pães Especiais` },
        { name: "twitter:card", content: "summary_large_image" }
      ],
    };
  },
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  
  const fetchProductsFn = useServerFn(getProducts);
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProductsFn()
  });

  const product = products?.find((p: any) => p.id === productId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <span className="font-serif italic text-stone-400">Carregando detalhes...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-8">
        <div className="text-center max-w-md bg-white p-16 rounded-[3rem] shadow-xl shadow-stone-200/50 border border-stone-100">
          <span className="text-6xl mb-8 block">🥖</span>
          <h2 className="text-3xl font-serif italic mb-6">Produto não encontrado</h2>
          <Link to="/produtos" className="inline-flex items-center gap-4 text-primary font-sans uppercase tracking-widest text-[10px] font-black group">
            <ArrowLeft size={14} /> Voltar para Coleções
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-serif text-foreground selection:bg-primary selection:text-white">
      {/* Header */}
      <Navbar activeItem="Produtos" />

      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-28 md:pt-40 pb-24">
        <Link to="/produtos" className="inline-flex items-center gap-4 text-stone-400 font-sans uppercase tracking-widest text-[8px] md:text-[9px] font-black mb-8 md:mb-12 hover:text-foreground transition-colors group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Voltar para Produtos
        </Link>

        <div className="bg-white rounded-[3rem] md:rounded-[5rem] shadow-sm overflow-hidden flex flex-col lg:flex-row border border-stone-100">
          <div className="lg:w-1/2 relative aspect-[4/3] sm:aspect-[4/5] lg:aspect-auto group overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name} 
              className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] transition-transform duration-[2s] group-hover:grayscale-0 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            {!product.available && (
              <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-white text-stone-900 text-[10px] font-sans font-black uppercase tracking-widest px-6 py-3 rounded-full shadow-2xl">Indisponível no Momento</span>
              </div>
            )}
          </div>
          
          <div className="lg:w-1/2 p-8 md:p-16 lg:p-28 flex flex-col justify-center relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-bl-full -z-10 opacity-50"></div>
            <Badge className="w-fit mb-6 md:mb-8 bg-stone-50 text-primary hover:bg-stone-100 border-none font-sans uppercase tracking-widest text-[8px] md:text-[9px] px-4 md:px-6 py-2 rounded-full">
              {product.category}
            </Badge>
            
            <h2 className="text-5xl md:text-7xl lg:text-9xl font-serif italic text-stone-900 mb-6 md:mb-8 leading-[0.85] tracking-tighter">{product.name}</h2>
            
            <p className="text-stone-500 font-sans leading-relaxed text-base md:text-lg mb-8 md:mb-12 italic">
              {product.description || "Uma criação exclusiva que une tradição milenar com a excelência dos melhores trigos selecionados."}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-10 md:mb-16">
              <div className="p-6 md:p-8 bg-stone-50 rounded-[1.5rem] md:rounded-[2rem] border border-stone-100 group">
                <div className="flex items-center gap-4 text-primary mb-3 md:mb-4">
                  <Weight className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
                  <span className="text-[8px] md:text-[9px] font-sans uppercase tracking-widest font-black text-stone-400">Peso Unitário</span>
                </div>
                <span className="text-2xl md:text-3xl font-serif italic text-stone-900">{product.weight}</span>
              </div>
              <div className="p-6 md:p-8 bg-stone-50 rounded-[1.5rem] md:rounded-[2rem] border border-stone-100 group">
                <div className="flex items-center gap-4 text-primary mb-3 md:mb-4">
                  <Package className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
                  <span className="text-[8px] md:text-[9px] font-sans uppercase tracking-widest font-black text-stone-400">Volume Caixa</span>
                </div>
                <span className="text-2xl md:text-3xl font-serif italic text-stone-900">{product.boxWeight || "Sob Consulta"}</span>
              </div>
            </div>

            <Link 
              to="/" 
              hash="contato"
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
