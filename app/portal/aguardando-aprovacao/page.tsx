import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Clock, ShieldAlert } from "lucide-react";
import { getPortalDestination, getMinhaClienteStatus } from "@/lib/data/portal";
import { PortalLogoutButton } from "@/components/shared/PortalLogoutButton";

export const metadata: Metadata = {
  title: "Cadastro em Análise | La Linda",
};

export default async function PortalAguardandoAprovacaoPage() {
  const destination = await getPortalDestination();
  if (destination !== "/portal/aguardando-aprovacao") redirect(destination);

  const status = await getMinhaClienteStatus();
  const isSuspenso = status === "suspenso";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8 text-center">
      <div className="w-full max-w-[480px]">
        <h1 className="text-4xl md:text-5xl font-serif italic text-foreground mb-8 leading-none">
          La Linda
        </h1>

        <div className="bg-card border border-border rounded-[2rem] p-10 shadow-sm">
          {isSuspenso ? (
            <ShieldAlert className="mx-auto mb-6 text-rose-500" size={40} />
          ) : (
            <Clock className="mx-auto mb-6 text-primary" size={40} />
          )}

          <h2 className="text-2xl font-serif italic text-foreground mb-3">
            {isSuspenso ? "Acesso Suspenso" : "Cadastro em Análise"}
          </h2>

          <p className="text-sm text-muted-foreground font-sans leading-relaxed">
            {isSuspenso
              ? "Seu acesso foi suspenso. Entre em contato com a nossa equipe para mais informações."
              : "Recebemos seu cadastro e ele está sendo analisado pela nossa equipe. Você recebe um aviso assim que for aprovado."}
          </p>
        </div>

        <div className="mt-8">
          <PortalLogoutButton />
        </div>
      </div>
    </div>
  );
}
