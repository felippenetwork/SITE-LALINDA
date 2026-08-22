# Plano de Melhoria Profunda de UI/UX

Este plano visa elevar o padrão visual e de experiência do usuário da aplicação **La Linda Pães Especiais**, focando em uma estética moderna, premium e intuitiva, mantendo a identidade "artesanal contemporânea".

## 1. Refinamento Visual (UI)

- **Tipografia:** Ajustar escalas e pesos para criar uma hierarquia editorial mais clara.
- **Cores:** Refinar o contraste das variáveis OKLCH para garantir acessibilidade e um visual mais "limpo".
- **Espaçamento:** Padronizar paddings e margins usando uma escala consistente (8px/16px/24px/32px/64px).
- **Sombras e Bordas:** Suavizar sombras (`shadow-stone-200/20`) e arredondar cantos de botões e cards para um toque mais sofisticado.

## 2. Experiência do Usuário (UX)

- **Navegação:** Melhorar o feedback visual no menu (sublinhados suaves ou mudanças de cor sutis).
- **Formulários:** Adicionar estados de foco mais claros e feedback em tempo real se possível.
- **Estados de Carregamento:** Criar skeletons ou loaders mais elegantes que combinem com a marca.
- **Microinterações:** Adicionar transições suaves de opacidade e escala em elementos interativos usando Framer Motion.

## 3. Implementação Técnica

- **src/styles.css:** Refinar variáveis de cores e adicionar utilitários de animação.
- **src/routes/index.tsx:** Otimizar a hero e as seções de destaque com composições assimétricas modernas.
- **src/routes/\_authenticated/admin.tsx:** Limpar o painel administrativo, reduzindo a densidade visual e focando no que é essencial.

## 4. Auditoria de Qualidade

- Garantir que a legibilidade seja perfeita em todos os tamanhos de tela.
- Verificar o contraste de cores (WCAG).
- Testar a fluidez das transições no mobile.
