"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { CopiarPixButton } from "@/components/portal/CopiarPixButton";

interface PixCountdownProps {
  qrCodeDataUrl: string;
  texto: string;
  expiracaoIso: string;
}

function formatarRestante(ms: number): string {
  const totalSegundos = Math.max(0, Math.floor(ms / 1000));
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;
  return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
}

// Cronômetro puramente visual: só recalcula "quanto falta" a partir do
// pix_expiracao já gravado pelo servidor (nunca decide expiração de
// verdade a partir do relógio do cliente — isso nunca é checado pelo
// webhook de confirmação). Ao chegar a zero, troca sozinho pro aviso de
// expirado, sem precisar recarregar a página — sem cancelamento
// automático nenhum, só a troca visual.
export function PixCountdown({ qrCodeDataUrl, texto, expiracaoIso }: PixCountdownProps) {
  const expiracaoMs = new Date(expiracaoIso).getTime();
  const [restanteMs, setRestanteMs] = useState(() => expiracaoMs - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setRestanteMs(expiracaoMs - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [expiracaoMs]);

  if (restanteMs <= 0) {
    return (
      <div className="flex flex-col items-center gap-2 text-rose-600">
        <Clock size={28} />
        <p className="text-sm font-sans font-semibold">Este código PIX expirou</p>
        <p className="text-xs text-muted-foreground">
          Entre em contato com nosso time para gerar um novo código.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-xs uppercase tracking-widest font-black text-muted-foreground mb-4">
        Pague com PIX
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element -- data: URL gerada no servidor, next/image não se aplica */}
      <img
        src={qrCodeDataUrl}
        alt="QR Code para pagamento PIX"
        width={240}
        height={240}
        className="mx-auto rounded-xl border border-border"
      />
      <p className="text-[10px] text-muted-foreground mt-4 mb-1">
        Escaneie com o app do seu banco ou copie o código abaixo
      </p>
      <p className="text-xs font-sans font-semibold text-foreground mb-3">
        Expira em <span className="font-mono">{formatarRestante(restanteMs)}</span>
      </p>
      <CopiarPixButton texto={texto} />
    </>
  );
}
