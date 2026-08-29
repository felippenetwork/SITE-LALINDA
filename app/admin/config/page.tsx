"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  getSiteSettingsAction,
  saveSiteSettings,
  savePixelSettings,
  saveStatsSettings,
} from "@/lib/actions/site-settings";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SiteSettingsForm } from "@/components/forms/SiteSettingsForm";
import { PixelSettingsForm } from "@/components/forms/PixelSettingsForm";
import { StatsSettingsForm } from "@/components/forms/StatsSettingsForm";
import { AdminsManager } from "@/components/sections/AdminsManager";
import type { SiteSettingsValues } from "@/lib/validation/site-settings";
import type { PixelSettingsValues } from "@/lib/validation/pixel-settings";
import type { StatsSettingsValues } from "@/lib/validation/stats-settings";

export default function AdminConfigPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSiteSettingsAction,
  });

  const saveSettingsMutation = useMutation({
    mutationFn: saveSiteSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Dados de contato atualizados");
    },
    onError: (error: Error) => {
      toast.error("Erro ao salvar: " + error.message);
    },
  });

  const handleSaveSettings = (data: SiteSettingsValues) => {
    saveSettingsMutation.mutate(data);
  };

  const savePixelsMutation = useMutation({
    mutationFn: savePixelSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Rastreamento atualizado");
    },
    onError: (error: Error) => {
      toast.error("Erro ao salvar: " + error.message);
    },
  });

  const handleSavePixels = (data: PixelSettingsValues) => {
    savePixelsMutation.mutate(data);
  };

  const saveStatsMutation = useMutation({
    mutationFn: saveStatsSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Contadores da home atualizados");
    },
    onError: (error: Error) => {
      toast.error("Erro ao salvar: " + error.message);
    },
  });

  const handleSaveStats = (data: StatsSettingsValues) => {
    saveStatsMutation.mutate(data);
  };

  return (
    <>
      <div className="mb-12 lg:mb-16">
        <h2 className="text-3xl md:text-4xl font-serif italic text-foreground mb-2">
          Configurações
        </h2>
        <p className="text-muted-foreground font-sans text-xs md:text-sm tracking-wide">
          Dados do site e usuários do painel
        </p>
      </div>

      <div className="space-y-8">
        <Card className="rounded-[1.5rem] md:rounded-[2rem] border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-background/50 border-b border-border p-6 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-muted-foreground">
              Dados de Contato do Site
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            {isLoading || !settings ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : (
              <SiteSettingsForm
                settings={settings}
                onSubmit={handleSaveSettings}
                isPending={saveSettingsMutation.isPending}
              />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[1.5rem] md:rounded-[2rem] border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-background/50 border-b border-border p-6 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-muted-foreground">
              Rastreamento e Marketing
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            {isLoading || !settings ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : (
              <PixelSettingsForm
                settings={settings}
                onSubmit={handleSavePixels}
                isPending={savePixelsMutation.isPending}
              />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[1.5rem] md:rounded-[2rem] border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-background/50 border-b border-border p-6 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-muted-foreground">
              Contadores da Home
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            {isLoading || !settings ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : (
              <StatsSettingsForm
                settings={settings}
                onSubmit={handleSaveStats}
                isPending={saveStatsMutation.isPending}
              />
            )}
          </CardContent>
        </Card>

        <AdminsManager />
      </div>
    </>
  );
}
