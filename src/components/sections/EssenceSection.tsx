import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BreadItem } from "@/lib/catalog-data.functions";

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
              <span className="text-primary font-serif italic text-xl md:text-3xl mb-4 md:mb-8 block">A Arte do Trigo</span>
              <h2 className="text-5xl md:text-9xl font-serif italic leading-[0.8] text-foreground mb-8 md:mb-12 tracking-tighter">
                Pão, <br/>Propósito <br/>& Paixão
              </h2>
              <p className="text-stone-500 font-sans leading-relaxed text-base md:text-lg max-w-md mb-8 md:mb-12">
                Cada fornada carrega o compromisso de honrar a tradição artesanal, transformando o simples pão em um banquete de memórias.
              </p>
              <Link to="/a-lalinda" className="inline-flex items-center gap-4 text-foreground font-sans uppercase tracking-widest text-[9px] md:text-[10px] font-black group">
                Nossa História <span className="w-8 h-[1px] md:w-12 bg-stone-200 group-hover:w-20 group-hover:bg-primary transition-all"></span>
              </Link>
            </motion.div>
            <div className="absolute -top-10 -left-10 md:-top-20 md:-left-20 text-[12rem] md:text-[20rem] font-serif italic text-stone-100 -z-10 select-none">L</div>
          </div>
          
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {featuredProducts.map((p: BreadItem, i: number) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className={`relative group rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden ${i === 0 ? 'md:row-span-2 aspect-[4/3] md:aspect-[3/4]' : 'aspect-square md:aspect-square'}`}
              >
                <img src={p.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 md:p-8">
                  <h4 className="text-white font-serif italic text-xl md:text-2xl mb-1 md:mb-2">{p.name}</h4>
                  <Link to="/produtos/$productId" params={{ productId: p.id }} className="text-primary text-[9px] md:text-[10px] font-sans uppercase tracking-widest font-bold">Ver Detalhes</Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
