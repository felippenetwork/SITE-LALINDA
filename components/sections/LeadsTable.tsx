"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, Loader2, MessageSquare } from "lucide-react";
import type { Lead } from "@/lib/data/leads";

interface LeadsTableProps {
  leads: Lead[];
  isLoading: boolean;
}

export const LeadsTable = ({ leads, isLoading }: LeadsTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="pl-8 py-6 text-[10px] uppercase tracking-widest font-black">
            Data
          </TableHead>
          <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black">
            Cliente
          </TableHead>
          <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black">
            Interesse
          </TableHead>
          <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black">
            Mensagem
          </TableHead>
          <TableHead className="text-right pr-8 py-6 text-[10px] uppercase tracking-widest font-black">
            Status
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={5} className="py-16 px-6">
              <div className="flex flex-col items-center justify-center text-center">
                <MessageSquare className="text-stone-300 mb-4" size={32} />
                <p className="text-sm text-muted-foreground">Nenhum lead recebido ainda.</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          leads.map((lead) => (
            <TableRow
              key={lead.id}
              className="border-border hover:bg-background/50 transition-colors"
            >
              <TableCell className="pl-8 py-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={12} />
                  <span className="text-[10px] font-sans font-black uppercase tracking-widest">
                    {lead.created_at ? new Date(lead.created_at).toLocaleDateString("pt-BR") : "—"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-sans font-semibold text-sm text-foreground">
                    {lead.name}
                  </span>
                  <span className="text-xs text-muted-foreground font-sans">{lead.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="bg-primary/5 border-primary/10 text-primary text-[9px] uppercase tracking-widest font-black px-3"
                >
                  {lead.interest || "Geral"}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground text-sm font-sans italic">
                &ldquo;{lead.message}&rdquo;
              </TableCell>
              <TableCell className="text-right pr-8">
                <Badge className="bg-foreground text-white text-[9px] uppercase tracking-widest font-black px-3 rounded-full">
                  Novo
                </Badge>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
