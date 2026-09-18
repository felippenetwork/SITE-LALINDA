"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface Periodo {
  inicio: string;
  fim: string;
}

interface PeriodoFilterProps {
  periodo: Periodo;
  onChange: (periodo: Periodo) => void;
}

function formatarYYYYMMDD(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

// Atalhos calculados no fuso do navegador — só uma conveniência de UX
// (chute inicial pro filtro); a interpretação de verdade do range como
// dia-calendário de São Paulo acontece no servidor
// (lib/financeiro/datas.ts periodoParaUtc), não aqui.
function ultimosDias(n: number): Periodo {
  const fim = new Date();
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - (n - 1));
  return { inicio: formatarYYYYMMDD(inicio), fim: formatarYYYYMMDD(fim) };
}

function esteMes(): Periodo {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  return { inicio: formatarYYYYMMDD(inicio), fim: formatarYYYYMMDD(hoje) };
}

function mesPassado(): Periodo {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
  const fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
  return { inicio: formatarYYYYMMDD(inicio), fim: formatarYYYYMMDD(fim) };
}

const ATALHOS: { label: string; calcular: () => Periodo }[] = [
  { label: "Últimos 7 dias", calcular: () => ultimosDias(7) },
  { label: "Últimos 30 dias", calcular: () => ultimosDias(30) },
  { label: "Este mês", calcular: esteMes },
  { label: "Mês passado", calcular: mesPassado },
];

export function periodoUltimos30Dias(): Periodo {
  return ultimosDias(30);
}

export function PeriodoFilter({ periodo, onChange }: PeriodoFilterProps) {
  return (
    <div className="flex flex-wrap items-end gap-4 mb-6">
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
          De
        </Label>
        <Input
          type="date"
          value={periodo.inicio}
          max={periodo.fim}
          onChange={(e) => onChange({ ...periodo, inicio: e.target.value })}
          className="rounded-xl border-border bg-background h-11"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
          Até
        </Label>
        <Input
          type="date"
          value={periodo.fim}
          min={periodo.inicio}
          onChange={(e) => onChange({ ...periodo, fim: e.target.value })}
          className="rounded-xl border-border bg-background h-11"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {ATALHOS.map((atalho) => (
          <Button
            key={atalho.label}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange(atalho.calcular())}
            className="rounded-full text-[10px] font-black uppercase tracking-widest border-border h-9"
          >
            {atalho.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
