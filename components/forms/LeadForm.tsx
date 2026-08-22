"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitLead } from "@/lib/actions/leads";
import { leadSchema, type LeadFormValues } from "@/lib/validation/lead";

export const LeadForm = () => {
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [submitError, setSubmitError] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: "", email: "", phone: "", interest: "", message: "" },
  });

  const onSubmit = (data: LeadFormValues) => {
    setSubmitError(false);
    startTransition(async () => {
      try {
        await submitLead(data);
        setStatus("success");
        reset();
      } catch {
        setSubmitError(true);
      }
    });
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-full flex flex-col items-center justify-center text-center py-20"
      >
        <span className="text-6xl md:text-8xl mb-8 block">✨</span>
        <h3 className="text-3xl md:text-4xl font-serif italic text-white mb-6">
          Mensagem Recebida
        </h3>
        <p className="text-stone-400 font-sans leading-relaxed max-w-xs mx-auto">
          Logo um de nossos especialistas entrará em contato com você.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-12 text-primary font-sans uppercase tracking-[0.2em] text-[10px] font-black border-b border-primary/30 pb-2"
        >
          Enviar Outra
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8" noValidate>
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-black text-stone-500">
            Seu Nome
          </label>
          <input
            {...register("name")}
            className="w-full bg-transparent border-b border-white/10 py-4 text-white font-serif italic text-lg md:text-xl focus:border-primary outline-none transition-colors placeholder:text-stone-700"
            placeholder="Nome Completo"
          />
          {errors.name && (
            <p className="text-[10px] text-rose-400 font-sans">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-black text-stone-500">
            Seu E-mail
          </label>
          <input
            type="email"
            {...register("email")}
            className="w-full bg-transparent border-b border-white/10 py-4 text-white font-serif italic text-lg md:text-xl focus:border-primary outline-none transition-colors placeholder:text-stone-700"
            placeholder="exemplo@email.com"
          />
          {errors.email && (
            <p className="text-[10px] text-rose-400 font-sans">{errors.email.message}</p>
          )}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-black text-stone-500">
            Telefone
          </label>
          <input
            type="tel"
            {...register("phone")}
            className="w-full bg-transparent border-b border-white/10 py-4 text-white font-serif italic text-lg md:text-xl focus:border-primary outline-none transition-colors placeholder:text-stone-700"
            placeholder="(11) 99999-9999"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-black text-stone-500">
            Assunto
          </label>
          <input
            {...register("interest")}
            className="w-full bg-transparent border-b border-white/10 py-4 text-white font-serif italic text-lg md:text-xl focus:border-primary outline-none transition-colors placeholder:text-stone-700"
            placeholder="Ex: Revenda, Eventos, etc."
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest font-black text-stone-500">
          Mensagem
        </label>
        <textarea
          {...register("message")}
          rows={4}
          className="w-full bg-transparent border-b border-white/10 py-4 text-white font-serif italic text-lg md:text-xl focus:border-primary outline-none transition-colors resize-none placeholder:text-stone-700"
          placeholder="Como podemos ajudar?"
        />
        {errors.message && (
          <p className="text-[10px] text-rose-400 font-sans">{errors.message.message}</p>
        )}
      </div>

      {submitError && (
        <p className="text-xs text-rose-400 font-sans text-center">
          Não foi possível enviar sua mensagem agora. Tente novamente em instantes.
        </p>
      )}

      <button
        disabled={isPending}
        className="w-full py-6 md:py-8 bg-primary text-white rounded-full font-sans uppercase tracking-[0.3em] text-[10px] font-black hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-4 focus:ring-2 focus:ring-primary/20 outline-none"
      >
        {isPending ? <Loader2 className="animate-spin" size={16} /> : "Enviar Mensagem"}
      </button>
    </form>
  );
};
