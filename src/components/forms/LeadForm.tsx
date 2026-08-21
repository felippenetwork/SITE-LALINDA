import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { submitLead } from "@/lib/catalog-data.functions";

export const LeadForm = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', interest: '', message: ''
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const submitLeadFn = useServerFn(submitLead);
  const leadMutation = useMutation({
    mutationFn: submitLeadFn,
    onSuccess: () => {
      setFormStatus('success');
      setFormData({ name: '', email: '', phone: '', interest: '', message: '' });
    },
    onError: () => setFormStatus('error')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    leadMutation.mutate({ data: formData });
  };

  if (formStatus === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="h-full flex flex-col items-center justify-center text-center py-20"
      >
        <span className="text-6xl md:text-8xl mb-8 block">✨</span>
        <h3 className="text-3xl md:text-4xl font-serif italic text-white mb-6">Mensagem Recebida</h3>
        <p className="text-stone-400 font-sans leading-relaxed max-w-xs mx-auto">Logo um de nossos especialistas entrará em contato com você.</p>
        <button onClick={() => setFormStatus('idle')} className="mt-12 text-primary font-sans uppercase tracking-[0.2em] text-[10px] font-black border-b border-primary/30 pb-2">Enviar Outra</button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-black text-stone-500">Seu Nome</label>
          <input 
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full bg-transparent border-b border-white/10 py-4 text-white font-serif italic text-lg md:text-xl focus:border-primary outline-none transition-colors placeholder:text-stone-700" 
            placeholder="Nome Completo"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-black text-stone-500">Seu E-mail</label>
          <input 
            required
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full bg-transparent border-b border-white/10 py-4 text-white font-serif italic text-lg md:text-xl focus:border-primary outline-none transition-colors placeholder:text-stone-700" 
            placeholder="exemplo@email.com"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest font-black text-stone-500">Assunto</label>
        <input 
          value={formData.interest}
          onChange={(e) => setFormData({...formData, interest: e.target.value})}
          className="w-full bg-transparent border-b border-white/10 py-4 text-white font-serif italic text-lg md:text-xl focus:border-primary outline-none transition-colors placeholder:text-stone-700" 
          placeholder="Ex: Revenda, Eventos, etc."
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest font-black text-stone-500">Mensagem</label>
        <textarea 
          required
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          rows={4}
          className="w-full bg-transparent border-b border-white/10 py-4 text-white font-serif italic text-lg md:text-xl focus:border-primary outline-none transition-colors resize-none placeholder:text-stone-700" 
          placeholder="Como podemos ajudar?"
        />
      </div>
      <button 
        disabled={formStatus === 'loading'}
        className="w-full py-6 md:py-8 bg-primary text-white rounded-full font-sans uppercase tracking-[0.3em] text-[10px] font-black hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-4 focus:ring-2 focus:ring-primary/20 outline-none"
      >
        {formStatus === 'loading' ? <Loader2 className="animate-spin" size={16} /> : 'Enviar Mensagem'}
      </button>
    </form>
  );
};
