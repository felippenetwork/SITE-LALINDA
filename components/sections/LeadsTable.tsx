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
import { Clock, Loader2 } from "lucide-react";
import type { Lead } from "@/lib/data/leads";

interface LeadsTableProps {
  leads: Lead[];
  isLoading: boolean;
}

export const LeadsTable = ({ leads, isLoading }: LeadsTableProps) => {
  if (isLoading) {
    return (
      <div className="p-20 flex items-center justify-center">
        <Loader2 className="animate-spin text-stone-200" size={32} />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-stone-100 hover:bg-transparent">
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
          <TableRow>
            <TableCell colSpan={5} className="text-center py-20 text-stone-400 font-sans italic">
              Nenhum lead recebido ainda.
            </TableCell>
          </TableRow>
        ) : (
          leads.map((lead) => (
            <TableRow
              key={lead.id}
              className="border-stone-50 hover:bg-stone-50/50 transition-colors"
            >
              <TableCell className="pl-8 py-6">
                <div className="flex items-center gap-2 text-stone-400">
                  <Clock size={12} />
                  <span className="text-[10px] font-sans font-black uppercase tracking-widest">
                    {lead.created_at ? new Date(lead.created_at).toLocaleDateString("pt-BR") : "—"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-sans font-semibold text-sm text-stone-900">
                    {lead.name}
                  </span>
                  <span className="text-xs text-stone-400 font-sans">{lead.email}</span>
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
              <TableCell className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-stone-500 text-sm font-sans italic">
                &ldquo;{lead.message}&rdquo;
              </TableCell>
              <TableCell className="text-right pr-8">
                <Badge className="bg-stone-900 text-white text-[9px] uppercase tracking-widest font-black px-3 rounded-full">
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
