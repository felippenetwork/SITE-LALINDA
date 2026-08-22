# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"La Linda" — an artisanal bakery marketing site with a product catalog, company timeline, lead-capture contact form, and an authenticated admin area (product/lead management). Built with [Lovable](https://lovable.dev): Lovable syncs commits pushed to the connected branch back into its editor, so keep the branch in a working state and avoid rewriting published history (force-push, rebase/amend/squash of pushed commits).

## Commands

Package manager: `npm` (README-documented path). A `bun.lock` also exists in the repo — if you use bun instead, keep only one lockfile in sync; don't let both drift.

```sh
npm i              # install deps
npm run dev         # vite dev server (starts on :8080, falls back to next free port if taken)
npm run build       # production build (via nitro, see vite.config.ts)
npm run build:dev   # development-mode build
npm run preview     # preview a production build
npm run lint        # eslint .
npm run format      # prettier --write .
```

There is no test suite/runner configured in this repo.

Required env vars (see `.env`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (client-side, Vite-injected) and `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (server-side, same values). Admin-only server functions additionally need `SUPABASE_SERVICE_ROLE_KEY`, which is not checked into `.env`.

## Architecture

**Stack**: TanStack Start (file-based SSR router on Vite) + React 19 + Supabase (Postgres/Auth) + Tailwind v4 + shadcn/ui (`new-york` style, see `components.json`).

### Vite config is mostly implicit

`vite.config.ts` wraps `@lovable.dev/vite-tanstack-config`, which already registers TanStack devtools, `tanstackStart`, `viteReact`, `tailwindcss`, `tsConfigPaths`, `nitro` (build target: cloudflare), `VITE_*` env injection, the `@` path alias, React/TanStack dedupe, error-logger plugins, and sandbox port/host detection. **Do not** re-add any of these manually — duplicate plugins break the app. Only pass extra config through `defineConfig({ vite: {...} })`.

### Routing (`src/routes/`)

File-based routing via TanStack Router — see `src/routes/README.md` for the full convention table (dynamic `$id`, optional `{-$cat}`, splat `$.tsx`, `_layout.tsx`, `__root.tsx`). Key points:

- `routeTree.gen.ts` is auto-generated — never hand-edit it.
- `src/routes/__root.tsx` is the only app shell (`<html>`/`<head>`/`<Scripts>`); it must keep `<Outlet />`.
- `src/routes/_authenticated/route.tsx` is a pathless layout route that gates everything under it: `beforeLoad` checks `supabase.auth.getSession()` and redirects to `/auth?redirect=<location>` if there's no session. `admin.tsx` lives under this layout.

### Server functions and Supabase auth (three-client model)

Business logic for data access lives in `*.functions.ts` files (e.g. `src/lib/catalog-data.functions.ts`) using `createServerFn`. `*.functions.ts` and route files ship to the client bundle, so never top-level import `client.server.ts` from them — dynamic-import it inside the handler instead (existing code does this consistently).

There are three Supabase clients, each with a distinct trust boundary:

- `src/integrations/supabase/client.ts` — browser client (anon key, persisted session, auto-refresh). Import as `import { supabase } from "@/integrations/supabase/client"`.
- `src/integrations/supabase/client.server.ts` — **admin** client (service role key, bypasses RLS). Server-only; dynamic-import inside handlers. Used for public reads (products, timeline) where RLS would otherwise require a policy just to expose already-public data.
- `src/integrations/supabase/auth-middleware.ts` (`requireSupabaseAuth`) — validates the caller's Bearer JWT server-side via `supabase.auth.getClaims()`, then hands the handler a _user-scoped_ Supabase client (RLS applies) plus `userId`/`claims` in context. Use this middleware, not the admin client, for any mutation gated by user identity.
- `src/integrations/supabase/auth-attacher.ts` (`attachSupabaseAuth`) — client-side middleware, registered globally in `src/start.ts`, that reads the local session and stamps the `Authorization: Bearer <token>` header onto every server-fn RPC. Without this being registered, `requireSupabaseAuth` never sees a token.

`client.ts`, `client.server.ts`, `auth-attacher.ts`, `auth-middleware.ts` are marked "automatically generated — do not edit directly" — they're Lovable/Supabase-managed scaffolding. Prefer adding new logic elsewhere unless you're intentionally changing this integration layer.

Admin-only server functions (`saveProduct`, `deleteProduct`, `getLeads` in `catalog-data.functions.ts`) don't just require auth — they also check `supabase.rpc('has_role', { _user_id: userId, _role: 'admin' })` inside the handler. Follow this pattern (auth middleware + explicit role RPC check) for any new privileged mutation; don't rely on RLS policies alone to gate admin actions from server functions running under the service-role/admin client.

### Error handling pipeline

Errors are deliberately caught at multiple layers because h3 (TanStack Start's server) swallows in-handler throws into a generic `{"unhandled":true,"message":"HTTPError"}` 500 with no stack:

- `src/lib/error-capture.ts` monkey-patches `console.error` and listens for global `error`/`unhandledrejection` to stash the last real error (5s TTL) out-of-band.
- `src/server.ts` wraps the SSR fetch handler; if the response looks like an h3-swallowed 500, it recovers the captured error, logs it, and renders `src/lib/error-page.ts`'s static error page instead of the opaque JSON body.
- `src/start.ts` adds a server `errorMiddleware` (catches thrown errors without a `statusCode`, logs, returns the same error page) and re-registers `createCsrfMiddleware` for server functions — TanStack Start only auto-installs CSRF protection when `src/start.ts` is _absent_, so defining this file requires explicitly re-adding it.
- `src/routes/__root.tsx`'s `errorComponent` reports client-side render errors via `reportLovableError` (`src/lib/lovable-error-reporting.ts`).

When touching any of these files, preserve the layering — each one covers a failure mode the others can't see.

### Data model (Supabase, `supabase/migrations/`)

Tables: `products` (enum `product_category`: Tradicionais / Linha Extra / Linha Premium / Confeitaria / Salgados), `timeline_events`, `leads`, `user_roles` (+ `app_role` enum, `has_role(user_id, role)` SECURITY DEFINER function used for admin checks), `audit_logs` (trigger-populated on product changes). RLS is enabled on every table; `products`/`timeline_events` allow public `SELECT`, `leads` allows public `INSERT` only (with CHECK constraints validating field lengths/format), everything privileged goes through `has_role`. Local Supabase CLI project id is in `supabase/config.toml`.

### Styling

Tailwind v4 (CSS-based config, no `tailwind.config.js`) with shadcn/ui `new-york` style; theme tokens live in `src/styles.css`. Path alias `@/*` → `src/*` (set in both `tsconfig.json` and via the Lovable Vite preset).
