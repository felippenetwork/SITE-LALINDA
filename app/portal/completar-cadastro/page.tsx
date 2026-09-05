import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPortalDestination } from "@/lib/data/portal";
import { CompletarCadastroForm } from "./CompletarCadastroForm";

export const metadata: Metadata = {
  title: "Completar Cadastro | La Linda",
};

export default async function PortalCompletarCadastroPage() {
  const destination = await getPortalDestination();
  if (destination !== "/portal/completar-cadastro") redirect(destination);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8 py-12">
      <div className="w-full max-w-[600px]">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-serif italic text-foreground mb-4 leading-none">
            La Linda
          </h1>
          <span className="text-[10px] font-sans font-black uppercase tracking-[0.4em] text-primary block">
            Complete seu Cadastro
          </span>
        </div>
        <CompletarCadastroForm />
      </div>
    </div>
  );
}
