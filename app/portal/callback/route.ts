import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPortalDestination } from "@/lib/data/portal";

// Troca o code do OAuth por sessão. Se o provider ainda não estiver
// habilitado no Supabase (ou o usuário cancelar), o retorno vem sem
// `code` — redireciona pro cadastro com um aviso em vez de mostrar uma
// tela quebrada.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const destination = await getPortalDestination();
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/portal/cadastro?error=oauth`);
}
