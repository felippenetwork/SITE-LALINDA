"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProductsAction } from "@/lib/actions/products";
import { getProductLinesAction } from "@/lib/actions/product-lines";
import { CatalogLinesPanel } from "@/components/sections/CatalogLinesPanel";
import { CatalogProductsPanel } from "@/components/sections/CatalogProductsPanel";

export default function AdminCatalogoPage() {
  // Raw user selection — falls back to the first line during render
  // (below) whenever it's unset or points at a line that no longer exists,
  // rather than syncing that fallback back into state via an effect.
  const [requestedLineId, setRequestedLineId] = useState<string | null>(null);

  const { data: lines = [], isLoading: isLoadingLines } = useQuery({
    queryKey: ["product-lines"],
    queryFn: getProductLinesAction,
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: getProductsAction,
  });

  const selectedLine =
    lines.find((l) => l.id === requestedLineId) ?? (lines.length > 0 ? lines[0]! : null);
  const selectedLineId = selectedLine?.id ?? null;

  return (
    <>
      <div className="mb-12 lg:mb-16">
        <h2 className="text-3xl md:text-4xl font-serif italic text-stone-900 mb-2">Catálogo</h2>
        <p className="text-stone-400 font-sans text-xs md:text-sm tracking-wide">
          Gestão de linhas e produtos do catálogo artesanal La Linda
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-[380px] shrink-0">
          <CatalogLinesPanel
            lines={lines}
            isLoading={isLoadingLines}
            selectedLineId={selectedLineId}
            onSelectLine={setRequestedLineId}
          />
        </div>
        <div className="w-full flex-1 min-w-0">
          <CatalogProductsPanel
            products={products}
            allLines={lines}
            selectedLine={selectedLine}
            isLoading={isLoadingProducts}
          />
        </div>
      </div>
    </>
  );
}
