import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/a-lalinda")({
  head: () => ({
    meta: [
      { title: "A La Linda | Nossa História e Tradição" },
      { name: "description", content: "Conheça a história da La Linda Pães Especiais, nossa missão, visão e o segredo por trás de nossos pães artesanais." },
      { property: "og:title", content: "A La Linda | Nossa História e Tradição" },
      { property: "og:description", content: "Conheça a história da La Linda Pães Especiais, nossa missão, visão e o segredo por trás de nossos pães artesanais." },
      { name: "twitter:card", content: "summary_large_image" }
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-stone-50 font-serif text-foreground selection:bg-primary selection:text-white">
      {/* Shared Header */}
      <Navbar activeItem="A Lalinda" />

      <main>
        {/* Banner Section */}
        <section className="relative h-[50vh] md:h-[60vh] flex items-center px-6 md:px-8 bg-stone-900 overflow-hidden pt-16 md:pt-0">
          <div className="absolute inset-0 opacity-40">
            <img 
              src="https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=2070" 
              className="w-full h-full object-cover grayscale" 
              alt="Bakery heritage"
            />
          </div>
          <div className="relative z-10 max-w-5xl">
            <span className="text-primary font-serif italic text-2xl md:text-4xl mb-6 block">Nossa Herança</span>
            <h2 className="text-6xl md:text-[10rem] lg:text-[12rem] font-serif italic text-white leading-[0.8] mb-8 tracking-tighter">
              A <br/>Arte que <br/>Alimenta.
            </h2>
          </div>
          <div className="absolute bottom-12 right-12 hidden lg:block">
            <span className="text-white/20 font-serif italic text-[10rem] select-none">1998</span>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 md:py-40 bg-white">
          <div className="container mx-auto px-6 md:px-8">
            <div className="grid lg:grid-cols-12 gap-16 md:gap-24 items-start">
              <div className="lg:col-span-5">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="relative aspect-square w-full max-w-xs mb-12 rounded-[2rem] md:rounded-[3rem] border border-stone-100 overflow-hidden hover:shadow-2xl hover:shadow-stone-200/50 transition-shadow duration-500">
                    <img
                      src="/logo-lalinda.jpg"
                      alt="Mascote La Linda: padeira artesanal segurando uma cesta de pães e um rolo de macarrão"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="text-5xl font-serif italic mb-12 leading-tight">Onde o tempo <br/>se torna sabor.</h3>
                  <p className="text-stone-500 font-sans leading-relaxed text-lg mb-8">
                    Fundada em 1998, a La Linda nasceu com o propósito de resgatar a panificação clássica. Acreditamos que o pão é mais do que um alimento; é um símbolo de união, conforto e tradição.
                  </p>
                  <p className="text-stone-500 font-sans leading-relaxed text-lg mb-12">
                    Ao longo de mais de duas décadas, evoluímos tecnologicamente, mas mantivemos o coração artesanal. Cada pão que sai de nossos fornos carrega consigo horas de fermentação natural e mãos experientes que moldam a massa.
                  </p>
                </motion.div>
              </div>
              
              <div className="lg:col-span-7 grid md:grid-cols-2 gap-8">
                <div className="bg-stone-50 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-stone-100 group hover:bg-white hover:shadow-2xl hover:shadow-stone-200/50 transition-all duration-500">
                  <span className="text-3xl md:text-4xl mb-6 md:mb-8 block grayscale group-hover:grayscale-0 transition-all">🥖</span>
                  <h4 className="text-xl md:text-2xl font-serif italic mb-4 md:mb-6">Qualidade Artesanal</h4>
                  <p className="text-stone-500 font-sans text-xs md:text-sm leading-relaxed">Respeitamos o tempo da natureza, utilizando fermentação natural (Levain) que resulta em pães mais nutritivos, saborosos e de fácil digestão.</p>
                </div>
                <div className="bg-stone-900 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                  <span className="text-3xl md:text-4xl mb-6 md:mb-8 block grayscale group-hover:grayscale-0 transition-all">🤝</span>
                  <h4 className="text-xl md:text-2xl font-serif italic mb-4 md:mb-6 text-primary">Compromisso</h4>
                  <p className="text-stone-400 font-sans text-xs md:text-sm leading-relaxed">Trabalhamos em parceria com produtores locais e investimos na capacitação de nossa equipe, valorizando o ofício do padeiro.</p>
                  <div className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 text-white/5 text-7xl md:text-9xl font-serif italic select-none">LL</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission/Vision Section */}
        <section className="py-20 md:py-40 bg-stone-50">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-4xl mx-auto text-center mb-24">
              <h3 className="text-6xl font-serif italic mb-8">Nossas Diretrizes</h3>
              <p className="text-stone-400 font-sans uppercase tracking-[0.2em] text-[10px] font-black">O que nos move a cada madrugada</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-16">
              {[
                { 
                  letter: "M", 
                  title: "Missão", 
                  desc: "Proporcionar experiências gastronômicas memoráveis através de produtos de panificação de alta qualidade, resgatando a tradição artesanal." 
                },
                { 
                  letter: "V", 
                  title: "Visão", 
                  desc: "Ser a referência nacional em pães especiais e confeitaria artesanal, reconhecida pela excelência no sabor e inovação sustentável." 
                },
                { 
                  letter: "V", 
                  title: "Valores", 
                  desc: "Ética, Respeito à Tradição, Valorização do Ser Humano, Qualidade Impecável e Paixão por Panificar." 
                }
              ].map((item, i) => (
                <div key={i} className="text-center group">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-10 shadow-lg group-hover:bg-primary group-hover:text-white transition-all text-primary font-serif italic text-3xl">
                    {item.letter}
                  </div>
                  <h4 className="text-3xl font-serif italic mb-6">{item.title}</h4>
                  <p className="text-stone-500 font-sans text-sm leading-relaxed italic">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-40 bg-primary overflow-hidden relative">
          <div className="container mx-auto px-6 md:px-8 text-center relative z-10">
            <h3 className="text-4xl md:text-8xl font-serif italic text-white mb-8 md:mb-12">Experimente <br/>a Tradição</h3>
            <p className="text-white/70 font-sans text-lg mb-16 max-w-2xl mx-auto leading-relaxed">
              Cada pão La Linda é um convite para desacelerar e apreciar o que há de mais nobre na panificação.
            </p>
            <Link to="/produtos" className="inline-block bg-white text-stone-900 px-10 md:px-16 py-4 md:py-6 rounded-full font-sans uppercase tracking-widest text-[9px] md:text-[10px] font-black hover:bg-stone-900 hover:text-white transition-all shadow-2xl">
              Ver Nossa Coleção
            </Link>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30rem] font-serif italic text-white/5 select-none -z-0">La Linda</div>
        </section>
      </main>

      <Footer variant="dark" />
    </div>
  );
}
