"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export const AboutStory = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="relative aspect-square w-full max-w-xs mb-12 rounded-[2rem] md:rounded-[3rem] border border-stone-100 overflow-hidden hover:shadow-2xl hover:shadow-stone-200/50 transition-shadow duration-500">
        <Image
          src="/logo-lalinda.jpg"
          alt="Mascote La Linda: padeira artesanal segurando uma cesta de pães e um rolo de macarrão"
          fill
          sizes="320px"
          className="object-cover"
        />
      </div>
      <h3 className="text-5xl font-serif italic mb-12 leading-tight">
        Onde o tempo <br />
        se torna sabor.
      </h3>
      <p className="text-stone-500 font-sans leading-relaxed text-lg mb-8">
        Fundada em 2011, a La Linda nasceu com o propósito de resgatar a panificação clássica.
        Acreditamos que o pão é mais do que um alimento; é um símbolo de união, conforto e tradição.
      </p>
      <p className="text-stone-500 font-sans leading-relaxed text-lg mb-12">
        Ao longo de mais de uma década, evoluímos tecnologicamente, mas mantivemos o coração
        artesanal. Cada pão que sai de nossos fornos carrega consigo horas de fermentação natural e
        mãos experientes que moldam a massa.
      </p>
    </motion.div>
  );
};
