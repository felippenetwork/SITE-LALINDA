"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { BreadItem } from "@/lib/data/products";

interface EssenceSectionProps {
  featuredProducts: BreadItem[];
}

export const EssenceSection = ({ featuredProducts }: EssenceSectionProps) => {
  return (
    <section className="py-20 md:py-40 bg-background overflow-hidden">
      <div className="container mx-auto px-6 md:px-8">
        <div className="grid lg:grid-cols-12 gap-16 md:gap-24 items-center">
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <span className="text-primary font-serif italic text-xl md:text-3xl mb-4 md:mb-8 block">
                A Arte do Trigo
              </span>
              <h2 className="text-5xl md:text-9xl font-serif italic leading-[0.8] text-foreground mb-8 md:mb-12 tracking-tighter">
                Pão, <br />
                Propósito <br />& Paixão
              </h2>
              <p className="text-stone-500 font-sans leading-relaxed text-base md:text-lg max-w-md mb-8 md:mb-12">
                Cada fornada carrega o compromisso de honrar a tradição artesanal, transformando o
                simples pão em um banquete de memórias.
              </p>
              <Link
                href="/a-lalinda"
                className="inline-flex items-center gap-4 text-foreground font-sans uppercase tracking-widest text-[9px] md:text-[10px] font-black group"
              >
                Nossa História{" "}
                <span className="w-8 h-[1px] md:w-12 bg-stone-200 group-hover:w-20 group-hover:bg-primary transition-all"></span>
              </Link>
            </motion.div>
            <div className="absolute -top-10 -left-10 md:-top-20 md:-left-20 text-[12rem] md:text-[20rem] font-serif italic text-stone-100 -z-10 select-none">
              L
            </div>
          </div>

          <div className="lg:col-span-7 -mx-6 px-6 md:mx-0 md:px-0">
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:pb-0">
              {featuredProducts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className={`relative group flex-[0_0_68%] snap-start aspect-[4/5] rounded-[1.5rem] overflow-hidden md:flex-auto md:aspect-square md:rounded-[2.5rem] ${i === 0 ? "md:row-span-2 md:aspect-[3/4]" : ""}`}
                >
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="(min-width: 768px) 50vw, 68vw"
                    className="object-cover transition-transform duration-1000 md:group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/10 to-transparent opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5 md:p-8 md:opacity-0 md:group-hover:opacity-100">
                    <h4 className="text-white font-serif italic text-xl md:text-2xl mb-1 md:mb-2">
                      {p.name}
                    </h4>
                    <Link
                      href={`/produtos/${p.id}`}
                      className="text-primary-light text-[9px] md:text-[10px] font-sans uppercase tracking-widest font-bold"
                    >
                      Ver Detalhes
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
