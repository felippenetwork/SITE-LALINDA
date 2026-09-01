"use client";

import { Suspense, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { getLeadByIdAction } from "@/lib/actions/leads";
import { ClientesManager } from "@/components/sections/ClientesManager";

function AdminClientesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromLead = searchParams.get("fromLead");

  const { data: lead } = useQuery({
    queryKey: ["lead-prefill", fromLead],
    queryFn: () => getLeadByIdAction(fromLead!),
    enabled: !!fromLead,
  });

  const initialPrefillLead = useMemo(
    () =>
      lead ? { id: lead.id, name: lead.name, email: lead.email, phone: lead.phone ?? "" } : null,
    [lead],
  );

  const handlePrefillConsumed = useCallback(() => {
    router.replace("/admin/clientes");
  }, [router]);

  return (
    <>
      <div className="mb-12 lg:mb-16">
        <h2 className="text-3xl md:text-4xl font-serif italic text-foreground mb-2">Clientes</h2>
        <p className="text-muted-foreground font-sans text-xs md:text-sm tracking-wide">
          Cadastro e aprovação de clientes B2B
        </p>
      </div>

      <ClientesManager
        initialPrefillLead={initialPrefillLead}
        onPrefillConsumed={handlePrefillConsumed}
      />
    </>
  );
}

export default function AdminClientesPage() {
  return (
    <Suspense fallback={null}>
      <AdminClientesContent />
    </Suspense>
  );
}
