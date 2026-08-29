"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import type { BreadItem } from "@/lib/data/products";

interface EssenceSectionProps {
  featuredProducts: BreadItem[];
}

interface EssenceCardProps {
  product: BreadItem;
  index: number;
  isFeatured: boolean;
}

// Mirrors TimelineSection's card: color only while the card is actually on
// screen (IntersectionObserver), not hover-gated — desktop keeps the
// original always-color look via md:grayscale-0.
const EssenceCard = ({ product, index, isFeatured }: EssenceCardProps) => {
  const { ref, inView } = useInView({ threshold: 0.6 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2 }}
      className={`relative group flex-[0_0_68%] snap-start aspect-[4/5] rounded-[1.5rem] overflow-hidden md:flex-auto md:aspect-square md:rounded-[2.5rem] ${isFeatured ? "md:row-span-2 md:aspect-[3/4]" : ""}`}
    >
      <Image
        src={product.image}
        alt={product.name}
        fill
        sizes="(min-width: 768px) 50vw, 68vw"
        className={`object-cover transition-all duration-700 md:group-hover:scale-110 md:grayscale-0 ${
          inView ? "grayscale-0" : "grayscale"
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/10 to-transparent opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5 md:p-8 md:opacity-0 md:group-hover:opacity-100">
        <h4 className="text-white font-serif italic text-xl md:text-2xl mb-1 md:mb-2">
          {product.name}
        </h4>
        <Link
          href={`/produtos/${product.id}`}
          className="text-primary-light text-[9px] md:text-[10px] font-sans uppercase tracking-widest font-bold"
        >
          Ver Detalhes
        </Link>
      </div>
    </motion.div>
  );
};

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
              <p className="text-muted-foreground font-sans leading-relaxed text-base md:text-lg max-w-md mb-8 md:mb-12">
                Cada fornada carrega o compromisso de honrar a tradição artesanal, transformando o
                simples pão em um banquete de memórias.
              </p>
              <Link
                href="/a-lalinda"
                className="inline-flex items-center gap-4 text-foreground font-sans uppercase tracking-widest text-[9px] md:text-[10px] font-black group"
              >
                Nossa História{" "}
                <span className="w-8 h-[1px] md:w-12 bg-border group-hover:w-20 group-hover:bg-primary transition-all"></span>
              </Link>
            </motion.div>
            <div className="absolute -top-10 -left-10 md:-top-20 md:-left-20 text-[12rem] md:text-[20rem] font-serif italic text-border -z-10 select-none">
              L
            </div>
          </div>

          <div className="lg:col-span-7 -mx-6 px-6 md:mx-0 md:px-0">
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:pb-0">
              {featuredProducts.map((p, i) => (
                <EssenceCard key={p.id} product={p} index={i} isFeatured={i === 0} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
