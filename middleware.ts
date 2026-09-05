import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const SUPABASE_URL = process.env["NEXT_PUBLIC_SUPABASE_URL"];
  const SUPABASE_PUBLISHABLE_KEY = process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      "Missing Supabase environment variable(s): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() revalidates against the auth server — getSession() alone must
  // never gate access here, it can return a stale/forged cookie unchecked.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/admin")) {
    const redirectUrl = new URL("/auth", request.url);
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // /portal/cadastro (o formulário de criar conta/entrar) e
  // /portal/callback (troca o code do OAuth por sessão, roda antes de
  // qualquer sessão existir) precisam continuar acessíveis sem login —
  // todo o resto de /portal exige sessão.
  const isPortalPublicRoute =
    request.nextUrl.pathname.startsWith("/portal/cadastro") ||
    request.nextUrl.pathname.startsWith("/portal/callback");
  if (!user && request.nextUrl.pathname.startsWith("/portal") && !isPortalPublicRoute) {
    const redirectUrl = new URL("/portal/cadastro", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, images, fonts (static assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
