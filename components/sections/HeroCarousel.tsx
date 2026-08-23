"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

export const HeroCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 }, [
    Autoplay({ delay: 5000 }),
  ]);
  const subscribeToApi = useCallback(
    (callback: () => void) => {
      if (!emblaApi) return () => {};
      emblaApi.on("select", callback);
      return () => emblaApi.off("select", callback);
    },
    [emblaApi],
  );

  const selectedIndex = useSyncExternalStore(
    subscribeToApi,
    () => emblaApi?.selectedScrollSnap() ?? 0,
    () => 0,
  );

  const slides = [
    {
      title: "Para nós o pão é Sagrado",
      subtitle: "Tradição que se amassa a cada madrugada",
      img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2072",
    },
    {
      title: "Logística com Excelência",
      subtitle: "Do nosso forno direto para a sua mesa",
      img: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=2072",
    },
    {
      title: "Qualidade que Alimenta",
      subtitle: "Ingredientes selecionados para momentos únicos",
      img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=2072",
    },
  ];

  return (
    <section className="relative h-[65vh] md:h-[75vh] lg:h-[85vh] overflow-hidden bg-stone-900">
      <div className="h-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((s, i) => (
            <div key={i} className="flex-[0_0_100%] relative h-full overflow-hidden">
              <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: selectedIndex === i ? 1 : 1.1 }}
                transition={{ duration: 10, ease: "linear" }}
                className="absolute inset-0"
              >
                <Image
                  src={s.img}
                  alt={s.title}
                  fill
                  sizes="100vw"
                  priority={i === 0}
                  className="object-cover opacity-60"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-r from-stone-900/85 via-stone-900/55 to-stone-900/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center px-6 md:px-24">
                <div className="max-w-4xl">
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: selectedIndex === i ? 1 : 0,
                      y: selectedIndex === i ? 0 : 20,
                    }}
                    transition={{ delay: 0.2 }}
                    className="inline-block text-primary-light font-sans uppercase tracking-[0.3em] text-[11px] md:text-sm font-bold mb-4 md:mb-6"
                  >
                    {s.subtitle}
                  </motion.span>
                  <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    animate={{
                      opacity: selectedIndex === i ? 1 : 0,
                      y: selectedIndex === i ? 0 : 30,
                    }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-4xl md:text-8xl lg:text-[10rem] font-serif italic text-white leading-[0.85] tracking-tight"
                  >
                    {s.title}
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: selectedIndex === i ? 1 : 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 md:mt-12"
                  >
                    <Link
                      href="/produtos"
                      className="inline-flex items-center gap-4 text-white font-sans uppercase tracking-widest text-[10px] md:text-xs font-bold border-b border-white/30 pb-2 hover:border-primary hover:text-primary transition-all"
                    >
                      Explorar Coleções <ArrowRight size={14} />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 flex items-center gap-4 md:gap-6 z-20">
        <button
          onClick={() => emblaApi?.scrollPrev()}
          className="text-white/50 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1} />
        </button>
        <div className="text-white font-serif italic text-xl md:text-2xl">
          0{selectedIndex + 1}{" "}
          <span className="text-white/30 text-xs md:text-sm not-italic font-sans mx-1 md:mx-2">
            /
          </span>{" "}
          0{slides.length}
        </div>
        <button
          onClick={() => emblaApi?.scrollNext()}
          className="text-white/50 hover:text-white transition-colors"
        >
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1} />
        </button>
      </div>
    </section>
  );
};
