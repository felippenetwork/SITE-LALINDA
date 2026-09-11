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
import {
  getIntegracaoBradescoPixAction,
  saveIntegracaoBradescoPix,
} from "@/lib/actions/integracao-bradesco";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SiteSettingsForm } from "@/components/forms/SiteSettingsForm";
import { PixelSettingsForm } from "@/components/forms/PixelSettingsForm";
import { StatsSettingsForm } from "@/components/forms/StatsSettingsForm";
import { BradescoPixForm } from "@/components/forms/BradescoPixForm";
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

  const { data: bradescoSettings, isLoading: isLoadingBradesco } = useQuery({
    queryKey: ["integracao-bradesco-pix"],
    queryFn: getIntegracaoBradescoPixAction,
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

  const saveBradescoMutation = useMutation({
    mutationFn: saveIntegracaoBradescoPix,
    onSuccess: (resultado) => {
      if (!resultado.success) {
        toast.error(resultado.error);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["integracao-bradesco-pix"] });
      toast.success("Credenciais do Bradesco atualizadas");
    },
    onError: (error: Error) => {
      toast.error("Erro ao salvar: " + error.message);
    },
  });

  const handleSaveBradesco = (formData: FormData) => {
    saveBradescoMutation.mutate(formData);
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

        <Card className="rounded-[1.5rem] md:rounded-[2rem] border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-background/50 border-b border-border p-6 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-muted-foreground">
              Integração PIX — Bradesco
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-8">
            <div className="rounded-xl border border-border bg-background/50 p-5 space-y-2">
              <p className="text-xs font-sans font-black uppercase tracking-widest text-foreground">
                Onde encontrar suas credenciais no portal de desenvolvedores do Bradesco
              </p>
              <ol className="text-xs text-muted-foreground leading-relaxed list-decimal list-inside space-y-1">
                <li>
                  Acesse o portal de desenvolvedores do Bradesco e entre com as credenciais da sua
                  conta empresarial.
                </li>
                <li>
                  Localize a aplicação/API PIX já cadastrada (ou crie uma nova aplicação, se ainda
                  não existir).
                </li>
                <li>
                  Na página da aplicação, copie o <strong>Client ID</strong> e o{" "}
                  <strong>Client Secret</strong> gerados para autenticação OAuth2.
                </li>
                <li>
                  Baixe o <strong>certificado digital (.pfx)</strong> vinculado a essa aplicação —
                  necessário para a autenticação mTLS nas chamadas à API.
                </li>
                <li>
                  Anote a <strong>senha do certificado</strong>, definida no momento em que ele foi
                  gerado ou baixado.
                </li>
              </ol>
              <p className="text-[10px] text-muted-foreground italic pt-1">
                Guarde essas 4 informações com cuidado — depois de salvas aqui, elas não podem mais
                ser visualizadas por completo.
              </p>
            </div>

            {isLoadingBradesco || !bradescoSettings ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : (
              <BradescoPixForm
                settings={bradescoSettings}
                onSubmit={handleSaveBradesco}
                isPending={saveBradescoMutation.isPending}
              />
            )}
          </CardContent>
        </Card>

        <AdminsManager />
      </div>
    </>
  );
}
