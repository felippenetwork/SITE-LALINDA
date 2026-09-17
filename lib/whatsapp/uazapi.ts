import "server-only";

// Mesma UAZAPI usada em outro projeto do dono (confirmado contra o código
// real de lá, 2026-09-16) — endpoint/payload abaixo não são suposição.
const UAZAPI_URL = process.env["UAZAPI_URL"] || "https://supercloudstore.uazapi.com";

const PLACEHOLDER_ADMIN_TOKEN = "CONFIGURE-UAZAPI_ADMIN_TOKEN-ANTES-DE-USAR";

// Só usado pra criar a instância a primeira vez (POST /instance/create) —
// nenhuma outra chamada deste arquivo precisa dele, todas usam o token
// da própria instância (guardado cifrado em integracao_whatsapp).
function getAdminToken(): string | null {
  const token = process.env["UAZAPI_ADMIN_TOKEN"];
  if (!token || token === PLACEHOLDER_ADMIN_TOKEN) return null;
  return token;
}

export interface InstanceInfo {
  status: "connected" | "qr_ready" | "connecting" | "disconnected";
  qr: string | null;
  phone: string | null;
}

export interface CreatedInstance {
  id: string;
  token: string;
}

export async function createInstance(name: string): Promise<CreatedInstance> {
  const adminToken = getAdminToken();
  if (!adminToken) {
    throw new Error("UAZAPI_ADMIN_TOKEN não configurado (ou ainda no valor de exemplo).");
  }

  const res = await fetch(`${UAZAPI_URL}/instance/create`, {
    method: "POST",
    headers: { AdminToken: adminToken, "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Erro ao criar instância uazapi (HTTP ${res.status}): ${body.slice(0, 120)}`);
  }
  const data = (await res.json()) as { instance: { id: string; token: string } };
  return { id: data.instance.id, token: data.instance.token };
}

export async function deleteInstance(instanceToken: string): Promise<void> {
  const res = await fetch(`${UAZAPI_URL}/instance`, {
    method: "DELETE",
    headers: { token: instanceToken },
  });
  if (!res.ok) {
    console.error(`[uazapi] deleteInstance falhou (HTTP ${res.status})`);
  }
}

// Dispara a conexão e devolve o QR/status atual. Seguro chamar de novo —
// só atualiza o QR se já estiver conectando.
export async function connectInstance(instanceToken: string): Promise<InstanceInfo> {
  try {
    const res = await fetch(`${UAZAPI_URL}/instance/connect`, {
      method: "POST",
      headers: { token: instanceToken },
    });
    if (!res.ok) {
      console.error(`[uazapi] connectInstance falhou (HTTP ${res.status})`);
      return { status: "disconnected", qr: null, phone: null };
    }
    const data = (await res.json()) as {
      connected: boolean;
      instance: { status: string; qrcode: string; owner: string };
    };
    const inst = data.instance;
    if (data.connected) {
      const phone = inst.owner
        ? inst.owner.replace("@s.whatsapp.net", "").replace(/\D/g, "")
        : null;
      return { status: "connected", qr: null, phone };
    }
    if (inst.qrcode) return { status: "qr_ready", qr: inst.qrcode, phone: null };
    return { status: "connecting", qr: null, phone: null };
  } catch (err) {
    console.error("[uazapi] connectInstance erro de rede:", err);
    return { status: "disconnected", qr: null, phone: null };
  }
}

interface UazapiInstanceListItem {
  token: string;
  status: string;
  qrcode: string;
  owner: string;
}

// GET /instance/all (AdminToken) — checagem "leve" de status, não dispara
// nova tentativa de conexão. Usado pro polling da tela.
export async function getInstanceStatus(instanceToken: string): Promise<InstanceInfo> {
  const adminToken = getAdminToken();
  if (!adminToken) return { status: "disconnected", qr: null, phone: null };

  try {
    const res = await fetch(`${UAZAPI_URL}/instance/all`, { headers: { AdminToken: adminToken } });
    if (!res.ok) {
      console.error(`[uazapi] getInstanceStatus falhou (HTTP ${res.status})`);
      return { status: "disconnected", qr: null, phone: null };
    }
    const list = (await res.json()) as UazapiInstanceListItem[];
    const inst = list.find((i) => i.token === instanceToken);
    if (!inst) return { status: "disconnected", qr: null, phone: null };

    if (inst.status === "connected") {
      const phone = inst.owner
        ? inst.owner.replace("@s.whatsapp.net", "").replace(/\D/g, "")
        : null;
      return { status: "connected", qr: null, phone };
    }
    if (inst.qrcode) return { status: "qr_ready", qr: inst.qrcode, phone: null };
    return { status: "connecting", qr: null, phone: null };
  } catch (err) {
    console.error("[uazapi] getInstanceStatus erro de rede:", err);
    return { status: "disconnected", qr: null, phone: null };
  }
}

// Só dígitos, com DDI 55 — mesma função confirmada em produção no outro
// projeto (formatPhoneNumber, src/lib/uazapi.ts).
export function formatPhoneNumber(number: string): string {
  let formatted = number.replace(/\D/g, "");
  if (!formatted.startsWith("55") && formatted.length <= 11) {
    formatted = "55" + formatted;
  }
  return formatted;
}

// POST /send/text — endpoint/payload confirmados em produção no outro
// projeto (não é suposição). instanceToken vem sempre de quem chama
// (lib/whatsapp/send-pedido-confirmado.ts, que decifra do banco).
export async function sendText(instanceToken: string, number: string, text: string): Promise<void> {
  const res = await fetch(`${UAZAPI_URL}/send/text`, {
    method: "POST",
    headers: { token: instanceToken, "Content-Type": "application/json" },
    body: JSON.stringify({ number: formatPhoneNumber(number), text }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || "Erro ao enviar mensagem");
  }
}
