import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { ProductLinesBar } from "@/components/sections/ProductLinesBar";
import { EssenceSection } from "@/components/sections/EssenceSection";
import { HeritageSection } from "@/components/sections/HeritageSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { TimelineSection } from "@/components/sections/TimelineSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { getProducts, getTimelineEvents } from "@/lib/catalog-data.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "La Linda | Pães Especiais Artesanais" },
      { name: "description", content: "Descubra a arte da panificação artesanal na La Linda. Pães de fermentação natural, linhas premium e tradição que alimenta a alma." },
      { property: "og:title", content: "La Linda | Pães Especiais Artesanais" },
      { property: "og:description", content: "Tradição e excelência em cada fibra. Conheça nossa coleção de pães especiais." },
      { name: "twitter:card", content: "summary_large_image" }
    ],
  }),
  component: Index,
});

function Index() {
  // Data fetching
  const fetchProductsFn = useServerFn(getProducts);
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProductsFn()
  });

  const fetchTimelineFn = useServerFn(getTimelineEvents);
  const { data: timelineEvents = [] } = useQuery({
    queryKey: ['timeline'],
    queryFn: () => fetchTimelineFn()
  });

  const featuredProducts = products.slice(0, 3);

  return (
    <div className="min-h-screen bg-stone-50 font-serif text-foreground selection:bg-primary selection:text-white">
      <Navbar variant="transparent" />

      <HeroCarousel />

      {/* Boutique Product Lines Bar */}
      <ProductLinesBar />

      <EssenceSection featuredProducts={featuredProducts} />

      <StatsSection />

      <HeritageSection />

      <TimelineSection timelineEvents={timelineEvents} />

      <ContactSection />

      <Footer variant="light" />
    </div>
  );
}
