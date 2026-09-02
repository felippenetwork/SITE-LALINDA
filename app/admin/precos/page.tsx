"use client";

import { useQuery } from "@tanstack/react-query";
import { getGruposPrecoAction } from "@/lib/actions/clientes";
import { getProductsAction } from "@/lib/actions/products";
import { getPrecosAction } from "@/lib/actions/precos";
import { GruposPrecoPanel } from "@/components/sections/GruposPrecoPanel";
import { PrecoMatrix } from "@/components/sections/PrecoMatrix";

export default function AdminPrecosPage() {
  const { data: grupos = [], isLoading: isLoadingGrupos } = useQuery({
    queryKey: ["grupos-preco"],
    queryFn: getGruposPrecoAction,
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: getProductsAction,
  });

  const { data: precos = [], isLoading: isLoadingPrecos } = useQuery({
    queryKey: ["precos"],
    queryFn: getPrecosAction,
  });

  return (
    <>
      <div className="mb-12 lg:mb-16">
        <h2 className="text-3xl md:text-4xl font-serif italic text-foreground mb-2">Preços</h2>
        <p className="text-muted-foreground font-sans text-xs md:text-sm tracking-wide">
          Grupos de preço e tabela de valores por produto
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-[380px] shrink-0">
          <GruposPrecoPanel grupos={grupos} isLoading={isLoadingGrupos} />
        </div>
        <div className="w-full flex-1 min-w-0">
          <PrecoMatrix
            products={products}
            grupos={grupos}
            precos={precos}
            isLoading={isLoadingProducts || isLoadingPrecos}
          />
        </div>
      </div>
    </>
  );
}
