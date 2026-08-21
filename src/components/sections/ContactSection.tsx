import { Mail, Phone } from "lucide-react";
import { LeadForm } from "@/components/forms/LeadForm";

export const ContactSection = () => {
  return (
    <section id="contato" className="py-20 md:py-40 px-4 md:px-8 bg-background relative">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-stone-900 rounded-[3rem] md:rounded-[6rem] overflow-hidden flex flex-col lg:flex-row shadow-2xl relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[120px] rounded-full -mr-32 -mt-32"></div>
          <div className="lg:w-1/2 p-10 md:p-20 lg:p-32 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5 relative z-10">
            <div>
              <span className="text-primary font-serif italic text-xl md:text-3xl mb-6 md:mb-10 block">Vamos Conversar?</span>
              <h2 className="text-5xl md:text-8xl lg:text-9xl font-serif italic text-white mb-8 md:mb-16 leading-[0.85] tracking-tighter">Transforme <br/>seu PDV com <br/>Excelência.</h2>
            </div>
            
            <div className="space-y-6 md:space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-sans uppercase tracking-widest text-stone-500 font-black">E-mail</p>
                  <p className="text-white font-serif italic text-lg md:text-xl">contato@lalinda.com.br</p>
                </div>
              </div>
              <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-sans uppercase tracking-widest text-stone-500 font-black">Telefone</p>
                  <p className="text-white font-serif italic text-lg md:text-xl">+55 (11) 9999-9999</p>
                </div>
              </div>
            </div>

            <div className="mt-12 md:mt-16 flex items-center gap-4">
              <a href="#" className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all text-xs md:text-base">IG</a>
              <a href="#" className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all text-xs md:text-base">FB</a>
            </div>
          </div>

          <div className="lg:w-1/2 p-10 md:p-20 lg:p-32 bg-white/5 backdrop-blur-3xl">
            <LeadForm />
          </div>
        </div>
      </div>
    </section>
  );
};
