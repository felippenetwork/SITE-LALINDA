"use client";

import { useQuery } from "@tanstack/react-query";
import { getFilaProducaoAction } from "@/lib/actions/pedido-admin";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FilaProducaoTable } from "@/components/sections/FilaProducaoTable";

export default function AdminPedidosPage() {
  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ["fila-producao"],
    queryFn: getFilaProducaoAction,
  });

  return (
    <>
      <div className="mb-12 lg:mb-16">
        <h2 className="text-3xl md:text-4xl font-serif italic text-foreground mb-2">
          Fila de Produção
        </h2>
        <p className="text-muted-foreground font-sans text-xs md:text-sm tracking-wide">
          Pedidos prontos para produzir — boleto sempre, PIX só depois do pagamento confirmado
        </p>
      </div>

      <Card className="rounded-[1.5rem] md:rounded-[2rem] border-border shadow-sm overflow-hidden">
        <CardHeader className="bg-background/50 border-b border-border p-6 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-muted-foreground">
            Pedidos — {pedidos.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <FilaProducaoTable pedidos={pedidos} isLoading={isLoading} />
        </CardContent>
      </Card>
    </>
  );
}
