"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { SiteSettings } from "@/lib/data/site-settings";
import { pixelSettingsSchema, type PixelSettingsValues } from "@/lib/validation/pixel-settings";

interface PixelSettingsFormProps {
  settings: SiteSettings;
  onSubmit: (data: PixelSettingsValues) => void;
  isPending: boolean;
}

export const PixelSettingsForm = ({ settings, onSubmit, isPending }: PixelSettingsFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PixelSettingsValues>({
    resolver: zodResolver(pixelSettingsSchema),
    defaultValues: {
      gtmId: settings.gtmId ?? "",
      metaPixelId: settings.metaPixelId ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <p className="text-xs text-stone-400 leading-relaxed max-w-2xl">
        Cole os códigos abaixo para ativar o rastreamento de visitantes no site. O Google Tag
        Manager já cobre Google Analytics e conversão do Google Ads — configure essas tags dentro do
        próprio painel do GTM (tagmanager.google.com), não aqui.
      </p>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="gtmId"
            className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
          >
            Google Tag Manager
          </Label>
          <Input
            id="gtmId"
            placeholder="GTM-XXXXXXX"
            {...register("gtmId")}
            className="rounded-xl border-stone-100 bg-stone-50 h-12"
          />
          {errors.gtmId && <p className="text-[10px] text-rose-500">{errors.gtmId.message}</p>}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="metaPixelId"
            className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
          >
            Meta Pixel ID
          </Label>
          <Input
            id="metaPixelId"
            placeholder="123456789012345"
            {...register("metaPixelId")}
            className="rounded-xl border-stone-100 bg-stone-50 h-12"
          />
          {errors.metaPixelId && (
            <p className="text-[10px] text-rose-500">{errors.metaPixelId.message}</p>
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
          Salvar Rastreamento
        </Button>
      </div>
    </form>
  );
};
