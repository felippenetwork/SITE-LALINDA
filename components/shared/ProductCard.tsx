"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { BreadItem } from "@/lib/data/products";

interface ProductCardProps {
  item: BreadItem;
}

export const ProductCard = ({ item }: ProductCardProps) => {
  return (
    <div className="group">
      <Link
        href={`/produtos/${item.id}`}
        className="block mb-6 relative overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] aspect-[4/5] bg-white group-hover:shadow-2xl group-hover:shadow-primary/5 transition-all duration-700"
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
        />
        {!item.available && (
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-stone-900 text-[10px] font-sans font-black uppercase tracking-widest px-4 py-2 rounded-full">
              Indisponível
            </span>
          </div>
        )}
        <div className="absolute top-6 right-6 z-10">
          <Badge
            variant="secondary"
            className="bg-white/95 backdrop-blur-md text-stone-900 border-none text-[9px] md:text-[10px] px-4 py-1.5 rounded-full font-sans font-bold shadow-lg shadow-black/5"
          >
            {item.weight}
          </Badge>
        </div>
        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </Link>

      <div className="px-4">
        <span className="text-[9px] font-sans uppercase tracking-[0.2em] font-black text-primary mb-2 block">
          {item.category}
        </span>
        <h3 className="text-2xl font-serif italic text-stone-900 mb-4 group-hover:text-primary transition-colors">
          {item.name}
        </h3>
        <Link
          href={`/produtos/${item.id}`}
          className="inline-flex items-center gap-4 text-stone-400 font-sans uppercase tracking-widest text-[9px] font-black group-hover:text-stone-900 transition-colors"
        >
          Ver Detalhes{" "}
          <span className="w-8 h-[1px] bg-stone-200 group-hover:w-12 group-hover:bg-primary transition-all"></span>
        </Link>
      </div>
    </div>
  );
};
