"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { SiteSettings } from "@/lib/data/site-settings";
import { statsSettingsSchema, type StatsSettingsValues } from "@/lib/validation/stats-settings";

interface StatsSettingsFormProps {
  settings: SiteSettings;
  onSubmit: (data: StatsSettingsValues) => void;
  isPending: boolean;
}

export const StatsSettingsForm = ({ settings, onSubmit, isPending }: StatsSettingsFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StatsSettingsValues>({
    resolver: zodResolver(statsSettingsSchema),
    defaultValues: { stats: settings.stats },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid sm:grid-cols-3 gap-6">
        {([0, 1, 2] as const).map((index) => (
          <div key={index} className="space-y-4 p-4 rounded-xl bg-background border border-border">
            <div className="space-y-2">
              <Label
                htmlFor={`stats.${index}.value`}
                className="text-xs uppercase tracking-widest font-bold text-muted-foreground"
              >
                Número
              </Label>
              <Input
                id={`stats.${index}.value`}
                type="number"
                {...register(`stats.${index}.value`)}
                className="rounded-xl border-border bg-white h-12"
              />
              {errors.stats?.[index]?.value && (
                <p className="text-[10px] text-rose-500">{errors.stats[index]?.value?.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor={`stats.${index}.label`}
                className="text-xs uppercase tracking-widest font-bold text-muted-foreground"
              >
                Rótulo
              </Label>
              <Input
                id={`stats.${index}.label`}
                {...register(`stats.${index}.label`)}
                className="rounded-xl border-border bg-white h-12"
              />
              {errors.stats?.[index]?.label && (
                <p className="text-[10px] text-rose-500">{errors.stats[index]?.label?.message}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-primary text-white rounded-full px-8 py-6 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 h-auto"
        >
          {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
          Salvar Contadores
        </Button>
      </div>
    </form>
  );
};
