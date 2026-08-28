"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitLead } from "@/lib/actions/leads";
import { leadSchema, type LeadFormValues } from "@/lib/validation/lead";

interface LeadFormProps {
  formToken: string;
}

export const LeadForm = ({ formToken }: LeadFormProps) => {
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [submitError, setSubmitError] = useState<"generic" | "rate_limited" | null>(null);
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

  // The honeypot is a plain uncontrolled input — kept out of react-hook-form
  // /zod so it's never treated as a real field to validate. Reading it off
  // the native form element (via the submit event) rather than a ref avoids
  // React Compiler flagging a possible ref-read-during-render, and still
  // sees whatever a bot wrote regardless of how it wrote it.
  const onSubmit = (data: LeadFormValues, event?: React.BaseSyntheticEvent) => {
    setSubmitError(null);
    const form = event?.target as HTMLFormElement | undefined;
    const honeypot = (form?.elements.namedItem("company") as HTMLInputElement | null)?.value ?? "";

    startTransition(async () => {
      try {
        const result = await submitLead(data, { honeypot, formToken });
        if (result.success) {
          setStatus("success");
          reset();
        } else {
          setSubmitError("rate_limited");
        }
      } catch {
        setSubmitError("generic");
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
      {/* Honeypot: invisible to humans (CSS, not display:none/type=hidden —
          both are trivial for bots to detect), unreachable by keyboard/screen
          reader. Any bot that auto-fills every input in the DOM catches it. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      />
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-2">
          <label className="text-base uppercase tracking-widest font-bold text-stone-400">
            Seu Nome <span className="text-primary">*</span>
          </label>
          <input
            {...register("name")}
            className="w-full bg-transparent border-b border-white/10 py-4 text-white font-sans font-medium text-base md:text-lg focus:border-primary outline-none transition-colors placeholder:text-stone-700"
            placeholder="Nome Completo"
          />
          {errors.name && (
            <p className="text-[10px] text-rose-400 font-sans">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-base uppercase tracking-widest font-bold text-stone-400">
            Seu E-mail <span className="text-primary">*</span>
          </label>
          <input
            type="email"
            {...register("email")}
            className="w-full bg-transparent border-b border-white/10 py-4 text-white font-sans font-medium text-base md:text-lg focus:border-primary outline-none transition-colors placeholder:text-stone-700"
            placeholder="exemplo@email.com"
          />
          {errors.email && (
            <p className="text-[10px] text-rose-400 font-sans">{errors.email.message}</p>
          )}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-2">
          <label className="text-base uppercase tracking-widest font-bold text-stone-400">
            Telefone <span className="text-primary">*</span>
          </label>
          <input
            type="tel"
            {...register("phone")}
            className="w-full bg-transparent border-b border-white/10 py-4 text-white font-sans font-medium text-base md:text-lg focus:border-primary outline-none transition-colors placeholder:text-stone-700"
            placeholder="(11) 99999-9999"
          />
          {errors.phone && (
            <p className="text-[10px] text-rose-400 font-sans">{errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-base uppercase tracking-widest font-bold text-stone-400">
            Assunto <span className="text-primary">*</span>
          </label>
          <input
            {...register("interest")}
            className="w-full bg-transparent border-b border-white/10 py-4 text-white font-sans font-medium text-base md:text-lg focus:border-primary outline-none transition-colors placeholder:text-stone-700"
            placeholder="Ex: Revenda, Eventos, etc."
          />
          {errors.interest && (
            <p className="text-[10px] text-rose-400 font-sans">{errors.interest.message}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-base uppercase tracking-widest font-bold text-stone-400">
          Mensagem <span className="text-primary">*</span>
        </label>
        <textarea
          {...register("message")}
          rows={4}
          className="w-full bg-transparent border-b border-white/10 py-4 text-white font-sans font-medium text-base md:text-lg focus:border-primary outline-none transition-colors resize-none placeholder:text-stone-700"
          placeholder="Como podemos ajudar?"
        />
        {errors.message && (
          <p className="text-[10px] text-rose-400 font-sans">{errors.message.message}</p>
        )}
      </div>

      {submitError === "rate_limited" && (
        <p className="text-xs text-rose-400 font-sans text-center">
          Você atingiu o limite de envios. Tente novamente em 1 hora.
        </p>
      )}
      {submitError === "generic" && (
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
