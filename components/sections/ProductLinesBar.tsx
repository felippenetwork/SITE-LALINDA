"use client";

import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { PRODUCT_LINES } from "@/lib/constants/product-lines";

export const ProductLinesBar = () => {
  const [emblaLines] = useEmblaCarousel({ dragFree: true, align: "start" });

  return (
    <section className="relative z-20 -mt-10 px-8">
      <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl shadow-stone-200/50 border border-stone-100 p-6 md:p-8">
        <div className="overflow-hidden" ref={emblaLines}>
          <div className="flex gap-8 md:gap-24 items-center">
            {PRODUCT_LINES.map((line, i) => (
              <Link
                href="/produtos"
                key={i}
                className="flex-[0_0_auto] group flex flex-col items-center gap-2 md:gap-3"
              >
                <span className="text-2xl md:text-3xl group-hover:scale-125 transition-transform duration-500 grayscale group-hover:grayscale-0">
                  {line.icon}
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
