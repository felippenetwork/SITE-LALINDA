"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getSiteSettingsAction, saveSiteSettings } from "@/lib/actions/site-settings";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SiteSettingsForm } from "@/components/forms/SiteSettingsForm";
import { ChangePasswordForm } from "@/components/forms/ChangePasswordForm";
import { AdminsManager } from "@/components/sections/AdminsManager";
import type { SiteSettingsValues } from "@/lib/validation/site-settings";

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

  return (
    <>
      <div className="mb-12 lg:mb-16">
        <h2 className="text-3xl md:text-4xl font-serif italic text-stone-900 mb-2">
          Configurações
        </h2>
        <p className="text-stone-400 font-sans text-xs md:text-sm tracking-wide">
          Dados do site, sua conta e administradores do painel
        </p>
      </div>

      <div className="space-y-8">
        <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border-stone-100 shadow-sm overflow-hidden">
          <CardHeader className="bg-stone-50/50 border-b border-stone-100 p-6 md:p-8">
            <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-stone-500">
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

        <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border-stone-100 shadow-sm overflow-hidden">
          <CardHeader className="bg-stone-50/50 border-b border-stone-100 p-6 md:p-8">
            <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-stone-500">
              Segurança da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <ChangePasswordForm />
          </CardContent>
        </Card>

        <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border-stone-100 shadow-sm overflow-hidden">
          <CardHeader className="bg-stone-50/50 border-b border-stone-100 p-6 md:p-8">
            <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-stone-500">
              Administradores
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <AdminsManager />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
