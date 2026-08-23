"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";

export const HeritageSection = () => {
  return (
    <section className="py-20 md:py-40 bg-stone-900 text-white overflow-hidden">
      <div className="container mx-auto px-6 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 md:gap-32">
          <div className="lg:w-1/2 order-2 lg:order-1">
            <div className="relative aspect-[4/5] w-full rounded-[2rem] md:rounded-[4rem] overflow-hidden group">
              <Image
                src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1200"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105"
                alt="Heritage"
              />
              <div className="absolute inset-0 bg-primary/10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-20 h-20 md:w-32 md:h-32 bg-primary/90 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-2xl scale-90 hover:scale-100 transition-transform active:scale-95">
                  <Play fill="currentColor" className="ml-1 w-6 h-6 md:w-8 md:h-8" />
                </button>
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2 order-1 lg:order-2 space-y-8 md:space-y-12"
          >
            <div className="space-y-6">
              <span className="text-primary-light font-serif italic text-xl md:text-3xl block">
                Nossa Herança
              </span>
              <h2 className="text-5xl md:text-[8rem] font-serif italic leading-[0.85] tracking-tighter">
                Alma <br />
                em cada <br />
                Fibras.
              </h2>
            </div>
            <p className="text-stone-400 font-sans leading-relaxed text-base md:text-xl max-w-md">
              Desde 1998, nossa missão é preservar a essência do pão. Assista ao documentário que
              revela o segredo de nossa referência em qualidade.
            </p>
            <div className="pt-4">
              <Link
                href="/a-lalinda"
                className="bg-white text-stone-900 px-10 md:px-14 py-5 md:py-7 rounded-full font-sans uppercase tracking-[0.2em] text-[9px] md:text-[10px] font-black hover:bg-primary hover:text-white transition-all shadow-xl shadow-black/10 active:scale-95"
              >
                Nossa Jornada
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
