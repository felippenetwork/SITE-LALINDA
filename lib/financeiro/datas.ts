// Mesmo truque de fuso já usado em lib/delivery/calcular-proxima-data-entrega.ts
// (América/São_Paulo, UTC-3 fixo, sem horário de verão desde 2019):
// converte pra um "UTC fake" deslocado, faz aritmética de data com
// getUTCX/setUTCX, converte de volta. Reaproveitado aqui porque
// vencimento de boleto e os buckets de "vendas por período" também
// precisam pensar em dia-calendário de São Paulo, não UTC cru.
const SP_OFFSET_HORAS = 3;
const MS_POR_HORA = 60 * 60 * 1000;

function paraHorarioLocal(dataUtc: Date): Date {
  return new Date(dataUtc.getTime() - SP_OFFSET_HORAS * MS_POR_HORA);
}

function formatarDataLocal(dataLocalFake: Date): string {
  const ano = dataLocalFake.getUTCFullYear();
  const mes = String(dataLocalFake.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(dataLocalFake.getUTCDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

// created_at (timestamptz) -> data-calendário SP, formato YYYY-MM-DD.
export function dataLocalSP(dataUtcIso: string): string {
  return formatarDataLocal(paraHorarioLocal(new Date(dataUtcIso)));
}

export function hojeSP(): string {
  return formatarDataLocal(paraHorarioLocal(new Date()));
}

// Data do pedido (calendário SP) + N dias corridos — sem lógica de
// horário de corte, é aritmética pura de dia-calendário.
export function calcularVencimento(createdAtIso: string, prazoDias: number): string {
  const [ano, mes, dia] = dataLocalSP(createdAtIso).split("-").map(Number);
  const vencimento = new Date(Date.UTC(ano!, mes! - 1, dia! + prazoDias));
  return formatarDataLocal(vencimento);
}

// Converte um par de datas-calendário (inputs de filtro, YYYY-MM-DD) pro
// intervalo UTC correspondente ao dia inteiro em São Paulo — usado nos
// filtros gte/lte contra created_at.
export function periodoParaUtc(inicio: string, fim: string): { inicioUtc: string; fimUtc: string } {
  return {
    inicioUtc: new Date(`${inicio}T00:00:00-03:00`).toISOString(),
    fimUtc: new Date(`${fim}T23:59:59.999-03:00`).toISOString(),
  };
}

export function diferencaDias(inicio: string, fim: string): number {
  const [ai, mi, di] = inicio.split("-").map(Number);
  const [af, mf, df] = fim.split("-").map(Number);
  const msPorDia = 24 * MS_POR_HORA;
  return Math.round((Date.UTC(af!, mf! - 1, df!) - Date.UTC(ai!, mi! - 1, di!)) / msPorDia);
}

export type Granularidade = "diario" | "semanal" | "mensal";

// Threshold aprovado: ≤31 dias diário, 32–180 semanal, >180 mensal.
export function granularidadeParaPeriodo(inicio: string, fim: string): Granularidade {
  const dias = diferencaDias(inicio, fim);
  if (dias <= 31) return "diario";
  if (dias <= 180) return "semanal";
  return "mensal";
}

// Chave de agrupamento pro bucket de "vendas por período", já em
// calendário SP. Semanal agrupa pela segunda-feira daquela semana
// (convenção ISO, mesma numeração 1=segunda usada em regioes_entrega).
export function chaveBucket(createdAtIso: string, granularidade: Granularidade): string {
  const dataStr = dataLocalSP(createdAtIso);
  if (granularidade === "diario") return dataStr;

  const [ano, mes, dia] = dataStr.split("-").map(Number);
  if (granularidade === "mensal") return `${ano}-${String(mes).padStart(2, "0")}`;

  const data = new Date(Date.UTC(ano!, mes! - 1, dia!));
  const isoDow = data.getUTCDay() === 0 ? 7 : data.getUTCDay();
  data.setUTCDate(data.getUTCDate() - (isoDow - 1));
  return formatarDataLocal(data);
}
