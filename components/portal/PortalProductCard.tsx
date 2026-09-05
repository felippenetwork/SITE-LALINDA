"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/format";
import { useCart } from "@/components/portal/CartContext";
import type { BreadItem } from "@/lib/data/products";

interface PortalProductCardProps {
  item: BreadItem;
  valor: number | null;
}

// Mesma linguagem visual de components/shared/ProductCard.tsx (site
// público), mas sem link — não existe página de detalhe ainda — e com o
// preço resolvido + controle de quantidade/adicionar ao carrinho no
// lugar do "Ver Detalhes".
export const PortalProductCard = ({ item, valor }: PortalProductCardProps) => {
  const { adicionarItem } = useCart();
  const [quantidade, setQuantidade] = useState(1);

  const podeAdicionar = item.available && valor !== null;

  const handleAdicionar = () => {
    adicionarItem(item.id, item.name, quantidade);
    toast.success(`${item.name} adicionado ao carrinho`);
    setQuantidade(1);
  };

  return (
    <div>
      <div className="mb-6 relative overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] aspect-[4/5] bg-white">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
        {!item.available && (
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-foreground text-[10px] font-sans font-black uppercase tracking-widest px-4 py-2 rounded-full">
              Indisponível
            </span>
          </div>
        )}
        <div className="absolute top-6 right-6 z-10">
          <Badge
            variant="secondary"
            className="bg-white/95 backdrop-blur-md text-foreground border-none text-[9px] md:text-[10px] px-4 py-1.5 rounded-full font-sans font-bold shadow-lg shadow-black/5"
          >
            {item.weight}
          </Badge>
        </div>
      </div>

      <div className="px-4">
        <span className="text-[9px] font-sans uppercase tracking-[0.2em] font-black text-primary mb-2 block">
          {item.category}
        </span>
        <h3 className="text-2xl font-serif italic text-foreground mb-2">{item.name}</h3>
        {item.description && (
          <p className="text-muted-foreground font-sans text-xs leading-relaxed mb-3 line-clamp-2">
            {item.description}
          </p>
        )}
        <div className="flex items-center gap-4 mb-4 text-muted-foreground font-sans text-[10px] uppercase tracking-widest font-bold">
          <span>{item.weight} / un.</span>
          {item.boxWeight && (
            <>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>{item.boxWeight} / cx.</span>
            </>
          )}
        </div>

        {valor !== null ? (
          <p className="text-xl font-serif italic text-primary mb-4">{formatBRL(valor)}</p>
        ) : (
          <Badge
            variant="outline"
            className="bg-background border-border text-muted-foreground text-[9px] uppercase tracking-widest font-black px-3 mb-4"
          >
            Consulte Disponibilidade
          </Badge>
        )}

        {podeAdicionar && (
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded-full">
              <button
                type="button"
                onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                aria-label="Diminuir quantidade"
                className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-sans font-semibold">{quantidade}</span>
              <button
                type="button"
                onClick={() => setQuantidade((q) => q + 1)}
                aria-label="Aumentar quantidade"
                className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
            <Button
              type="button"
              onClick={handleAdicionar}
              className="flex-1 bg-primary text-white rounded-full h-9 text-[9px] font-black uppercase tracking-widest gap-2"
            >
              <ShoppingCart size={14} /> Adicionar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
