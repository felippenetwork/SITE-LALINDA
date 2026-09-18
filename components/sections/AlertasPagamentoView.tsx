"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { useIsAdmin } from "@/components/providers/AdminRoleProvider";
import { marcarBoletoPagoAction } from "@/lib/actions/financeiro";
import type { AlertasPagamento } from "@/lib/data/financeiro";

interface AlertasPagamentoViewProps {
  alertas: AlertasPagamento | undefined;
  isLoading: boolean;
  onMarcadoPago: () => void;
}

function formatarData(isoDate: string): string {
  const [ano, mes, dia] = isoDate.split("-").map(Number);
  return new Date(ano!, mes! - 1, dia!).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const AlertasPagamentoView = ({
  alertas,
  isLoading,
  onMarcadoPago,
}: AlertasPagamentoViewProps) => {
  const isAdmin = useIsAdmin();
  const [marcandoId, setMarcandoId] = useState<string | null>(null);

  const handleMarcarPago = async (pedidoId: string) => {
    setMarcandoId(pedidoId);
    try {
      const resultado = await marcarBoletoPagoAction(pedidoId);
      if (!resultado.success) {
        toast.error(resultado.error);
        return;
      }
      toast.success("Boleto marcado como pago.");
      onMarcadoPago();
    } catch {
      toast.error("Erro inesperado ao marcar como pago.");
    } finally {
      setMarcandoId(null);
    }
  };

  if (isLoading || !alertas) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 px-8 pt-6 pb-4">
          <AlertTriangle size={16} className="text-rose-600" />
          <h3 className="text-[10px] uppercase tracking-widest font-black text-foreground">
            Boleto Vencido — {alertas.boletosVencidos.length}
          </h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="pl-8 py-4 text-[10px] uppercase tracking-widest font-black">
                Cliente
              </TableHead>
              <TableHead className="py-4 text-[10px] uppercase tracking-widest font-black">
                Pedido
              </TableHead>
              <TableHead className="py-4 text-[10px] uppercase tracking-widest font-black">
                Prazo
              </TableHead>
              <TableHead className="py-4 text-[10px] uppercase tracking-widest font-black">
                Vencimento
              </TableHead>
              <TableHead className="py-4 text-[10px] uppercase tracking-widest font-black text-right">
                Valor
              </TableHead>
              {isAdmin && (
                <TableHead className="text-right pr-8 py-4 text-[10px] uppercase tracking-widest font-black">
                  Ação
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {alertas.boletosVencidos.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={isAdmin ? 6 : 5} className="py-10 px-6">
                  <div className="flex flex-col items-center justify-center text-center gap-2">
                    <CheckCircle2 className="text-emerald-500" size={24} />
                    <p className="text-sm text-muted-foreground">Nenhum boleto vencido.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              alertas.boletosVencidos.map((boleto) => (
                <TableRow
                  key={boleto.id}
                  className="border-border hover:bg-background/50 transition-colors"
                >
                  <TableCell className="pl-8 py-4">
                    <span className="font-sans font-semibold text-sm text-foreground">
                      {boleto.clienteNome}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-muted-foreground">
                      #{boleto.id.slice(0, 8)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground font-sans">
                      {boleto.prazoDiasEscolhido} dias
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-rose-50 border-rose-100 text-rose-600 text-[9px] uppercase tracking-widest font-black px-3"
                    >
                      Vencido em {formatarData(boleto.vencimento)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm font-sans font-semibold text-foreground">
                      {formatBRL(boleto.valorTotal)}
                    </span>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right pr-8">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={marcandoId === boleto.id}
                        onClick={() => handleMarcarPago(boleto.id)}
                        className="rounded-full text-[9px] font-black uppercase tracking-widest border-border h-8"
                      >
                        {marcandoId === boleto.id ? (
                          <Loader2 className="animate-spin" size={12} />
                        ) : (
                          "Marcar como Pago"
                        )}
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div>
        <div className="flex items-center gap-2 px-8 pt-2 pb-4">
          <Clock size={16} className="text-amber-600" />
          <h3 className="text-[10px] uppercase tracking-widest font-black text-foreground">
            PIX Gerado e Não Pago — {alertas.pixNaoPagos.length}
          </h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="pl-8 py-4 text-[10px] uppercase tracking-widest font-black">
                Cliente
              </TableHead>
              <TableHead className="py-4 text-[10px] uppercase tracking-widest font-black">
                Telefone
              </TableHead>
              <TableHead className="py-4 text-[10px] uppercase tracking-widest font-black">
                QR Expirou em
              </TableHead>
              <TableHead className="text-right pr-8 py-4 text-[10px] uppercase tracking-widest font-black">
                Valor
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alertas.pixNaoPagos.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="py-10 px-6">
                  <div className="flex flex-col items-center justify-center text-center gap-2">
                    <CheckCircle2 className="text-emerald-500" size={24} />
                    <p className="text-sm text-muted-foreground">Nenhum PIX abandonado.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              alertas.pixNaoPagos.map((pix) => (
                <TableRow
                  key={pix.id}
                  className="border-border hover:bg-background/50 transition-colors"
                >
                  <TableCell className="pl-8 py-4">
                    <span className="font-sans font-semibold text-sm text-foreground">
                      {pix.clienteNome}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground font-sans">
                      {pix.clienteTelefone}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-amber-50 border-amber-100 text-amber-700 text-[9px] uppercase tracking-widest font-black px-3"
                    >
                      {formatarDataHora(pix.pixExpiracao)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <span className="text-sm font-sans font-semibold text-foreground">
                      {formatBRL(pix.valorTotal)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
