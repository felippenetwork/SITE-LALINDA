"use client";

import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import type { ProductLine } from "@/lib/data/product-lines";

interface ProductLinesBarProps {
  lines: ProductLine[];
}

export const ProductLinesBar = ({ lines }: ProductLinesBarProps) => {
  const [emblaLines] = useEmblaCarousel({ dragFree: true, align: "start" });

  return (
    <section className="relative z-20 -mt-10 px-8">
      <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl shadow-stone-200/50 border border-stone-100 p-6 md:p-8">
        <div className="overflow-hidden" ref={emblaLines}>
          <div className="flex gap-8 md:gap-24 items-center">
            {lines.map((line) => (
              <Link
                href={`/produtos/linha/${line.slug}`}
                key={line.id}
                className="flex-[0_0_auto] group flex flex-col items-center gap-2 md:gap-3"
              >
                <span className="relative block w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110 bg-stone-100">
                  {line.image && (
                    <Image src={line.image} alt="" fill sizes="48px" className="object-cover" />
                  )}
                </span>
                <span className="text-[8px] md:text-[9px] font-sans uppercase tracking-[0.2em] font-black text-stone-400 group-hover:text-primary transition-colors">
                  {line.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
