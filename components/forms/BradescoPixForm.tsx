"use client";

import { useState, type FormEvent } from "react";
import { FileCheck2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { IntegracaoBradescoPix } from "@/lib/data/integracao-bradesco";

interface BradescoPixFormProps {
  settings: IntegracaoBradescoPix;
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Sem react-hook-form de propósito, ao contrário dos outros formulários
// de /admin/config: o certificado é um File que precisa viajar na MESMA
// submissão dos outros campos (pra Server Action gravar tudo numa
// chamada só, sem risco de arquivo subido e metadado não-salvo ficarem
// dessincronizados) — FormData nativo encaixa melhor aqui do que o fluxo
// JSON que zodResolver assume.
export function BradescoPixForm({ settings, onSubmit, isPending }: BradescoPixFormProps) {
  const [ativa, setAtiva] = useState(settings.ativa);
  const [clientId, setClientId] = useState(settings.clientId ?? "");
  const [clientSecret, setClientSecret] = useState("");
  const [certificadoSenha, setCertificadoSenha] = useState("");
  const [certificadoFile, setCertificadoFile] = useState<File | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set("ativa", String(ativa));
    formData.set("clientId", clientId);
    formData.set("clientSecret", clientSecret);
    formData.set("certificadoSenha", certificadoSenha);
    if (certificadoFile) formData.set("certificado", certificadoFile);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
        <div>
          <span className="text-sm font-sans font-semibold text-foreground block">
            Integração ativa
          </span>
          <span className="text-[10px] text-muted-foreground">
            Desligue para pausar o PIX sem apagar as credenciais salvas
          </span>
        </div>
        <Switch checked={ativa} onCheckedChange={setAtiva} />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="clientId"
            className="text-xs uppercase tracking-widest font-bold text-muted-foreground"
          >
            Client ID
          </Label>
          <Input
            id="clientId"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="rounded-xl border-border bg-background h-12"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="clientSecret"
            className="text-xs uppercase tracking-widest font-bold text-muted-foreground"
          >
            Client Secret
          </Label>
          <Input
            id="clientSecret"
            type="password"
            autoComplete="new-password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder={
              settings.clientSecretUltimos4
                ? `Atual: ••••${settings.clientSecretUltimos4} — deixe em branco para manter`
                : "Nenhum salvo ainda"
            }
            className="rounded-xl border-border bg-background h-12"
          />
        </div>
      </div>

      <div className="border-t border-border pt-6 grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
            Certificado (.pfx)
          </Label>
          <label
            htmlFor="certificado"
            className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-background h-12 px-4 cursor-pointer hover:border-primary transition-colors"
          >
            <FileCheck2 size={16} className="text-muted-foreground shrink-0" />
            <span className="text-sm font-sans text-muted-foreground truncate">
              {certificadoFile?.name ?? "Escolher arquivo .pfx"}
            </span>
          </label>
          <input
            id="certificado"
            type="file"
            accept=".pfx,.p12"
            className="hidden"
            onChange={(e) => setCertificadoFile(e.target.files?.[0] ?? null)}
          />
          {settings.temCertificado && !certificadoFile && (
            <p className="text-[10px] text-muted-foreground">
              Atual: {settings.certificadoNomeArquivo}
              {settings.certificadoEnviadoEm &&
                ` — enviado em ${formatarData(settings.certificadoEnviadoEm)}`}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="certificadoSenha"
            className="text-xs uppercase tracking-widest font-bold text-muted-foreground"
          >
            Senha do Certificado
          </Label>
          <Input
            id="certificadoSenha"
            type="password"
            autoComplete="new-password"
            value={certificadoSenha}
            onChange={(e) => setCertificadoSenha(e.target.value)}
            placeholder={
              settings.certificadoSenhaUltimos4
                ? `Atual: ••••${settings.certificadoSenhaUltimos4} — deixe em branco para manter`
                : "Nenhuma salva ainda"
            }
            className="rounded-xl border-border bg-background h-12"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-primary text-white rounded-full px-8 py-6 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 h-auto"
        >
          {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
          Salvar Credenciais
        </Button>
      </div>
    </form>
  );
}
