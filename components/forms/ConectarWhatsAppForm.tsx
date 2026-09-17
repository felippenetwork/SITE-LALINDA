"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Wifi, WifiOff, LogOut, Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  conectarWhatsAppAction,
  statusWhatsAppAction,
  desconectarWhatsAppAction,
} from "@/lib/actions/integracao-whatsapp";
import type { IntegracaoWhatsApp } from "@/lib/data/integracao-whatsapp";

interface ConectarWhatsAppFormProps {
  initial: IntegracaoWhatsApp;
}

type Status = "disconnected" | "connecting" | "qr_ready" | "connected";

const STATUS_LABEL: Record<Status, string> = {
  disconnected: "Desconectado",
  connecting: "Conectando…",
  qr_ready: "Aguardando leitura do QR",
  connected: "Conectado",
};

// Tela de conexão single-instance (só o número da La Linda, sem
// multi-tenant) — mesmo fluxo comprovado em produção noutro projeto do
// dono (createInstance -> connectInstance -> polling de status),
// simplificado pra uma instância só.
//
// O QR nunca é guardado em estado que sobrevive além da renderização
// atual: cada resposta do servidor substitui `qr` por completo (nunca
// mescla com o valor anterior), e a uazapi já para de devolver QR assim
// que o status vira "connected" — então não tem como esta tela reexibir
// um QR de uma conexão já feita, mesmo em caso de bug de estado local.
export function ConectarWhatsAppForm({ initial }: ConectarWhatsAppFormProps) {
  const [status, setStatus] = useState<Status>(initial.conectado ? "connected" : "disconnected");
  const [qr, setQr] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(initial.telefoneConectado);
  const [loading, setLoading] = useState(false);
  const pollingRef = useRef(false);

  const aplicarResultado = (r: { status: string; qr: string | null; phone: string | null }) => {
    setStatus((r.status as Status) ?? "disconnected");
    setQr(r.qr);
    setPhone(r.phone);
  };

  useEffect(() => {
    if (status !== "qr_ready" && status !== "connecting") return;
    if (pollingRef.current) return;
    pollingRef.current = true;

    const interval = setInterval(async () => {
      try {
        const resultado = await statusWhatsAppAction();
        if (resultado.success) {
          aplicarResultado(resultado);
          if (resultado.status === "connected") toast.success("WhatsApp conectado!");
        }
      } catch {
        // rede instável durante o polling — próxima checagem tenta de novo
      }
    }, 4000);

    return () => {
      clearInterval(interval);
      pollingRef.current = false;
    };
  }, [status]);

  const handleConectar = async () => {
    setLoading(true);
    try {
      const resultado = await conectarWhatsAppAction();
      if (!resultado.success) {
        toast.error(resultado.error);
        return;
      }
      aplicarResultado(resultado);
    } catch {
      toast.error("Erro inesperado ao conectar o WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  const handleDesconectar = async () => {
    setLoading(true);
    try {
      const resultado = await desconectarWhatsAppAction();
      if (!resultado.success) {
        toast.error(resultado.error);
        return;
      }
      setStatus("disconnected");
      setQr(null);
      setPhone(null);
      toast.success("WhatsApp desconectado.");
    } catch {
      toast.error("Erro inesperado ao desconectar o WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${status === "connected" ? "bg-emerald-500" : status === "qr_ready" ? "bg-sky-500" : status === "connecting" ? "bg-amber-500" : "bg-stone-400"}`}
        />
        <span className="text-xs font-sans font-semibold text-foreground">
          {STATUS_LABEL[status]}
        </span>
      </div>

      {status === "qr_ready" && qr && (
        <div className="flex flex-col items-center gap-3 py-2">
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Abra o WhatsApp no celular do número da La Linda → Menu → Aparelhos conectados →
            Conectar aparelho, e escaneie o código abaixo.
          </p>
          <div className="border border-border rounded-xl p-2 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element -- QR vem pronto (base64) direto da uazapi, next/image não se aplica */}
            <img src={qr} alt="QR Code para conectar o WhatsApp" width={220} height={220} />
          </div>
        </div>
      )}

      {status === "connecting" && (
        <div className="flex flex-col items-center gap-2 py-6">
          <Loader2 className="animate-spin text-muted-foreground" size={28} />
          <p className="text-xs text-muted-foreground">Iniciando sessão…</p>
        </div>
      )}

      {status === "connected" && phone && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
          <Smartphone className="text-emerald-600 shrink-0" size={18} />
          <div>
            <p className="text-[10px] text-muted-foreground">Número conectado</p>
            <p className="text-sm font-sans font-semibold text-emerald-700">+{phone}</p>
          </div>
        </div>
      )}

      <div>
        {status === "connected" ? (
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={handleDesconectar}
            className="rounded-full px-8 py-6 font-black text-[10px] uppercase tracking-widest border-border h-auto gap-2 text-rose-600 hover:text-rose-600"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <LogOut size={16} />}
            Desconectar
          </Button>
        ) : (
          <Button
            type="button"
            disabled={loading || status === "connecting"}
            onClick={handleConectar}
            className="bg-primary text-white rounded-full px-8 py-6 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 h-auto gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : status === "qr_ready" ? (
              <Wifi size={16} />
            ) : (
              <WifiOff size={16} />
            )}
            {status === "qr_ready" ? "Gerar novo QR" : "Conectar"}
          </Button>
        )}
      </div>
    </div>
  );
}
