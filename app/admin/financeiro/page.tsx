"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  PeriodoFilter,
  periodoUltimos30Dias,
  type Periodo,
} from "@/components/forms/PeriodoFilter";
import { AlertasPagamentoView } from "@/components/sections/AlertasPagamentoView";
import { VendasPorClienteTable } from "@/components/sections/VendasPorClienteTable";
import { VendasPorProdutoTable } from "@/components/sections/VendasPorProdutoTable";
import { VendasPorPeriodoTable } from "@/components/sections/VendasPorPeriodoTable";
import {
  getAlertasPagamentoAction,
  getVendasPorClienteAction,
  getVendasPorProdutoAction,
  getVendasPorPeriodoAction,
} from "@/lib/actions/financeiro";

export default function AdminFinanceiroPage() {
  const queryClient = useQueryClient();
  const [periodo, setPeriodo] = useState<Periodo>(periodoUltimos30Dias());

  const { data: alertas, isLoading: isLoadingAlertas } = useQuery({
    queryKey: ["financeiro-alertas-pagamento"],
    queryFn: getAlertasPagamentoAction,
  });

  const { data: vendasPorCliente = [], isLoading: isLoadingCliente } = useQuery({
    queryKey: ["financeiro-vendas-cliente", periodo],
    queryFn: () => getVendasPorClienteAction(periodo),
  });

  const { data: vendasPorProduto = [], isLoading: isLoadingProduto } = useQuery({
    queryKey: ["financeiro-vendas-produto", periodo],
    queryFn: () => getVendasPorProdutoAction(periodo),
  });

  const { data: vendasPorPeriodo, isLoading: isLoadingPeriodo } = useQuery({
    queryKey: ["financeiro-vendas-periodo", periodo],
    queryFn: () => getVendasPorPeriodoAction(periodo),
  });

  return (
    <>
      <div className="mb-12 lg:mb-16">
        <h2 className="text-3xl md:text-4xl font-serif italic text-foreground mb-2">Financeiro</h2>
        <p className="text-muted-foreground font-sans text-xs md:text-sm tracking-wide">
          Contas a receber e relatórios de venda
        </p>
      </div>

      <Tabs defaultValue="alertas">
        <TabsList className="mb-8 rounded-full h-auto p-1.5 bg-card border border-border">
          <TabsTrigger
            value="alertas"
            className="rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest px-4 py-2.5"
          >
            Alertas de Pagamento
          </TabsTrigger>
          <TabsTrigger
            value="cliente"
            className="rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest px-4 py-2.5"
          >
            Vendas por Cliente
          </TabsTrigger>
          <TabsTrigger
            value="produto"
            className="rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest px-4 py-2.5"
          >
            Vendas por Produto
          </TabsTrigger>
          <TabsTrigger
            value="periodo"
            className="rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest px-4 py-2.5"
          >
            Vendas por Período
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alertas">
          <Card className="rounded-[1.5rem] md:rounded-[2rem] border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-background/50 border-b border-border p-6 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-muted-foreground">
                Dinheiro que deveria ter entrado e não entrou
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <AlertasPagamentoView
                alertas={alertas}
                isLoading={isLoadingAlertas}
                onMarcadoPago={() =>
                  queryClient.invalidateQueries({ queryKey: ["financeiro-alertas-pagamento"] })
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cliente">
          <PeriodoFilter periodo={periodo} onChange={setPeriodo} />
          <Card className="rounded-[1.5rem] md:rounded-[2rem] border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-background/50 border-b border-border p-6 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-muted-foreground">
                Venda por Cliente — {vendasPorCliente.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <VendasPorClienteTable vendas={vendasPorCliente} isLoading={isLoadingCliente} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="produto">
          <PeriodoFilter periodo={periodo} onChange={setPeriodo} />
          <Card className="rounded-[1.5rem] md:rounded-[2rem] border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-background/50 border-b border-border p-6 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-muted-foreground">
                Venda por Produto — {vendasPorProduto.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <VendasPorProdutoTable vendas={vendasPorProduto} isLoading={isLoadingProduto} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="periodo">
          <PeriodoFilter periodo={periodo} onChange={setPeriodo} />
          <Card className="rounded-[1.5rem] md:rounded-[2rem] border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-background/50 border-b border-border p-6 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-muted-foreground">
                Venda por Período
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <VendasPorPeriodoTable dados={vendasPorPeriodo} isLoading={isLoadingPeriodo} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
