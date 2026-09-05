import type { LucideIcon } from "lucide-react";
import { PortalLogoutButton } from "@/components/shared/PortalLogoutButton";

interface MensagemCardProps {
  icon: LucideIcon;
  titulo: string;
  mensagem: string;
}

// Compartilhado entre catálogo/checkout — mesmo tratamento defensivo pra
// "cadastro aprovado mas faltando algo" (grupo de preço, região de
// entrega): mensagem clara, sem deixar a tela quebrar.
export function MensagemCard({ icon: Icon, titulo, mensagem }: MensagemCardProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8 text-center">
      <div className="w-full max-w-[480px]">
        <h1 className="text-4xl md:text-5xl font-serif italic text-foreground mb-8 leading-none">
          La Linda
        </h1>
        <div className="bg-card border border-border rounded-[2rem] p-10 shadow-sm">
          <Icon className="mx-auto mb-6 text-primary" size={40} />
          <h2 className="text-2xl font-serif italic text-foreground mb-3">{titulo}</h2>
          <p className="text-sm text-muted-foreground font-sans leading-relaxed">{mensagem}</p>
        </div>
        <div className="mt-8">
          <PortalLogoutButton />
        </div>
      </div>
    </div>
  );
}
