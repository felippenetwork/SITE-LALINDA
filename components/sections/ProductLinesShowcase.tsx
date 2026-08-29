import Image from "next/image";
import Link from "next/link";
import type { ProductLine } from "@/lib/data/product-lines";

interface ProductLinesShowcaseProps {
  lines: ProductLine[];
}

const CARD_SPAN = [
  "lg:col-span-7 h-[22rem] md:h-[26rem]",
  "lg:col-span-5 h-[22rem] md:h-[26rem]",
  "lg:col-span-4 h-[20rem]",
  "lg:col-span-4 h-[20rem]",
  "lg:col-span-4 h-[20rem]",
];

export const ProductLinesShowcase = ({ lines }: ProductLinesShowcaseProps) => {
  const gridLines = lines.slice(0, 5);
  const banner = lines[5];

  return (
    <div className="mb-20 md:mb-28">
      <div className="mb-10 md:mb-14 max-w-2xl">
        <span className="text-primary font-serif italic text-lg md:text-xl mb-3 block">
          Explore por Linha
        </span>
        <h3 className="text-3xl md:text-5xl font-serif italic leading-tight text-foreground mb-4">
          Cada linha, um propósito
        </h3>
        <p className="text-muted-foreground font-sans leading-relaxed text-sm md:text-base">
          Da fornada de todo dia à mesa que pede requinte — escolha uma linha para conhecer o
          catálogo completo dela.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-6 md:mb-8">
        {gridLines.map((line, i) => (
          <Link
            key={line.id}
            href={`/produtos/linha/${line.slug}`}
            className={`group relative block rounded-[2rem] md:rounded-[2.5rem] overflow-hidden ${CARD_SPAN[i]}`}
          >
            {line.image && (
              <Image
                src={line.image}
                alt={line.name}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent" />

            <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
              <h4 className="text-2xl md:text-3xl font-serif italic text-white mb-2 md:mb-3">
                {line.name}
              </h4>
              {line.description && (
                <p className="text-white/70 font-sans text-xs md:text-sm leading-relaxed max-w-md mb-4 line-clamp-3">
                  {line.description}
                </p>
              )}
              <span className="inline-flex items-center gap-3 text-white font-sans uppercase tracking-widest text-[9px] font-black">
                Ver Linha
                <span className="w-8 h-[1px] bg-white/40 group-hover:w-12 group-hover:bg-primary transition-all" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {banner && (
        <Link
          href={`/produtos/linha/${banner.slug}`}
          className="group relative block w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row h-auto md:h-[16rem]"
        >
          <div className="relative w-full md:w-2/5 h-56 md:h-full">
            {banner.image && (
              <Image
                src={banner.image}
                alt={banner.name}
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            )}
          </div>
          <div className="w-full md:w-3/5 bg-white border border-border border-t-0 md:border-t md:border-l-0 rounded-b-[2rem] md:rounded-b-none md:rounded-r-[2.5rem] p-8 md:p-12 flex flex-col justify-center">
            <h4 className="text-2xl md:text-3xl font-serif italic text-foreground mb-3">
              {banner.name}
            </h4>
            {banner.description && (
              <p className="text-muted-foreground font-sans text-sm leading-relaxed max-w-lg mb-4">
                {banner.description}
              </p>
            )}
            <span className="inline-flex items-center gap-3 text-foreground font-sans uppercase tracking-widest text-[9px] font-black group-hover:text-primary transition-colors">
              Ver Linha
              <span className="w-8 h-[1px] bg-border group-hover:w-12 group-hover:bg-primary transition-all" />
            </span>
          </div>
        </Link>
      )}
    </div>
  );
};
