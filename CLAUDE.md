# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"La Linda" — an artisanal bakery marketing site with a product catalog organized into admin-manageable lines, a company timeline, a lead-capture contact form, and an authenticated admin area (products, lines, leads).

## Commands

Package manager: `npm`.

```sh
npm i              # install deps
npm run dev         # next dev, http://localhost:3000 (falls back to next free port if taken)
npm run build       # production build
npm run start       # serve a production build
npm run lint        # eslint .
npm run format      # prettier --write .
```

There is no test suite/runner configured in this repo.

Required env vars (see `.env`, gitignored): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (client-side) and `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (server-side, same project). Admin-gated server code additionally needs `SUPABASE_SERVICE_ROLE_KEY`. These must also be set in the Vercel project (Production, and Preview if preview deployments are used) — they are not pulled from `.env` in that environment.

## Architecture

**Stack**: Next.js 16 (App Router, Turbopack) + React 19 + Supabase (Postgres/Auth/Storage) + Tailwind v4 + shadcn/ui (`new-york` style, see `components.json`).

### Routing (`app/`)

Standard App Router file conventions. Notable routes:

- `/produtos` — overview of product lines (`ProductLinesShowcase`), not a flat catalog.
- `/produtos/linha/[slug]` — one line's page: header + grid of its products. 404s if the line doesn't exist or is paused (`available = false`).
- `/produtos/[productId]` — single product detail.
- `/admin/*` — gated by `middleware.ts` (redirects to `/auth` if unauthenticated) and re-checked in `app/admin/layout.tsx` (Supabase's own guidance: don't rely on middleware alone). Contains `produtos`, `linhas`, `leads` sections, each a client component using TanStack Query for the list + a dialog form for create/edit.
- `app/error.tsx` / `app/global-error.tsx` / `app/not-found.tsx` — standard Next.js error boundaries; no custom error pipeline beyond these.

### Server actions and the three-Supabase-client model

Data access lives in `lib/data/*.ts` (reads) and `lib/actions/*.ts` (`"use server"` mutations). There are three Supabase clients, each with a distinct trust boundary:

- `lib/supabase/client.ts` — browser client (anon/publishable key). Call `createClient()` inside Client Components; never at module scope.
- `lib/supabase/server.ts` — user-scoped client for Server Components/Actions (RLS applies via the caller's session, read from cookies). `await createClient()`, fresh per request.
- `lib/supabase/admin.ts` — service-role client (`supabaseAdmin`, bypasses RLS). Server-only (`import "server-only"`). Used for reads that are meant to be public anyway (products, lines, timeline) where RLS would otherwise need a policy just to expose already-public data.

Every admin-gated action/read (`lib/actions/products.ts`, `product-lines.ts`, `upload-image.ts`, `lib/data/leads.ts`) follows the same inline pattern rather than trusting RLS alone: get the user-scoped client, `auth.getUser()`, then `supabase.rpc("has_role", { _user_id, _role: "admin" })` — throw if either fails. Follow this pattern for any new privileged mutation. `has_role()` is `SECURITY DEFINER`; its `EXECUTE` grant to `authenticated` is load-bearing (see migration 009) — without it every one of these checks fails closed with a misleading "Forbidden" even for real admins.

Mutations call `revalidatePath(...)` afterward; line/product writes use `revalidatePath("/produtos", "layout")` so both the overview and every `/produtos/linha/[slug]` page invalidate together.

### Data model (Supabase, `supabase/migrations/`, applied in order 001–010)

- `product_lines` — admin-manageable categories (name, slug, description, image_url, sort_order, available). Replaces what used to be a fixed enum; `products.category_id` is a FK into it. Public pages filter `.available`; a paused line 404s on its detail page but stays visible/editable in `/admin/linhas`.
- `products` — `category_id` FK, `weight`, `box_weight`, `image_url`, `description`, `available`.
- `timeline_events`, `leads`, `user_roles` (+ `app_role` enum, `has_role()`), `audit_logs` (trigger-populated on product changes).
- Storage bucket `product-images` (migration 008): public read, admin-only insert/update/delete (same `has_role` check as table policies), 5MB limit, mime-type allowlist enforced both at the bucket level and server-side by magic-byte sniffing (`lib/upload/detect-image-type.ts` — never trust the client's declared `File.type`).

RLS is enabled on every table, covering all four operations where relevant; public `SELECT` is open on `products`/`product_lines`/`timeline_events`, `leads` allows public `INSERT` only, everything else requires `has_role`. Local Supabase CLI project id is in `supabase/config.toml`. Migrations are applied to the remote project directly via the Supabase CLI (`supabase db push`) — this is a separate step from deploying the app; the DB change should land before the app code that depends on it.

### Image uploads

`components/shared/ImageUploadField.tsx` + `lib/actions/upload-image.ts`: a plain `<input type="file" accept="image/*">` (no `capture` attribute, so it works as a native file picker on desktop and a camera-or-gallery picker on mobile) uploads through a server action that re-derives the real file type from content bytes, enforces the 5MB limit server-side, and writes to Storage under a `crypto.randomUUID()`-generated path — the original filename is never used.

### TypeScript strictness gotchas

`tsconfig.json` enables `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, and `noPropertyAccessFromIndexSignature` on top of `strict`. Two things this forces throughout the codebase:

- `process.env.SOME_VAR` doesn't type-check — use `process.env["SOME_VAR"]`.
- A Zod schema with `.default()` (e.g. `productSchema`'s `available`) makes the resolver's _input_ type (pre-default) diverge from `z.infer` (the _output_ type) once `exactOptionalPropertyTypes` is on. `useForm` needs both: `useForm<SchemaInput, unknown, SchemaOutput>(...)` where `SchemaInput = z.input<typeof schema>` and `SchemaOutput = z.infer<typeof schema>` — see `ProductForm.tsx` / `ProductLineForm.tsx` for the pattern.

### Styling

Tailwind v4 (CSS-based config in `app/globals.css`, no `tailwind.config.js`) with shadcn/ui `new-york` style. Theme tokens are defined as CSS custom properties in `:root` (and a currently-unused `.dark` block) and mapped into Tailwind's `@theme inline`. `--primary` is the brand terracotta; `--primary-light` is a separate, more vivid/legible tint for text sitting on dark photo backgrounds (hero captions, section eyebrows on `bg-stone-900`) — `--primary` alone doesn't clear WCAG contrast there. Path alias `@/*` → repo root (see `tsconfig.json` and `components.json`).

### Deployment

Vercel project `felippe-network00/site-lalinda`, auto-deploying from GitHub pushes to `master`. `next.config.ts` allowlists `images.unsplash.com` (placeholder content) and the Supabase Storage host for `next/image`, and raises the Server Actions body size limit to `6mb` for uploads.
