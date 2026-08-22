"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/shared/ProductCard";
import type { BreadItem } from "@/lib/data/products";

interface ProdutosClientProps {
  products: BreadItem[];
}

export function ProdutosClient({ products }: ProdutosClientProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((item) => item.category)));
    return ["all", ...cats];
  }, [products]);

  const filteredItems = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory, products]);

  return (
    <div className="min-h-screen bg-stone-50 font-serif text-foreground selection:bg-primary selection:text-white">
      <Navbar activeItem="Produtos" />

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-28 md:pt-40 pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12 mb-12 md:mb-20">
          <div className="flex-1">
            <span className="text-primary font-serif italic text-lg md:text-xl mb-3 md:mb-4 block">
              A Coleção La Linda
            </span>
            <h2 className="text-5xl md:text-8xl font-serif italic leading-[0.9] text-foreground">
              Nossas <br />
              Linhas
            </h2>
            <p className="text-stone-500 font-sans mt-6 md:mt-8 max-w-md leading-relaxed text-sm md:text-base">
              Descubra a harmonia entre o trigo selecionado e o tempo de repouso, resultando em
              texturas e sabores inconfundíveis.
            </p>
          </div>

          <div className="w-full md:w-96 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
            <Input
              placeholder="Buscar pão ou sabor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border-none shadow-xl shadow-stone-200/50 pl-12 h-16 rounded-2xl focus-visible:ring-primary/20 focus-visible:ring-4 font-sans transition-all placeholder:text-stone-300"
            />
          </div>
        </div>

        <div className="mb-12 overflow-x-auto pb-4">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="bg-transparent gap-4 h-auto flex-nowrap">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="capitalize px-8 py-3 rounded-full border border-stone-200 font-sans text-[10px] uppercase tracking-widest font-black data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary transition-all shadow-sm"
                >
                  {cat === "all" ? "Todas as Linhas" : cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
            {filteredItems.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-40 bg-white rounded-[4rem] border border-stone-100 shadow-xl shadow-stone-200/20">
            <span className="text-6xl mb-6 block">🥖</span>
            <p className="text-stone-400 font-serif italic text-2xl">
              Não encontramos pães para sua busca.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("all");
              }}
              className="mt-8 text-primary font-sans text-[10px] uppercase tracking-widest font-black underline underline-offset-8"
            >
              Ver Catálogo Completo
            </button>
          </div>
        )}
      </main>

      <Footer variant="dark" />
    </div>
  );
}
