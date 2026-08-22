# Plano de Otimização Responsiva e Auditoria de Design

Este plano visa garantir que a aplicação **La Linda Pães Especiais** seja 100% responsiva em todos os dispositivos, eliminando quebras de layout e melhorando a usabilidade mobile, mantendo a estética "boutique".

## Ações Imediatas

1.  **Auditoria Visual e Correção de Viewport**
    - Verificar todos os containers para garantir que não haja `width` fixo que cause overflow.
    - Ajustar o `HeroCarousel` para escalas mobile agressivas (altura e legibilidade do texto).
    - Garantir que as imagens usem `object-cover` e `max-width: 100%`.

2.  **Refinamento de Tipografia e Espaçamento**
    - Implementar escalas de fontes responsivas (usando classes `text-2xl md:text-5xl` etc.).
    - Ajustar `paddings` e `margins` para telas pequenas (evitar grandes espaços vazios no mobile).

3.  **Componentes e Navegação**
    - Validar o comportamento dos menus `Sheet` (Drawer) em todas as páginas.
    - Garantir que modais (Dialogs) no Admin ocupem a largura total em celulares.
    - Refinar a exibição de tabelas no Admin para rolagem horizontal suave ou formato de cards no mobile.

4.  **Formulários e Botões**
    - Garantir que botões de ação principal sejam `w-full` em telas pequenas para facilitar o toque.
    - Ajustar o layout do formulário de contato para empilhar campos em colunas simples no mobile.

## Detalhes Técnicos

- **Tailwind Breakpoints:** Uso rigoroso de `sm:`, `md:`, `lg:`, `xl:`.
- **Embla Carousel:** Garantir que o `dragFree` e `align: start` funcionem bem com toque.
- **Framer Motion:** Reduzir ou simplificar animações em dispositivos de baixo desempenho, se necessário.
- **Containers:** Substituir `max-w-6xl` por `container mx-auto px-4 sm:px-6 lg:px-8` para consistência.
