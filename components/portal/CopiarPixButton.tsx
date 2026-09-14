"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

// Só o botão de copiar precisa ser client (navigator.clipboard não
// existe no servidor) — a imagem do QR Code é gerada inteira no
// servidor (page.tsx), sem nenhum JS de QR no bundle do client.
export function CopiarPixButton({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      toast.success("Código PIX copiado");
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error("Não foi possível copiar — selecione o código manualmente.");
    }
  };

  return (
    <Button
      type="button"
      onClick={handleCopiar}
      variant="outline"
      className="rounded-full border-border font-sans font-semibold text-xs gap-2 h-10"
    >
      {copiado ? <Check size={14} /> : <Copy size={14} />}
      {copiado ? "Copiado" : "Copiar Código"}
    </Button>
  );
}
