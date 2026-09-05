import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getPortalDestination } from "@/lib/data/portal";
import { CadastroForm } from "./CadastroForm";

export const metadata: Metadata = {
  title: "Acesso do Cliente | La Linda",
};

export default async function PortalCadastroPage() {
  const destination = await getPortalDestination();
  if (destination !== "/portal/cadastro") redirect(destination);

  return (
    <Suspense>
      <CadastroForm />
    </Suspense>
  );
}
