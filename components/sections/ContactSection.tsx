import { Mail } from "lucide-react";
import { LeadForm } from "@/components/forms/LeadForm";
import type { SiteSettings } from "@/lib/data/site-settings";

interface ContactSectionProps {
  settings: SiteSettings;
}

export const ContactSection = ({ settings }: ContactSectionProps) => {
  return (
    <section
      id="contato"
      className="pt-20 md:pt-40 pb-12 md:pb-20 px-4 md:px-8 bg-background relative"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="bg-stone-900 rounded-[3rem] md:rounded-[6rem] overflow-hidden flex flex-col lg:flex-row shadow-2xl relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[120px] rounded-full -mr-32 -mt-32"></div>
          <div className="lg:w-1/2 p-10 md:p-20 lg:p-32 flex flex-col justify-center gap-10 md:gap-14 border-b lg:border-b-0 lg:border-r border-white/5 relative z-10">
            <div>
              <span className="text-primary font-serif italic text-xl md:text-3xl mb-6 md:mb-10 block">
                Vamos Conversar?
              </span>
              <h2 className="text-5xl md:text-8xl lg:text-9xl font-serif italic text-white mb-6 md:mb-8 leading-[0.85] tracking-tighter">
                Nosso Pão <br />
                na Sua <br />
                Vitrine.
              </h2>
              <p className="text-stone-400 font-sans leading-relaxed text-sm md:text-base max-w-sm mb-10 md:mb-14">
                Seja para revender nossos pães em sua loja, fechar uma parceria para eventos ou
                tirar qualquer dúvida, fale com a nossa equipe pelos canais de contato ou pelo
                formulário.
              </p>
            </div>

            <div className="space-y-6 md:space-y-8">
              <p className="text-sm font-sans uppercase tracking-widest text-stone-400 font-bold mb-2">
                Nossos Canais de Atendimento
              </p>
              <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-sm font-sans uppercase tracking-widest text-stone-400 font-bold">
                    E-mail
                  </p>
                  <p className="text-white font-sans font-semibold text-base md:text-lg">
                    {settings.contactEmail}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 p-10 md:p-20 lg:p-32 bg-white/5 backdrop-blur-3xl">
            <p className="text-sm font-sans uppercase tracking-widest text-stone-400 font-bold mb-3">
              Envie uma Mensagem
            </p>
            <h3 className="text-2xl md:text-3xl font-serif italic text-white mb-10 md:mb-14">
              Como podemos ajudar?
            </h3>
            <LeadForm />
          </div>
        </div>
      </div>
    </section>
  );
};
