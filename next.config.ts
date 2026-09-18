import type { NextConfig } from "next";
import { assertRequiredEnv } from "./lib/env";

assertRequiredEnv();

// Sprint 6 bloco 2 — auditoria de segurança pré-loja. Domínios levantados
// direto do código (grep em todo o projeto, não suposição):
// - Fontes: next/font/google (Instrument_Serif, Work_Sans) baixa e serve
//   same-origin no build — nenhum domínio externo de fonte necessário.
// - script-src/frame-src: googletagmanager.com (GTM) e connect.facebook.net
//   (Meta Pixel) — os dois só disparam se configurados em /admin/config
//   (gtm_id/meta_pixel_id), mas o header é estático, então o espaço já
//   precisa existir. O bootstrap de cada um (app/layout.tsx) é um <Script>
//   com JS inline, não um arquivo — exige 'unsafe-inline' em script-src
//   (nonce evitaria isso, mas é middleware+layout junto, decisão de
//   arquitetura nova, fora de escopo aqui).
// - style-src 'unsafe-inline': React usa style={{...}} (atributo inline)
//   em vários lugares, incluindo o fallback do GTM/Pixel no próprio layout.
// - img-src data:: QR code do PIX (PixCountdown.tsx) e do WhatsApp
//   (ConectarWhatsAppForm.tsx) são data:image/png;base64 gerados no
//   servidor. img-src facebook.com: pixel do <noscript> em layout.tsx.
// - connect-src: login/logout/cadastro/troca de senha chamam
//   supabase.auth.* DIRETO do navegador (LoginForm.tsx x2, CadastroForm,
//   ChangePasswordForm, PortalLogoutButton, AdminSidebar) — sem a URL do
//   Supabase aqui, login quebra silenciosamente.
// - Imagens via next/image (Unsplash, Storage do Supabase) NÃO entram no
//   img-src: a busca é server-side (proxy /_next/image), o navegador só
//   vê same-origin. Confirmado: nenhum unoptimized, nenhum <img> cru
//   apontando pra esses domínios.
// - img-src transparenttextures.com: achado só no teste ao vivo, não no
//   grep original (é um background-image via classe arbitrária do
//   Tailwind — bg-[url('https://...')] em StatsSection.tsx —, não uma
//   tag <img>/<iframe>, por isso passou batido na varredura por regex de
//   tag JSX). Lição: CSS url() externo não aparece em grep de tag HTML.
//
// GTM ainda não está configurado (gtm_id vazio) — decisão do dono do
// projeto, 2026-09-17: seguir com o CSP abaixo mesmo assim. QUANDO o GTM
// for configurado de verdade, é preciso revisar este CSP e adicionar os
// domínios das tags específicas usadas DENTRO do container (GA4 —
// google-analytics.com/analytics.google.com —, Hotjar, etc.) — isso não
// dá pra saber só pelo código deste repositório, só olhando o próprio
// painel do GTM. Sem essa revisão, qualquer tag que fale com um domínio
// não listado aqui é bloqueada silenciosamente pelo navegador.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://www.facebook.com https://www.transparenttextures.com",
  "font-src 'self'",
  "connect-src 'self' https://cipgacwzhmtxcylqjszp.supabase.co",
  "frame-src https://www.googletagmanager.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cipgacwzhmtxcylqjszp.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Default is 1MB; product/line photo uploads go up to 5MB.
      bodySizeLimit: "6mb",
    },
  },
  async headers() {
    // HSTS não entra aqui de propósito — a Vercel já aplica automaticamente
    // em domínio .vercel.app e em domínio custom (confirmado na doc oficial
    // deles), duplicar o header aqui só arriscaria conflitar com o padrão.
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
