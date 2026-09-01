"use client";

import { useQuery } from "@tanstack/react-query";
import { getLeadsAction } from "@/lib/actions/leads";
import { getConvertedLeadIdsAction } from "@/lib/actions/clientes";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LeadsTable } from "@/components/sections/LeadsTable";

export default function AdminLeadsPage() {
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: getLeadsAction,
  });

  const { data: convertedLeadIds = [] } = useQuery({
    queryKey: ["converted-lead-ids"],
    queryFn: getConvertedLeadIdsAction,
  });

  return (
    <>
      <div className="mb-12 lg:mb-16">
        <h2 className="text-3xl md:text-4xl font-serif italic text-foreground mb-2">
          Leads e Contatos
        </h2>
        <p className="text-muted-foreground font-sans text-xs md:text-sm tracking-wide">
          Novas oportunidades de negócio
        </p>
      </div>

      <Card className="rounded-[1.5rem] md:rounded-[2rem] border-border shadow-sm overflow-hidden">
        <CardHeader className="bg-background/50 border-b border-border p-6 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-muted-foreground">
            Oportunidades — {leads.length} Leads
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <LeadsTable
            leads={leads}
            isLoading={isLoading}
            convertedLeadIds={new Set(convertedLeadIds)}
          />
        </CardContent>
      </Card>
    </>
  );
}
