"use client";

import { useQuery } from "@tanstack/react-query";
import { getLeadsAction } from "@/lib/actions/leads";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LeadsTable } from "@/components/sections/LeadsTable";

export default function AdminLeadsPage() {
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: getLeadsAction,
  });

  return (
    <>
      <div className="mb-12 lg:mb-16">
        <h2 className="text-3xl md:text-4xl font-serif italic text-stone-900 mb-2">
          Leads e Contatos
        </h2>
        <p className="text-stone-400 font-sans text-xs md:text-sm tracking-wide">
          Novas oportunidades de negócio
        </p>
      </div>

      <Card className="rounded-[1.5rem] md:rounded-[2rem] border-stone-100 shadow-sm overflow-hidden">
        <CardHeader className="bg-stone-50/50 border-b border-stone-100 p-6 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-stone-500">
            Oportunidades — {leads.length} Leads
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <LeadsTable leads={leads} isLoading={isLoading} />
        </CardContent>
      </Card>
    </>
  );
}
