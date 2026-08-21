# Plano de Implementação: Redesign da Página Inicial (La Linda)

O objetivo é transformar a página inicial em uma experiência rica e dinâmica, inspirada na estrutura da Marquespan, mantendo a identidade visual "rosa e branco" da La Linda.

## Alterações Propostas

### 1. Novo Componente de Cabeçalho Dinâmico
- Implementar seletor de idiomas (PT/EN/ES) com bandeiras.
- Botão "Fale Conosco" em destaque.
- Navegação completa: Início, Produtos, A Lalinda, Receitas, Onde Estamos, Eventos.

### 2. Banner Principal com Carrossel
- Substituir o hero estático por um carrossel interativo (Swiper ou similar).
- Slides sugeridos:
  - Padeiro artesanal ("Para nós o pão é SAGRADO").
  - Frota própria/Logística.
  - Equipe de produção.

### 3. Faixa de Ícones das Linhas de Produto
- Adicionar carrossel de ícones logo abaixo do banner: Tradicionais, Linha Extra, Linha Premium, Confeitaria, Salgados e Pão de Queijo.
- Cada ícone linkará para a categoria específica na página de produtos.

### 4. Seção "Pão, Propósito e Paixão"
- Bloco institucional com texto de posicionamento.
- Carrossel de produtos em destaque (Pão de Queijo, Francês, etc.) com botões "Saiba Mais".

### 5. Seção de Números Animados
- Implementar contadores progressivos para colaboradores, frota e clientes.

### 6. História e Vídeo
- Seção com resumo histórico, botão para página completa e vídeo institucional incorporado.

### 7. Timeline Cronológica
- Carrossel com dots de navegação mostrando marcos da empresa.

### 8. Seções Complementares
- "Muita mão na massa": Detalhes sobre os fundadores.
- "O Sabor que Transforma": Chamada para a área de receitas.

### 9. Rodapé e Contato Unificado
- Replicar a seção "Vamos Conversar?" com formulário completo e canais de atendimento.

## Detalhes Técnicos
- **Bibliotecas:** Utilizar `embla-carousel-react` para os carrosséis (padrão em projetos modernos) ou framer-motion para animações.
- **Estilo:** Manter Tailwind v4 com a paleta `rose` e `white`.
- **Dados:** Expandir `src/lib/catalog-data.ts` se necessário para incluir marcos históricos ou dados institucionais.
- **Responsividade:** Garantir que os carrosséis e grades se adaptem a dispositivos móveis.
