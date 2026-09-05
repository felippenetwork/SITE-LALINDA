// América/São_Paulo, UTC-3 fixo (sem horário de verão desde 2019) — por
// isso um offset fixo resolve sem depender de date-fns-tz/IANA timezone
// database. Se o negócio um dia operar em outro fuso, isso precisa ser
// revisto.
const SP_OFFSET_HORAS = 3;
const MS_POR_HORA = 60 * 60 * 1000;

function paraHorarioLocal(dataUtc: Date): Date {
  return new Date(dataUtc.getTime() - SP_OFFSET_HORAS * MS_POR_HORA);
}

// getUTCDay(): 0=domingo..6=sábado -> ISO 1=segunda..7=domingo, mesma
// convenção de EXTRACT(isodow FROM ...) do Postgres usada em
// regioes_entrega.dias_semana_entrega (migration 021).
function diaIsoSemana(dataLocalFake: Date): number {
  const dow = dataLocalFake.getUTCDay();
  return dow === 0 ? 7 : dow;
}

function formatarDataLocal(dataLocalFake: Date): string {
  const ano = dataLocalFake.getUTCFullYear();
  const mes = String(dataLocalFake.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(dataLocalFake.getUTCDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

// Regra de negócio (skill regras-de-negocio, decisão de 2026-09-06): se
// HOJE já é dia de entrega da região e o pedido é feito antes do
// horario_corte, HOJE conta como data de entrega válida — não força
// pular pro próximo dia. Testada contra os 2 casos do enunciado da
// tarefa de schema antes de ser escrita aqui.
export function calcularProximaDataEntrega(
  agoraUtc: Date,
  diasSemanaEntrega: number[], // ISO: 1=segunda..7=domingo
  horarioCorte: string, // "HH:MM" ou "HH:MM:SS", horário local de SP
): string {
  if (diasSemanaEntrega.length === 0) {
    throw new Error("Região sem nenhum dia de entrega configurado");
  }

  const agoraLocal = paraHorarioLocal(agoraUtc);
  const [horas, minutos] = horarioCorte.split(":").map(Number);

  const corteHojeLocal = new Date(agoraLocal);
  corteHojeLocal.setUTCHours(horas ?? 0, minutos ?? 0, 0, 0);

  const passouCorte = agoraLocal.getTime() > corteHojeLocal.getTime();

  const candidato = new Date(agoraLocal);
  candidato.setUTCHours(0, 0, 0, 0);
  if (passouCorte) candidato.setUTCDate(candidato.getUTCDate() + 1);

  for (let i = 0; i < 8; i++) {
    if (diasSemanaEntrega.includes(diaIsoSemana(candidato))) {
      return formatarDataLocal(candidato);
    }
    candidato.setUTCDate(candidato.getUTCDate() + 1);
  }

  throw new Error("Região sem nenhum dia de entrega configurado");
}
