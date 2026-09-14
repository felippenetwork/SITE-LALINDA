// Mesmo truque de fuso fixo de lib/delivery/calcular-proxima-data-entrega.ts
// (América/São_Paulo, UTC-3, sem horário de verão desde 2019).
const SP_OFFSET_HORAS = 3;
const MS_POR_HORA = 60 * 60 * 1000;

function paraHorarioLocal(dataUtc: Date): Date {
  return new Date(dataUtc.getTime() - SP_OFFSET_HORAS * MS_POR_HORA);
}

function paraUtc(dataLocalFake: Date): Date {
  return new Date(dataLocalFake.getTime() + SP_OFFSET_HORAS * MS_POR_HORA);
}

function formatarDataLocal(dataLocalFake: Date): string {
  const ano = dataLocalFake.getUTCFullYear();
  const mes = String(dataLocalFake.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(dataLocalFake.getUTCDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

// Regra de negócio (decisão de 2026-09-14): a cobrança PIX expira na
// véspera da entrega, às 23:59:59 (horário de São Paulo) — dá ao
// cliente até a noite anterior pra pagar.
//
// Exceção: quando a entrega é HOJE mesmo (pedido feito antes do
// horario_corte da região — mesma regra de
// calcularProximaDataEntrega), "véspera" já passou no momento em que o
// pedido é criado. Nesse caso expira no horario_corte de HOJE — depois
// do corte o pedido já está operacionalmente decidido, não faz sentido
// o código continuar válido além desse ponto.
export function calcularExpiracaoPix(
  agoraUtc: Date,
  dataEntregaPrevista: string, // "YYYY-MM-DD"
  horarioCorte: string, // "HH:MM" ou "HH:MM:SS", horário local de SP
): Date {
  const agoraLocal = paraHorarioLocal(agoraUtc);
  const hojeLocalStr = formatarDataLocal(agoraLocal);
  const [horas, minutos, segundos] = horarioCorte.split(":").map(Number);

  if (dataEntregaPrevista === hojeLocalStr) {
    const expiracaoLocal = new Date(agoraLocal);
    expiracaoLocal.setUTCHours(horas ?? 0, minutos ?? 0, segundos ?? 0, 0);
    return paraUtc(expiracaoLocal);
  }

  const [ano, mes, dia] = dataEntregaPrevista.split("-").map(Number);
  const vesperaLocal = new Date(Date.UTC(ano!, mes! - 1, dia!));
  vesperaLocal.setUTCDate(vesperaLocal.getUTCDate() - 1);
  vesperaLocal.setUTCHours(23, 59, 59, 0);
  return paraUtc(vesperaLocal);
}
