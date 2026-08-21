# Auditoria e Melhoria Técnica do Projeto La Linda

Este plano detalha uma auditoria técnica completa e correções para transformar o projeto La Linda em uma aplicação profissional, estável e pronta para produção.

## 1. Auditoria e Correções de Frontend

- **Ajustes de Design e Layout:**
  - Garantir que todos os componentes Shadcn UI estejam usando as variáveis semânticas do Tailwind v4 (`--color-primary`, `--color-background`, etc.) para manter a consistência estética "Artisan Bakery".
  - Corrigir possíveis inconsistências de espaçamento e tipografia entre as rotas `/`, `/produtos`, `/a-lalinda` e `/admin`.
  - Revisar a responsividade mobile em todas as seções (especialmente carrosséis e grids complexos).

- **Otimização de Carrosséis e Animações:**
  - Adicionar autoplay e pausar no hover nos carrosséis `embla`.
  - Otimizar animações do `framer-motion` para evitar re-renderizações desnecessárias e garantir 60fps.
  - Ajustar o `Counter` para usar `requestAnimationFrame` ou uma lógica de tempo mais precisa.

## 2. Auditoria de Estado e Dados

- **Centralização de Dados:**
  - Garantir que `INITIAL_CATALOG` seja a única fonte de verdade para produtos.
  - Implementar um mecanismo básico de persistência (simulado ou via Lovable Cloud) para as alterações feitas no `/admin`.

- **Tratamento de Erros e Estados de Carregamento:**
  - Adicionar skeletons de carregamento para rotas dinâmicas.
  - Melhorar o `ErrorComponent` e `NotFoundComponent` no `__root.tsx`.
  - Garantir que falhas em imagens externas (Unsplash) sejam tratadas com fallbacks elegantes.

## 3. Segurança e Infraestrutura (Lovable Cloud)

- **Ativação do Backend:**
  - Ativar Lovable Cloud para substituir o estado local por um banco de dados persistente.
  - Criar tabelas para `produtos`, `eventos_timeline` e `leads_contato`.
  - Implementar Row Level Security (RLS) básico.

- **Autenticação (Admin):**
  - Proteger a rota `/admin` com autenticação.
  - Criar fluxo de login profissional.

## 4. SEO e Performance

- **Metadados:**
  - Refinar `head()` em cada rota com títulos únicos, descrições ricas e tags OpenGraph/Twitter.
  - Adicionar JSON-LD para produtos e organização.

- **Performance:**
  - Implementar lazy loading para imagens fora da viewport.
  - Otimizar pacotes e imports.

## Detalhes Técnicos
- Framework: TanStack Start v1 (React 19).
- Styling: Tailwind CSS v4 (Design Tokens semânticos).
- Backend: Lovable Cloud (PostgreSQL + Auth).
- Animações: Framer Motion + Embla Carousel.
