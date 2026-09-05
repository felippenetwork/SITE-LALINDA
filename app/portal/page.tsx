import { redirect } from "next/navigation";
import { getPortalDestination } from "@/lib/data/portal";

// Puro dispatcher — mesmo papel de app/admin/page.tsx, mas o destino
// depende do estado do usuário (sem conta, sem cadastro completo,
// pendente, aprovado), não é fixo.
export default async function PortalIndexPage() {
  const destination = await getPortalDestination();
  redirect(destination);
}
