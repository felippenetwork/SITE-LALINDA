"use client";

import Image from "next/image";
import { PRODUCT_LINES } from "@/lib/constants/product-lines";

interface ProductLinesShowcaseProps {
  onSelectLine: (category: string) => void;
}

const CARD_SPAN = [
  "lg:col-span-7 h-[22rem] md:h-[26rem]",
  "lg:col-span-5 h-[22rem] md:h-[26rem]",
  "lg:col-span-4 h-[20rem]",
  "lg:col-span-4 h-[20rem]",
  "lg:col-span-4 h-[20rem]",
];

export const ProductLinesShowcase = ({ onSelectLine }: ProductLinesShowcaseProps) => {
  const gridLines = PRODUCT_LINES.slice(0, 5);
  const banner = PRODUCT_LINES[5];

  return (
    <div className="mb-20 md:mb-28">
      <div className="mb-10 md:mb-14 max-w-2xl">
        <span className="text-primary font-serif italic text-lg md:text-xl mb-3 block">
          Explore por Linha
        </span>
        <h3 className="text-3xl md:text-5xl font-serif italic leading-tight text-foreground mb-4">
          Cada linha, um propósito
        </h3>
        <p className="text-stone-500 font-sans leading-relaxed text-sm md:text-base">
          Da fornada de todo dia à mesa que pede requinte — escolha uma linha para ver o que ela tem
          de especial, ou vá direto ao catálogo completo mais abaixo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-6 md:mb-8">
        {gridLines.map((line, i) => (
          <button
            key={line.name}
            type="button"
            onClick={() => onSelectLine(line.category)}
            className={`group relative text-left rounded-[2rem] md:rounded-[2.5rem] overflow-hidden ${CARD_SPAN[i]}`}
          >
            <Image
              src={line.image}
              alt={line.name}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent" />

            <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
              <span className="text-2xl mb-2 md:mb-3 block">{line.icon}</span>
              <h4 className="text-2xl md:text-3xl font-serif italic text-white mb-2 md:mb-3">
                {line.name}
              </h4>
              <p className="text-white/70 font-sans text-xs md:text-sm leading-relaxed max-w-md mb-4 line-clamp-3">
                {line.description}
              </p>
              <span className="inline-flex items-center gap-3 text-white font-sans uppercase tracking-widest text-[9px] font-black">
                Ver Linha
                <span className="w-8 h-[1px] bg-white/40 group-hover:w-12 group-hover:bg-primary transition-all" />
              </span>
            </div>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onSelectLine(banner.category)}
        className="group relative w-full text-left rounded-[2rem] md:rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row h-auto md:h-[16rem]"
      >
        <div className="relative w-full md:w-2/5 h-56 md:h-full">
          <Image
            src={banner.image}
            alt={banner.name}
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
        <div className="w-full md:w-3/5 bg-white border border-stone-100 border-t-0 md:border-t md:border-l-0 rounded-b-[2rem] md:rounded-b-none md:rounded-r-[2.5rem] p-8 md:p-12 flex flex-col justify-center">
          <span className="text-2xl mb-2 md:mb-3 block">{banner.icon}</span>
          <h4 className="text-2xl md:text-3xl font-serif italic text-stone-900 mb-3">
            {banner.name}
          </h4>
          <p className="text-stone-500 font-sans text-sm leading-relaxed max-w-lg mb-4">
            {banner.description}
          </p>
          <span className="inline-flex items-center gap-3 text-stone-900 font-sans uppercase tracking-widest text-[9px] font-black group-hover:text-primary transition-colors">
            Ver Linha
            <span className="w-8 h-[1px] bg-stone-200 group-hover:w-12 group-hover:bg-primary transition-all" />
          </span>
        </div>
      </button>
    </div>
  );
};
