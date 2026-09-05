import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/format";
import type { BreadItem } from "@/lib/data/products";

interface PortalProductCardProps {
  item: BreadItem;
  valor: number | null;
}

// Mesma linguagem visual de components/shared/ProductCard.tsx (site
// público), mas sem link — não existe página de detalhe nem carrinho
// ainda — e com o preço resolvido no lugar do "Ver Detalhes".
export const PortalProductCard = ({ item, valor }: PortalProductCardProps) => {
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
          <p className="text-xl font-serif italic text-primary">{formatBRL(valor)}</p>
        ) : (
          <Badge
            variant="outline"
            className="bg-background border-border text-muted-foreground text-[9px] uppercase tracking-widest font-black px-3"
          >
            Consulte Disponibilidade
          </Badge>
        )}
      </div>
    </div>
  );
};
