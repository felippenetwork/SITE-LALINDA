import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { ProductLinesBar } from "@/components/sections/ProductLinesBar";
import { EssenceSection } from "@/components/sections/EssenceSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { HeritageSection } from "@/components/sections/HeritageSection";
import { TimelineSection } from "@/components/sections/TimelineSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { getProducts } from "@/lib/data/products";
import { getTimelineEvents } from "@/lib/data/timeline";
import { getProductLines } from "@/lib/data/product-lines";
import { getSiteSettings } from "@/lib/data/site-settings";

export const metadata: Metadata = {
  title: "La Linda | Pães Especiais Artesanais",
  description:
    "Descubra a arte da panificação artesanal na La Linda. Pães de fermentação natural, linhas premium e tradição que alimenta a alma.",
  openGraph: {
    title: "La Linda | Pães Especiais Artesanais",
    description: "Tradição e excelência em cada fibra. Conheça nossa coleção de pães especiais.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function HomePage() {
  const [products, timelineEvents, allProductLines, siteSettings] = await Promise.all([
    getProducts(),
    getTimelineEvents(),
    getProductLines(),
    getSiteSettings(),
  ]);
  const featuredProducts = products.slice(0, 3);
  const productLines = allProductLines.filter((line) => line.available);

  return (
    <div className="min-h-screen bg-stone-50 font-serif text-foreground selection:bg-primary selection:text-white">
      <Navbar activeItem="Início" />
      <HeroCarousel />
      <ProductLinesBar lines={productLines} />
      <EssenceSection featuredProducts={featuredProducts} />
      <StatsSection />
      <HeritageSection />
      <TimelineSection timelineEvents={timelineEvents} />
      <ContactSection settings={siteSettings} />
      <Footer />
    </div>
  );
}
