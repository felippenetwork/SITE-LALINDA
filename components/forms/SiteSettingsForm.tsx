"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { SiteSettings } from "@/lib/data/site-settings";
import { siteSettingsSchema, type SiteSettingsValues } from "@/lib/validation/site-settings";

interface SiteSettingsFormProps {
  settings: SiteSettings;
  onSubmit: (data: SiteSettingsValues) => void;
  isPending: boolean;
}

export const SiteSettingsForm = ({ settings, onSubmit, isPending }: SiteSettingsFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SiteSettingsValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      instagramUrl: settings.instagramUrl ?? "",
      facebookUrl: settings.facebookUrl ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="contactEmail"
            className="text-[10px] uppercase tracking-widest font-black text-stone-400"
          >
            E-mail de Contato
          </Label>
          <Input
            id="contactEmail"
            type="email"
            {...register("contactEmail")}
            className="rounded-xl border-stone-100 bg-stone-50 h-12"
          />
          {errors.contactEmail && (
            <p className="text-[10px] text-rose-500">{errors.contactEmail.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="contactPhone"
            className="text-[10px] uppercase tracking-widest font-black text-stone-400"
          >
            Telefone / WhatsApp
          </Label>
          <Input
            id="contactPhone"
            {...register("contactPhone")}
            className="rounded-xl border-stone-100 bg-stone-50 h-12"
          />
          {errors.contactPhone && (
            <p className="text-[10px] text-rose-500">{errors.contactPhone.message}</p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="instagramUrl"
            className="text-[10px] uppercase tracking-widest font-black text-stone-400"
          >
            Instagram (opcional)
          </Label>
          <Input
            id="instagramUrl"
            placeholder="https://instagram.com/lalinda"
            {...register("instagramUrl")}
            className="rounded-xl border-stone-100 bg-stone-50 h-12"
          />
          {errors.instagramUrl && (
            <p className="text-[10px] text-rose-500">{errors.instagramUrl.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="facebookUrl"
            className="text-[10px] uppercase tracking-widest font-black text-stone-400"
          >
            Facebook (opcional)
          </Label>
          <Input
            id="facebookUrl"
            placeholder="https://facebook.com/lalinda"
            {...register("facebookUrl")}
            className="rounded-xl border-stone-100 bg-stone-50 h-12"
          />
          {errors.facebookUrl && (
            <p className="text-[10px] text-rose-500">{errors.facebookUrl.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-primary text-white rounded-full px-8 py-6 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 h-auto"
        >
          {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
          Salvar Dados de Contato
        </Button>
      </div>
    </form>
  );
};
