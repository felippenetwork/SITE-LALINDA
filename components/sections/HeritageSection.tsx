"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useInView } from "react-intersection-observer";

// Placeholder stock footage (Pexels, free license) until a real La Linda
// video is provided — swap the <source src> below when one is available.
const PLACEHOLDER_VIDEO_SRC =
  "https://videos.pexels.com/video-files/3195294/3195294-hd_1280_720_25fps.mp4";
const PLACEHOLDER_POSTER = "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1200";

export const HeritageSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section className="py-20 md:py-40 bg-stone-900 text-white overflow-hidden">
      <div className="container mx-auto px-6 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 md:gap-32">
          <div className="w-full lg:w-1/2 order-1">
            <div
              ref={ref}
              className="relative aspect-square w-full max-w-[280px] mx-auto rounded-[2rem] overflow-hidden bg-stone-800 md:max-w-none md:aspect-[4/5] md:rounded-[4rem]"
            >
              {inView && (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster={PLACEHOLDER_POSTER}
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <source src={PLACEHOLDER_VIDEO_SRC} type="video/mp4" />
                </video>
              )}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 order-2 space-y-8 md:space-y-12"
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
