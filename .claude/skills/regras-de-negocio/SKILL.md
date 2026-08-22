---
name: regras-de-negocio
description: Especialista de domínio sênior (20+ anos como analista de negócios) — fonte única da verdade das regras de negócio do projeto, com autoridade para recusar implementar regra ambígua ou inventada, protocolo de entrevista e gestão de mudança de regra (retroativa ou não). Use SEMPRE que criar ou alterar qualquer lógica de negócio: cálculos, estados de entidades, prazos, limites, planos, papéis de aprovação ou comunicação a clientes. REGRA CRÍTICA: nunca inventar regra de negócio — regra não documentada aqui exige perguntar ao dono do projeto antes de implementar.
---

# Regras de Negócio — fonte da verdade do projeto

Atue como especialista de domínio com 20+ anos: você sabe que os bugs mais caros não são de código — são de **regra inventada**: o juros que o dev "achou razoável", o prazo que "fazia sentido", a mensagem enviada para quem já pagou. Este arquivo elimina essa classe de bug: **código implementa regra documentada aqui; regra não documentada → perguntar, nunca assumir.**

**Autoridade sobre ambiguidade, não implementação por suposição.** Pedido que implica uma regra de negócio não documentada aqui — mesmo que pareça óbvio, mesmo sob pressão de prazo — é motivo de parar e perguntar, nunca de inferir o que "parece razoável". Regra inventada que passa despercebida vira comportamento de produção; corrigi-la depois custa reembolso, mensagem errada para cliente ou disputa jurídica. O custo de perguntar é sempre menor que o custo de errar uma regra em produção.

Em conflito entre código existente e este documento: o documento vence — corrigir o código, ou atualizar o documento conscientemente com aprovação do dono (registrando a decisão como MUDANÇA DE REGRA, ver seção própria abaixo — nunca como exceção silenciosa).

## Calibragem ao projeto (primeira ativação — entrevista obrigatória)

Este arquivo nasce como template. Na primeira ativação em um projeto, ANTES de implementar qualquer lógica de negócio:

1. Ler o código e documentos existentes e rascunhar o que já dá para inferir das seções abaixo — marcando cada inferência como **[INFERIDO DO CÓDIGO — validar]**.
2. Priorizar a entrevista pelas áreas onde erro custa mais caro (dinheiro > comunicação a cliente > estado de entidade > o resto) — mesmo critério de priorização da skill `engenharia-de-software`.
3. Entrevistar o dono do projeto com perguntas objetivas e opções com trade-off explícito, agrupadas por seção (nunca uma pergunta solta por vez) — ex.: "arredondamento: (a) sempre para cima, custo menor imprevisibilidade pro cliente; (b) half-up padrão contábil; (c) sempre para baixo, favorece o cliente. Qual usamos?" — nunca "como você quer o arredondamento?" em aberto.
4. Preencher as seções, marcar o que ficou pendente como **[A DEFINIR]**, e registrar as decisões com data.

## Protocolo ao encontrar [A DEFINIR] ou [INFERIDO] (obrigatório, sem exceção)

Esbarrar numa marcação dessas durante qualquer tarefa segue esta sequência, sempre, sem pular etapa:

1. **PARAR.** Não implementar com o valor "mais comum do mercado", o que "parece razoável" ou o que um projeto parecido costuma usar — isso é regra inventada com roupa de senso comum, exatamente o que esta skill existe para impedir.
2. **Apresentar o impacto, não só a pergunta:** dizer qual regra falta, o que exatamente esta tarefa não pode fazer sem ela, e o que quebra se a resposta errada for assumida (ex.: "sem o teto de desconto definido, não dá pra saber se 50% é válido ou fraude — se eu assumir 'sem teto', um cupom mal configurado pode zerar o preço"). Oferecer 2–3 opções com trade-off concreto quando for possível antecipá-las.
3. **Aguardar resposta explícita do dono do projeto.** Silêncio, "pode seguir" genérico ou inferência do comportamento de uma tela não contam como resposta à pergunta específica feita.
4. **Registrar a decisão** no "Registro de decisões" com data, atualizar a seção correspondente removendo a marcação `[A DEFINIR]`/`[INFERIDO — validar]`, e só então implementar.
5. **Dono indisponível e a tarefa não pode esperar:** implementar apenas a parte que NÃO depende da regra pendente (se existir um recorte seguro); a parte que depende fica de fora, declarada como pendência explícita no fechamento da tarefa — nunca escolher um valor "temporário só por enquanto", porque valor temporário sem dono vira regra de produção por inércia.

## 1. Entidades centrais e estados

Para cada entidade central do domínio (pedido, cobrança, agendamento, assinatura...):

- Máquina de estados explícita: estados, transições permitidas, quem/o quê dispara cada uma.
- Estados finais não voltam — correção de estado final é fluxo próprio auditado (estorno, reabertura), nunca edição direta.
- Transições automáticas por tempo (vencimento, expiração) rodam em UM lugar (job), nunca calculadas de formas diferentes em cada tela.

```
[PREENCHER por entidade:]
Entidade: ...
Estados: ...
Transições: ...
```

## 2. Dinheiro e cálculos

Regras universais (valem em qualquer projeto com dinheiro):

- Valores na MENOR unidade inteira (centavos) — nunca float.
- Arredondamento definido explicitamente (padrão: half-up, só no resultado final; intermediários exatos).
- Todo cálculo que aparece em mais de um lugar (tela, mensagem, relatório) vive em UMA função central.
- Regra de dinheiro implementada ganha teste na mesma tarefa (skill `testes-automatizados`).

```
[PREENCHER:]
Fórmulas do projeto (juros, multa, desconto, comissão, frete...): [A DEFINIR]
Percentuais/valores padrão e tetos (inclusive legais): [A DEFINIR]
Moeda(s) e formatação: [A DEFINIR]
```

## 3. Tempo, prazos e agendamento

- Armazenamento em UTC; TODA lógica de prazo/agenda declara o timezone do negócio explicitamente.
- Dia inexistente no mês (31 → fevereiro): regra explícita (padrão: último dia do mês).

```
[PREENCHER:]
Timezone do negócio: [A DEFINIR]
Janelas de operação (horários de envio/atendimento/processamento): [A DEFINIR]
Fins de semana e feriados (processa, pula, adia?): [A DEFINIR]
Prazos e SLAs relevantes: [A DEFINIR]
```

## 4. Comunicação com clientes finais

- Nenhum evento dispara comunicação sem regra documentada (quem recebe, quando, por qual canal, com que conteúdo).
- Evento que cancela comunicações futuras (pagamento, cancelamento) faz isso NA MESMA transação — comunicar quem não deveria é o erro que mais queima reputação.
- Opt-out é permanente e absoluto.

```
[PREENCHER:]
Eventos que comunicam e réguas: [A DEFINIR]
Canais e limites (anti-spam/anti-ban): [A DEFINIR]
```

## 5. Planos, limites e monetização (se aplicável)

- Limite atingido bloqueia a AÇÃO nova com mensagem clara e caminho de upgrade; nunca degrada silenciosamente o que existe.
- Falha de pagamento → carência definida → suspensão que preserva acesso de leitura/exportação.

```
[PREENCHER:]
Tabela planos × preços × limites: [A DEFINIR]
Trial, upgrade, downgrade (imediato ou virada de ciclo?): [A DEFINIR]
```

## 6. Papéis e alçadas de aprovação (se aplicável)

Distinto de permissão técnica (RBAC, ver `seguranca-de-aplicacoes`) — aqui é QUEM, no negócio, tem autoridade para aprovar ou executar uma ação sensível, e até que limite. Código que executa uma ação sem checar a alçada de negócio é a mesma classe de bug que role inventado.

```
[PREENCHER (se existir alçada por valor/tipo de ação):]
Ação sensível: aprovação/reembolso/cancelamento/desconto manual...
Quem pode: [A DEFINIR]
Limite/teto por alçada: [A DEFINIR]
O que exige dupla aprovação: [A DEFINIR]
```

## 7. Regulação e compliance setorial (se aplicável)

Regra imposta por lei ou órgão regulador do SETOR (além da LGPD/GDPR genérica, que é `seguranca-de-aplicacoes`) — ex.: teto de juros do Banco Central, retenção de prontuário na saúde, regra de jogo/aposta, prazo de arrependimento do CDC. Se o projeto não tem regulação setorial específica, marcar como "não aplicável" explicitamente (evita perguntar de novo a cada tarefa).

```
[PREENCHER:]
Regulador/lei aplicável: [A DEFINIR ou "não aplicável"]
Regra imposta e fonte (link/artigo): [A DEFINIR]
```

## 8. Casos de borda decididos

Registrar aqui cada decisão de borda conforme surgir (pagamento parcial? duplicidade? item excluído com dependências? ação retroativa?). Borda sem decisão = [A DEFINIR] = perguntar.

### Cadastro de cliente — endereço obrigatório

- **Campos obrigatórios (bloqueiam salvar):** endereço, número, bairro. **Cidade e Estado NÃO bloqueiam** — são preenchidos automaticamente via busca de CEP (ViaCEP, `src/lib/cep.ts`) no blur do campo CEP, em ambos os formulários (`pedidos/novo` e dialog "Editar cadastro"); os campos continuam editáveis manualmente se a busca falhar ou o CEP não vier. CEP em si fica opcional (nem todo cliente informa). _(Atualizado em 2026-07-23: regra original pedia Estado e depois Cidade obrigatórios também; o dono do projeto pediu para trocar ambos por preenchimento automático via CEP.)_
- **Onde a regra vale:** em qualquer caminho que grava/atualiza cadastro de cliente — criação automática via import de romaneio PDF (`/api/pedidos/save`) e edição manual (dialog "Editar cadastro" em `clientes/[id]`, via `PATCH /api/clientes/[id]`). Em ambos os casos o salvamento é BLOQUEADO (não silenciosamente ignorado) se algum desses campos estiver vazio.
- **Sincronização a cada pedido:** todo pedido importado (cliente novo ou já existente) carrega o endereço extraído do romaneio ("espelho"). Esse endereço sempre atualiza o cadastro do cliente na tabela `clientes` — não só quando o cliente é novo. Isso já era o comportamento em `/api/pedidos/save` para clientes existentes (atualiza se o campo veio preenchido); a mudança é exigir que venha completo.
- **Custo de IA:** endereço já faz parte do MESMO retorno da extração Claude do romaneio (`extract-romaneio.ts`) — validar/sincronizar contra o cadastro não dispara nenhuma chamada de IA adicional. Zero custo extra de IA.
- **Clientes antigos sem endereço completo:** não há migração/backfill retroativo. Ficam incompletos (badge "Sem endereço" já existe na tela do cliente) até o próximo pedido daquele cliente ser importado — nesse momento a regra acima força a completude.
- **Sem constraint NOT NULL no banco:** a obrigatoriedade é só na camada de aplicação (API), porque já existem linhas antigas com endereço nulo/incompleto — um NOT NULL quebraria esses registros e qualquer insert fora dos caminhos validados.

### Montagem de Carga (Expedição) — bairro de entrega obrigatório

- **Campo novo e separado do endereço do cliente:** `bairro_entrega` em `expedicao_carga_clientes` (migration 085) — só para organizar/agrupar a carga por região de entrega. NÃO substitui nem deriva do endereço cadastrado do cliente (`endereco`/`numero_endereco`/`bairro`/`cidade`/`estado`/`cep`, que continuam vindo do cadastro e aparecem no texto do endereço e no romaneio impresso) — decisão explícita para não corromper o endereço de clientes fora do município do Rio (Niterói, São Gonçalo etc.) com um bairro do Rio que não é o dele.
- **Obrigatório (bloqueia enviar a carga):** todo item com cliente selecionado precisa ter um bairro de entrega preenchido, mesmo padrão de bloqueio já usado no Valor R$. Nullable no banco (cargas antigas não têm esse dado).
- **Campo de texto livre com sugestões, não um `<select>` fechado** (`AutocompleteBairro` em `expedicao/page.tsx`, lista em `src/lib/bairros-rio.ts`): digitar filtra sugestões da lista curada (Centro/Zona Sul/Zona Norte/Zona Oeste do Rio + Niterói + São Gonçalo + Itaguaí + Maricá/Itaipuaçu), mas o operador pode digitar qualquer bairro que não esteja na lista — decisão do dono do projeto em 2026-07-24 (lista original era um `<select>` fechado; trocada por pedido explícito pra sempre permitir bairro fora da lista).
- **Autopreenchimento ao escolher o cliente:** se o bairro cadastrado do cliente casar (ignorando maiúsculas/acentos) com uma opção da lista, o campo já vem preenchido (`encontrarOpcaoBairroEntrega`); continua editável e, sem match, fica vazio exigindo digitação manual — não é o mesmo mecanismo do CEP (aqui é o bairro já salvo no cadastro, sem chamada externa).

### Ocorrências de Entrega — anexos e visualização completa

- **Ver ocorrência completa:** card da lista trunca a descrição (`line-clamp-3`); botão de olho (`Eye`) abre modal com o texto integral, sem limite, mais os anexos. Disponível pra qualquer um que veja o card (não depende de `pode_editar`/`pode_excluir`).
- **Anexos (foto/vídeo):** opcional, sem regra de obrigatoriedade — botão "Foto ou vídeo (câmera ou galeria)" no formulário de Nova/Editar Ocorrência, acima de Responsável. Guardado em `ocorrencias_entrega.anexos_urls` (migration 090), mesmo bucket `comprovantes` da Expedição, path `ocorrencias/<id>/...`. Como o id só existe depois do insert, gera um `crypto.randomUUID()` antes de salvar (`pendingId`) e usa esse mesmo id no insert — permite subir o anexo antes de confirmar o salvamento da ocorrência.

### Cadastro de cliente — fonte do nome: 2 campos separados (Nome/Destino + Razão Social)

_(Regra de 2026-07-27 revertida em 2026-07-31 — ver "Mudança de regra" abaixo. Esta é a versão vigente.)_

- **Dois campos, os dois no mesmo cadastro:**
  - `razao_social` — campo PRINCIPAL, volta a ser extraído do rótulo **"Destino:"** do romaneio (fallback: "Razão Social Cliente:" se o documento não tiver "Destino:" explícito). É o nome/apelido pelo qual o time reconhece e busca o cliente no dia a dia — usado como título do cadastro em toda a UI (card, cabeçalho do perfil, listas).
  - `razao_social_fiscal` — campo NOVO (migration 114), opcional, extraído do rótulo **"Razão Social Cliente:"** sempre que esse campo existir no documento (mesmo quando igual ao Destino). É o nome oficial/fiscal, guardado só como referência e chave de busca adicional — não substitui `razao_social` em nenhuma tela.
- **Motivo da reversão:** usar só a razão social oficial como campo principal (regra de 27/07) quebrou a busca de cliente pro time — quem procura pelo nome de Destino/apelido (o que reconhece no dia a dia) não achava o cadastro na busca (`razao_social_normalizado` só indexava o nome oficial) e acabava recadastrando o mesmo cliente à mão, gerando duplicata. Isso não é o mesmo mecanismo do `pedidos/save/route.ts` (que já era só por CNPJ/CPF e não mudou) — é duplicação manual por falha de busca.
- **Busca encontra por qualquer um dos 2 nomes:** toda tela com autocomplete/busca de cliente por nome (`clientes` (lista principal), Admin Comercial → Carteira, Ocorrências, Expedição (Montagem de Carga), Eventos, Dia Hambúrguer, Auditoria de Pedidos, busca de `pedidos`, `findOrCreateCliente` do Confronto de Faturamento) consulta as 2 colunas normalizadas (`razao_social_normalizado` e `razao_social_fiscal_normalizado`) e junta o resultado — helper único `buscarClientesPorNome` (`src/lib/supabase/buscar-clientes.ts`) usado nos autocompletes; `clientes/page.tsx` e a Carteira (client-side) comparam os 2 campos direto.
- **Confronto de Faturamento (`findOrCreateCliente`):** o nome que vem da NF/planilha Solidcon é o nome fiscal — casa primeiro por `razao_social_fiscal` (exato e normalizado), com fallback pra `razao_social`: sem essa mudança, reverter o campo principal pra Destino faria o Confronto deixar de achar os clientes existentes e criar duplicata NELE também.
- **Sem backfill retroativo:** clientes já cadastrados desde 27/07 com `razao_social` = nome fiscal (porque foram criados/corrigidos sob a regra antiga) NÃO são migrados automaticamente — ficam como estão até o próximo pedido daquele CNPJ trazer o nome de Destino de novo. O dono do projeto pediu para eu levantar candidatos a cliente duplicado criados nesse período (27/07 a 31/07) pra revisão manual, à parte desta mudança de código.
- **Edição manual:** dialog "Editar cadastro" (`clientes/[id]`) tem os 2 campos: "Nome / Destino" (obrigatório, como já era) e "Razão Social" (opcional, novo).

### Cadastro de cliente — causa raiz de duplicação sem CNPJ/CPF (2026-07-31)

- **Problema:** `pedidos/save/route.ts` só tentava casar cliente existente por CNPJ/CPF. Quando o romaneio não tinha nenhum dos dois (cliente final/informal), o código pulava direto pra "criar cliente novo" — todo pedido novo daquele cliente virava um cadastro duplicado. Levantamento em produção achou 58 grupos de duplicata por esse motivo (não é o mesmo problema da reversão Destino/Razão Social acima, é estrutural e já vinha desde maio).
- **Fix:** antes de criar, se não veio CNPJ/CPF, tenta achar cliente existente com **telefone igual E nome normalizado igual** (mesma função `normalizeRazao` — maiúsculas, sem acento/pontuação/sufixo jurídico — usada pelo Confronto de Faturamento, extraída pra `src/lib/normalizar-razao-social.ts`). Achou → reaproveita o cadastro (mesmo update de endereço/última compra que já rola pro caminho de CNPJ/CPF). Não achou → cria novo, como antes.
- **Critério escolhido (não só telefone):** exigir os 2 (telefone E nome) em vez de só telefone, decisão do dono do projeto — reduz risco de juntar 2 clientes diferentes que por acaso dividem telefone (ex.: linha fixa repassada pra outro dono).
- **Sem alterar o caminho com CNPJ/CPF:** esse fallback só roda quando `!cnpj && !cpf`; documento presente mas sem match continua criando cliente novo direto (não tenta fallback por nome), pra não arriscar juntar num cadastro errado quando já existe um identificador forte que simplesmente não bateu.
- **Limpeza dos 58 duplicados já existentes:** feita via script avulso (mesmo padrão de reatribuição das migrations 105/107 — pedidos/ocorrências/carteira/participantes reatribuídos pro cadastro mais antigo do grupo antes de excluir o duplicado), não versionado como migration numerada por ser unificação de dados, não mudança de schema.

### Cadastro de cliente — migrar (ex.: PF virou PJ), diferente de unificar duplicata

- **Não é merge/exclusão** — é o caso oposto de propósito da unificação de duplicata: aqui os 2 cadastros são legitimamente diferentes (documentos diferentes, PF x PJ) e devem continuar existindo os 2, só linkados. Usado quando o mesmo cliente físico passa a comprar com outro documento (o caso mais comum: PF virando PJ) e o sistema, que casa cliente por CNPJ/CPF, não tem como saber sozinho que é a mesma pessoa/empresa.
- **Como funciona:** na tela de revisão do romaneio (`pedidos/novo`), botão "Migrar" no card Cliente abre busca (nome, razão social, CNPJ, CPF ou telefone) pra achar o cadastro antigo. Selecionado, fica "staged" (`cliente_migrar_de_id`) até confirmar a importação — só é gravado no banco junto com o resto do pedido, em `api/pedidos/save`.
- **Efeito no banco (migration 115):** cadastro antigo ganha `cliente_sucessor_id` apontando pro cadastro novo/atual e fica `ativo = false` automaticamente (decisão do dono do projeto — evita alguém criar pedido nele de novo por engano). **Pedidos NÃO são reatribuídos** — cada `pedido.cliente_id` continua apontando pro cadastro em que foi feito originalmente. É assim que dá pra separar depois o que foi comprado como PF do que foi comprado como PJ, sem precisar de outro campo pra isso.
- **Exibição combinada:** a tela de perfil do cliente (`clientes/[id]`) busca a cadeia de cadastros antigos migrados pra ele (BFS via `cliente_sucessor_id`, suporta mais de 1 salto) e junta os pedidos de todos numa lista única, ordenada por data — cada linha ganha uma etiqueta "PF" ou "PJ" (calculada na hora: tem CNPJ → PJ, tem CPF sem CNPJ → PF, nenhum dos dois → sem etiqueta). KPIs do cliente (total pedidos, total comprado, ticket médio, top produtos) são calculados sobre essa lista combinada — decisão do dono do projeto ("o histórico de compra vem junto"), então o valor total do cliente já reflete a vida inteira dele, PF + PJ. Cadastro antigo, se visitado direto, mostra banner "migrado pra [novo]" com link.
- **Escopo:** só a tela de importação de romaneio (`pedidos/novo`). Não foi replicado pra Confronto de Faturamento/Auditoria nem pra listagem geral de Clientes (que continua mostrando o cadastro antigo normalmente, só marcado inativo).

### Classificação do pedido na importação — Amostra Grátis / Bonificação / Troca

- **Campo `tipo_pedido`** (`pedidos.tipo_pedido`, migration 092): `'normal'` (padrão, imensa maioria) | `'amostra_gratis'` | `'bonificacao'` | `'troca'`. Escolhido no card "Dados do Pedido" da tela de revisão do romaneio (`pedidos/novo`), com 3 botões que funcionam como toggle (clicar de novo desmarca, volta pra 'normal' — mesmo padrão de deselect já usado nos botões de forma de pagamento da Expedição).
- **Amostra Grátis / Bonificação:** `valor_total` do pedido é **zerado automaticamente** no momento da importação (decisão do dono do projeto). A baixa de estoque Schreiber continua normal — a mercadoria sai fisicamente mesmo sendo grátis. Continuam entrando normalmente nas telas de Faturamento/Confronto e nas metas comerciais (decisão explícita — não há exclusão automática desses relatórios para nenhum dos 3 tipos).
- **Troca:** ao marcar "Troca", abre um campo para digitar o número do pedido ANTIGO que originou a troca — **precisa existir no sistema** (bloqueia se não encontrar, endpoint `GET /api/pedidos/buscar-troca`). Encontrado o pedido, lista os itens dele ainda não trocados (`itens_pedido.anulado_troca = false`) para o operador selecionar quais estão sendo trocados (múltipla escolha, não é 1-para-1 com os itens do pedido novo).
  - **Efeito ao confirmar a importação** (`api/pedidos/save`): soma o `valor_total` dos itens escolhidos do pedido antigo → esse valor é **subtraído do `valor_total` do pedido antigo** ("anula aquele faturamento") e os itens escolhidos ficam marcados `anulado_troca = true` / `anulado_por_pedido_id` = id do pedido novo. O pedido novo (que está sendo importado agora) **mantém o próprio `valor_total`** extraído do romaneio — é ele que "passa a valer".
  - **Estoque:** a baixa Schreiber dos itens antigos anulados é estornada (devolvida ao estoque) — decisão do dono do projeto, já que fisicamente o produto está sendo substituído. Implementado em `estornarBaixaParcial` (`schreiber-baixa.ts`) — reverte só linhas inteiras de `est_movimentacoes` (nunca fraciona uma linha), pra nunca correr risco de estorno duplicado se o pedido antigo for cancelado depois; no caso raro de dois itens do mesmo pedido compartilharem o mesmo produto Schreiber, o pior caso é estornar a menos, nunca a mais.
  - **Validação no servidor, não só no client:** `api/pedidos/save` revalida que os itens escolhidos realmente pertencem ao pedido de origem informado e ainda não foram trocados antes (`anulado_troca = false`) — nunca confia só na seleção feita no browser.
  - **Rollback:** se a anulação do pedido antigo ou o estorno de estoque falhar depois do pedido novo já ter sido criado, o pedido novo é excluído (mesmo padrão de rollback já usado quando a baixa Schreiber do próprio pedido novo falha) — nunca fica um pedido de troca "pela metade" (criado mas sem anular o antigo).
- **Escopo desta mudança:** só a importação via PDF (`pedidos/novo`, aba "Importar PDF"). A aba "Entrada Manual" não foi tocada (segue em desenvolvimento, sem esse fluxo).

### Troca — sincronização pós-implementação (auditoria de 2026-07-28)

Auditoria (`sincronizacao-e-integridade`) encontrou pontos do sistema que não sabiam da existência de `anulado_troca` e foram corrigidos:

- **Relatórios que somavam/contavam item anulado como válido** — corrigido para excluir `anulado_troca = true`: "Total de saídas" (`produtos/page.tsx`), Saídas por período (`produtos/saidas/page.tsx`), relatório diário e médias de Produção (`api/producao/relatorio`, `api/producao/medias`), "Top Produtos" do cliente (`clientes/[id]/page.tsx`), detecção de mix do Hambúrguer (`mix-hamburguer/page.tsx`).
- **Tela do Pedido:** item anulado por troca aparece riscado com badge "Trocado" (não é escondido — preserva o histórico visível), com nota explicando por que o total não bate com a soma dos itens visíveis.
- **Reimportar romaneio (`api/pedidos/[id]/reimport`) e Aplicar Confronto de Faturamento (`api/faturamento/apply`) BLOQUEIAM** (não sobrescrevem silenciosamente) quando o pedido envolvido tem histórico de troca — seja como origem (tem itens `anulado_troca = true`) ou como o próprio pedido de troca (`tipo_pedido = 'troca'`). Decisão do dono do projeto (opção "bloquear com aviso claro", entre 3 alternativas apresentadas) — reimportar/reconciliar sobrescreveria itens e `valor_total` do zero, apagando o histórico e desfazendo o desconto aplicado sem avisar ninguém. No Confronto, o bloqueio é por pedido individual (não trava o lote inteiro) — os demais divergentes do mesmo lote continuam sendo aplicados normalmente; os bloqueados voltam pra tela com aviso (`toast.warning`) listando os números dos pedidos, e a linha correspondente NÃO é marcada como "ok" (fica como estava, aguardando ajuste manual).
- **FK de `pedido_troca_origem_id` e `anulado_por_pedido_id`** (migration 097): estavam sem `ON DELETE`, bloqueando "Desfazer importação" do Confronto com erro de banco sempre que o pedido envolvido participou de uma troca. Corrigido para `ON DELETE SET NULL`, mesmo padrão já usado em `entregador_id` (migrations 029/095) — perder o ponteiro é aceitável quando o pedido referenciado já foi excluído, não é perda de dado real.

### Exceção — reconciliação financeira (cadastro de cliente)

"Auditoria de Pedidos" (`relatorios/page.tsx` → `handleAuditoriaCreateAndFix`) e "Confronto de Faturamento" (`api/faturamento/apply/route.ts` → `findOrCreateCliente`) criam cliente só com `razao_social`, sem endereço, e NÃO são bloqueados por esta regra — a origem desses fluxos (NF/planilha do Solidcon) não tem dado de endereço algum, e são reconciliação contábil em lote, não o fluxo de venda/entrega. Ficam incompletos (badge "Sem endereço") até o cliente ter um pedido real importado por romaneio PDF, quando a regra de sincronização passa a exigir e completar o endereço.

### Montagem de Carga — quantidade de sacolas e status de pagamento esperado

- **Campos novos por cliente da carga** (`expedicao_carga_clientes`, migration 116): `qtd_sacolas` (número) e `status_pagamento` (Pago/Boleto/Pix/Cobrar/Outros) + `status_pagamento_obs` (texto livre, só quando "Outros"). **Ambos obrigatórios pra enviar a carga**, mesmo padrão de bloqueio (borda vermelha + toast) já usado em Valor R$/Bairro de entrega — decisão do dono do projeto em 2026-08-01, revertendo o "opcional" inicial do mesmo dia. Sem constraint NOT NULL no banco (só na camada de aplicação) — mesmo motivo do endereço do cliente: cargas antigas já têm essas colunas nulas.
- **Não é o pagamento real:** isso é uma expectativa anotada na hora de montar a carga (avisa o entregador de como aquele cliente costuma pagar) — diferente de `expedicao_pagamentos`/`Modalidade` (Dinheiro/PIX/Cartão/Boleto-a-prazo), que é o pagamento de fato registrado na baixa, depois da entrega. Os 2 sistemas são independentes, não se validam um contra o outro.
- **Onde aparece:** além do formulário de Montagem, mostrado no romaneio impresso/WhatsApp (pra o entregador ver antes de sair) e na tela de Retorno/baixa (pra quem confere o pagamento saber o que era esperado).

### Montagem de Carga — editar carga, reabrir baixa, finalização e senha admin

- **Editar carga (`Pendentes` → botão "Editar"):** só permitido enquanto `totalRecebido(carga) === 0` — nenhum valor recebido em NENHUM cliente da carga, nem parcial. Assim que existe qualquer pagamento registrado, a carga só pode ser mexida pela tela de Retorno (baixa/ocorrência/encerramento), nunca pela edição geral — evita editar/remover um item que já tem pagamento vinculado.
- **Reabrir baixa (já confirmada ou encerrada com pendência):** mantém os pagamentos (`expedicao_pagamentos`) já lançados, só destrava `baixado`/`encerrado_com_pendencia`/`motivo_encerramento` — decisão do dono do projeto (não limpa o que já foi registrado).
- **Comprovante de baixa (foto/vídeo):** obrigatório apenas em "Confirmar baixa total" (não em pagamento parcial) — clicar no botão abre a câmera/galeria do dispositivo; cancelar o seletor nativo não confirma a baixa. Aceita múltiplos arquivos, guardados em `expedicao_carga_clientes.comprovantes_urls` (bucket `comprovantes`, mesmo já usado por `entregas.comprovante_url`).
- **Finalizar carga:** exige assinatura do entregador (capturada em canvas) + nome digitado depois de assinar. Sem isso não finaliza. Assinatura vira imagem em `expedicao_cargas.assinatura_url`/`assinatura_nome`.
- **Senha admin para "Encerrar com pendência":** 3 códigos nomeados (Paulo/Nicole/Junior), guardados com hash (pgcrypto/bcrypt, migration 088) — NINGUÉM consegue ver o valor original depois, só resetar por uma tela admin (`/admin/senhas-encerramento`). Verificação via função `verificar_senha_admin` (SECURITY DEFINER, só devolve o nome do dono, nunca o hash); reset via `trocar_senha_admin`, chamável só por `service_role` (rota server-side que já valida `profiles.role = 'admin'`).
- **Log de auditoria (`logs_atividade`, migration 089):** escopo inicial (decidido com o dono do projeto para não tentar cobrir o sistema inteiro de uma vez): login/logout, uso de senha admin, exclusão de carga/usuário, edição de carga, edição de cadastro de cliente, criação/baixa parcial/baixa total/reabertura/encerramento com pendência/finalização de carga. Leitura da tabela restrita a `profiles.role = 'admin'` via RLS.
- **Log de auditoria — expansão para todo o sistema (2026-07-24):** a pedido do dono do projeto ("log de tudo que é feito no sistema"), mapeado com um agente de exploração e coberto módulo a módulo: Pedidos (criação/edição/reimportação/mudança de status/atribuição de entregador), Faturamento (aplicar confronto/desfazer — 1 log resumo por lote, não por pedido individual), Entregas (mudança de status/atribuição individual e em lote/criação em lote), rota pública do entregador por token (`api/entrega/[token]` — sem `auth.getUser()`, loga com `userId: null` e `userNome` = nome do entregador dono do token), Entregadores (CRUD entregador/empresa, ativar/desativar), Expedição (ocorrência manual — único gap que faltava), Ocorrências (criar/editar/resolver/reabrir/excluir), Eventos e Dia Hambúrguer (CRUD evento/participante, aprovar/reprovar — **não** loga `handleAcompanhar`, campos de acompanhamento clicados a cada toggle, por ser ruído de alto volume e baixo valor de auditoria), Mini Blend/Relatório de Produção (registros e saídas), Produção Noturna (salvar/limpar itens de produção e expedição noturna, incluir/excluir cliente de zona), Estoque (ajuste, entrada, atualização, cancelamento de entrada, pedido de estoque FEFO, produto/apresentação/vínculo BVC, baixa e estorno Schreiber), Financeiro/Devoluções (CRUD devolução e motivos), Funil (criar card, mover etapa, fechamento ganho/perdido), Admin Comercial (mapeamento Solidcon, meta, time comercial, vendedor, carteira de cliente), Admin Usuários (criar/editar, exclusão já cobria antes) e TODAS as rotas de permissão (rota, módulo, ocorrências, role, estoque), troca de senha admin, e edição de produto (cadastro base). NÃO duplicado: cancelamento/exclusão de pedido continua também em `pedido_logs` (tabela dedicada com aba própria) — agora grava nos DOIS lugares. Backups automáticos por trigger (`producao_noturna_historico`, `expedicao_historico`) continuam existindo em paralelo, sem relação com `logs_atividade`.

### Bot WhatsApp (Rifas) — comando #conta

_(Atualizado em 2026-08-20: gatilho ampliado — ver "Mudança de regra" abaixo. Esta é a versão vigente.)_

- **Gatilho:** qualquer um (admin ou participante comum) manda `#conta`, tanto dentro do grupo de rifa quanto no privado do próprio número do bot. No grupo, checado ANTES do bloco `isAdmin && texto.startsWith('#')` que intercepta os demais comandos (`#lista`/`#status`/`#faltam`/`#remover`, só pra admin) — senão o admin digitando `#conta` cairia no fallback "não entendi" desses. No privado, checado antes de toda a fila de confirmações sim/não do dono (`handleMensagemPrivada`), já que é um comando explícito, não uma resposta a pergunta pendente.
- **Identificação:** telefone do remetente (mesma extração já usada em `handlePedido`: `senderPn`/`fromMe`) buscado em `participants` filtrado por `group_id` do grupo onde a mensagem chegou (nunca busca global — telefone é único só por grupo desde a migration 040).
- **Fórmula do "total em aberto":** soma de `raffles.ticket_price × count(tickets)` com `tickets.payment_status = 'open'` pertencentes ao participante — mesmo cálculo da tela `participante-detalhe.tsx`. NÃO soma saldo de `transactions` (diferente da tela `relatorio-abertos.tsx`, que é cálculo de outra regra/tela e não deve ser confundido com este).
- **Escopo:** todas as rifas do grupo em que o participante tem tickets `open`, não só a rifa `active` atual — diferente de `#status`/`#lista`/`#faltam`, que são sempre escopados só à rifa ativa.
- **Resposta é sempre privada** (`sendText` pro telefone do próprio remetente), nunca no grupo (`sendToGroup`) — dado financeiro sensível de um participante não pode ficar visível pros demais membros do grupo.
- **Telefone sem participante cadastrado no grupo:** responde (no privado) mensagem explicando que não achou cadastro em nome dele naquele grupo — nunca silêncio.

### Bot WhatsApp (Rifas) — #contagem, #cancelarcontagem e {{mencao}}

- **Gatilho:** `#contagem HH:MM` e `#cancelarcontagem`, só ADMIN, digitados no grupo — checados ANTES do bloco `isAdmin && texto.startsWith('#')` (mesmo motivo do `#conta`: senão cairiam no fallback "não entendi" de `handleComando`). Interruptor próprio `groups.bot_contagem_ativo`, separado de `bot_comandos_ativo`.
- **Horário já passado hoje:** recusa com aviso, nunca agenda pra amanhã.
- **Contagem já ativa no grupo:** `#contagem` novo SUBSTITUI a anterior automaticamente (cancela em silêncio, cria a nova) — índice único parcial (`group_countdown_state`, 1 linha `ativa` por grupo) garante isso no banco, não só na aplicação.
- **Avisos T-10/T-5/T-1 e abertura:** processados pelo cron de 1min já existente (`processarContagensRegressivas`, dentro de `api/cron/auto-messages`, sem cron externo novo) — se a contagem começar com menos tempo que algum marco (ex: só 5min restantes), o marco maior (10min) simplesmente nunca dispara, não é erro.
- **Cron atrasado (perde a janela por mais de ~2min):** contagem marcada `expirada`, o grupo NÃO abre sozinho atrasado — avisa no grupo e exige `#contagem` de novo. Não existe "abrir atrasado".
- **Abertura de verdade:** `setGroupAnnounceOnly(tok, jid, false)` — validação empírica pendente (só testado com `true`/fechar até hoje).
- **Apagar a mensagem do comando:** best-effort (`.catch()`), formato do id pra apagar mensagem RECEBIDA (não enviada pelo bot) é validação empírica pendente — nunca deve travar o fluxo se falhar.
- **`{{mencao}}`:** placeholder disponível em QUALQUER mensagem editável do bot (não só as de contagem — também `closing_message`, ganhadores, maior comprador, `inactivity_reminders`, `auto_messages`), marca TODOS os membros reais do grupo do WhatsApp de forma invisível (sem `@numero` visível no texto, só via o array `mentions` do payload uazapi — validação empírica pendente que a API realmente notifica sem o `@` visível).
  - **Fonte dos telefones:** cache local (`group_member_cache`, populado quando o admin abre/atualiza `/conexao` — reaproveita a chamada a `listGroups` que já existia ali, só passa a persistir). NUNCA chamado ao vivo dentro do webhook/cron — `/group/list` do uazapi é conhecido por travar 40s+ em grupos com 835+ membros (mesmo motivo documentado pra não checar admin real do WhatsApp a cada mensagem).
  - **Cache nunca populado pra aquele grupo:** manda a mensagem sem marcar ninguém — nunca cai pra um subconjunto menor (ex: só participantes cadastrados) fingindo ser "todo mundo".
- **Menu:** submenu "Contagem" dentro de "Bot WhatsApp" no dashboard (`/bot/contagem`) — editor das 5 mensagens (ativação/T10/T5/T1/abertura) + toggle `bot_contagem_ativo` + card de status da contagem ativa.

### Bot WhatsApp (Rifas) — Auto Aceitar (aprovação automática de entrada no grupo)

- **Gatilho:** recorrente, não é comando de chat — toggle `bot_auto_aceitar_ativo` (default `FALSE`, diferente de todos os outros `bot_*_ativo` que nascem `TRUE`: aceitar gente automaticamente é mudança de comportamento real, não deveria ligar sozinho num grupo existente só pela migration rodar) + `auto_aceitar_horario` (`HH:MM`, fuso Brasília). Processado 1x/dia pelo cron de 1min já existente (`processarAutoAceite`, dentro de `api/cron/auto-messages`, mesmo cron do `#contagem`).
- **Endpoints uazapi** (confirmados via projeto irmão "ZapGrupos", já em produção — não são suposição): listar pendentes = `POST /group/info` `{groupjid, getRequestsParticipants:true}` → `request_participants` (string de JIDs separada por vírgula); aprovar = `POST /group/updateParticipants` `{groupjid, action:"approve", participants:[...]}`; mídia = `POST /send/media` `{number, type:"image"|"video", file:<url pública>}`, sem legenda — mídia e texto são 2 envios separados, mídia SEMPRE antes do texto.
- **Sem pendente nenhum no horário:** no-op — não chama `approveParticipants` à toa, mas marca o dia como disparado mesmo assim (não fica tentando de novo a cada tick do resto do dia).
- **Cron atrasado (mesmo dia):** ainda dispara, sem limiar de expiração — **diferente do `#contagem`** (que marca `expirada` e exige novo comando após ~2min de atraso). Aqui atraso de alguns minutos pra aprovar gente é inofensivo; a contagem regressiva é sobre sincronismo de abertura, isso aqui não é.
- **Mensagem pós-aceite:** 1 mensagem só (texto + 1 mídia opcional foto/vídeo) — decisão explícita de não replicar a "sequência de 2 mensagens" que o projeto irmão tem, simplicidade > paridade total. Sem placeholder de "marcar só quem acabou de entrar" — só `{{mencao}}` (marca todo mundo) fica disponível, mesma fonte de telefones (`group_member_cache`) do `#contagem`.
- **Áudio fora do escopo** — nunca confirmado que `/send/media` aceita `type:"audio"` (nem no projeto irmão). Só vídeo (mp4/mov/webm) e imagem (jpg/png/webp/gif), máx 16MB.
- **Sem lista de bloqueio** nesta entrega — aceita todo mundo que estiver pendente no horário, sem exceção.
- **Upload de mídia:** signed upload URL do Supabase Storage (bucket `bot-midias`, público-leitura, path `${groupId}/...`) — servidor só autoriza (groupId sempre de `userOwnsGroup`, nunca do client), navegador sobe direto pro Storage. Sem policy de INSERT em `storage.objects` — o token assinado é a autorização, não uma RLS policy.
- **Menu:** submenu "Auto Aceitar" dentro de "Bot WhatsApp" no dashboard (`/bot/auto-aceitar`) — toggle (bloqueado sem horário configurado) + horário + editor da mensagem + upload de mídia com preview.
- **Ativar (ou trocar horário) depois que o horário de hoje já passou não dispara hoje** — só a partir de amanhã (`auto_aceitar_ativado_em`, marcado toda vez que o toggle liga ou o horário é salvo; só dispara "hoje" se o horário-alvo de hoje for depois desse instante). Achado real, 2026-08-21: dono ativou às 14h com horário configurado pras 09h e o bot aceitou todo mundo NA HORA — o cron não distinguia isso de estar recuperando um disparo perdido por queda de infraestrutura no mesmo dia.

### Bot WhatsApp (Rifas) — #hidetag

- **Gatilho:** `#hidetag [texto]`, só admin, gated pelo mesmo `bot_comandos_ativo` que já cobre `#lista`/`#status`/`#faltam`/`#remover` (não ganhou toggle próprio nem menu de configuração — é um comando pontual, sem estado persistente, mesma categoria dos outros 4).
- **Duas formas de uso** (padrão copiado do projeto irmão "ZapGrupos", já em produção lá): `#hidetag texto aqui` manda esse texto; `#hidetag` sozinho, respondendo/citando uma mensagem, replica o texto da mensagem citada. Sem texto E sem citação → recusa com aviso, nunca manda vazio.
- **Fonte dos telefones:** cache local (`group_member_cache`, mesmo do `{{mencao}}`) — **nunca** chama `/group/list` ao vivo, diferente do ZapGrupos (que lista participantes na hora via `listGroups`) — decisão deliberada de NÃO copiar essa parte: grupos deste projeto já têm 800+ membros de verdade e esse endpoint é conhecido por travar 40s+ (mesmo motivo documentado pro `{{mencao}}`). Cache vazio = manda sem marcar ninguém.
- **Apaga a mensagem do comando** (pra todos, `deleteMessage`) sempre, best-effort — não trava o comando se falhar. Não apaga a mensagem CITADA (quando usada como fonte do texto): o webhook só recebe o texto dela, não o id necessário pra apagar.

Regra já documentada que MUDA (não uma lacuna nova sendo preenchida pela primeira vez) exige responder, antes de implementar:

1. **Efeito temporal:** vale só para casos novos a partir de agora, ou é retroativo aos existentes? Retroativo em regra de dinheiro/prazo quase sempre exige migração de dado explícita, nunca "o cálculo novo já resolve sozinho".
2. **Quem é afetado:** entidades já criadas sob a regra antiga continuam com o valor calculado então (congelado) ou recalculam? Decisão explícita, nunca comportamento acidental de que código novo recalcula tudo.
3. **Aviso:** mudança que afeta cliente final ativa a seção 4 (comunicação) — avisar quando a lei ou o contrato exigir.
4. Se a mudança toca dado já persistido de entidades existentes: acionar `sincronizacao-e-integridade` (FASE 2.5, validação semântica) antes de considerar concluída.

## Registro de decisões (append-only)

```
- AAAA-MM-DD — [decisão] — [nova regra | mudança de regra existente] — [efeito retroativo: sim/não] — [quem decidiu / contexto]
- 2026-07-23 — Endereço (endereço, número, bairro, cidade, estado) obrigatório no cadastro de cliente, tanto no import automático de romaneio PDF quanto na edição manual; CEP opcional. Bloqueia o salvamento se incompleto. — nova regra — efeito retroativo: não (clientes antigos sem endereço só se completam no próximo pedido importado, sem migração/backfill) — decidido pelo dono do projeto via entrevista estruturada.
- 2026-07-23 — Criação de cliente via reconciliação financeira (Auditoria de Pedidos e Confronto de Faturamento) fica ISENTA da obrigatoriedade de endereço, por não ter esse dado na origem (NF/planilha). — nova regra (exceção à regra acima) — efeito retroativo: não aplicável — decidido pelo dono do projeto após eu mapear os 2 caminhos ocultos de criação de cliente via grep (fase 1 da sincronizacao-e-integridade).
- 2026-07-23 — Estado deixa de ser campo obrigatório manual e passa a ser preenchido automaticamente via busca de CEP (ViaCEP) no blur do campo CEP, tanto no import de romaneio quanto na edição manual; campo continua editável. — mudança de regra existente (a regra do mesmo dia pedia Estado obrigatório) — efeito retroativo: não aplicável (rule ainda não tinha sido exercida em produção) — decidido pelo dono do projeto.
- 2026-07-23 — Cidade também deixa de ser campo obrigatório manual, mesmo tratamento do Estado (preenchida via busca de CEP, campo editável, não bloqueia salvar). — mudança de regra existente — efeito retroativo: não aplicável — decidido pelo dono do projeto.
- 2026-07-24 — Montagem de Carga (Expedição): bairro de entrega (lista fixa dos 166 bairros do Rio, campo novo `bairro_entrega`, separado do endereço do cliente) obrigatório por cliente da carga, bloqueia enviar. — nova regra — efeito retroativo: não aplicável (campo novo, cargas antigas ficam sem o dado) — decidido pelo dono do projeto; confirmei antes que seria campo separado do endereço cadastrado do cliente, para não corromper endereço de cliente fora do município do Rio.
- 2026-07-24 — Editar carga permitido só com totalRecebido=0; reabrir baixa mantém pagamentos já lançados; comprovante de mídia obrigatório só na baixa TOTAL; assinatura do entregador obrigatória para finalizar carga; 3 senhas admin nomeadas (Paulo/Nicole/Junior) com hash (não recuperável, só reset) destravam "Encerrar com pendência"; log de auditoria (logs_atividade) cobrindo login/logout, senha admin, exclusão de carga/usuário, edição de carga/cliente, e todo o ciclo de baixa/encerramento/finalização de carga. — nova regra — efeito retroativo: não aplicável — decidido pelo dono do projeto (pediu explicitamente para eu perguntar em vez de assumir; perguntei modelo de senha, dono de cada senha, escopo do log, e o que fazer com pagamentos ao reabrir baixa).
- 2026-07-24 — Lista de bairro de entrega substituída pela lista curada do dono do projeto (Centro/Zona Sul/Zona Norte/Zona Oeste do Rio + Niterói + São Gonçalo + Itaguaí + Maricá/Itaipuaçu) e o campo deixa de ser um `<select>` fechado — vira input com busca (sugestões filtradas ao digitar) que aceita qualquer texto livre, mesmo fora da lista. — mudança de regra existente — efeito retroativo: não aplicável (cargas antigas não são reabertas por causa disso) — decidido pelo dono do projeto.
- 2026-07-24 — Log de auditoria (`logs_atividade`) expandido do escopo inicial (só Expedição + algumas ações pontuais) para cobrir toda ação de criação/edição/exclusão/mudança de status em todos os módulos do sistema (mapeado via agente de exploração, ~18 módulos). — mudança de regra existente (amplia o escopo já documentado) — efeito retroativo: não aplicável (log é só daqui pra frente, não recria histórico passado) — decidido pelo dono do projeto ("coloque para ter log de tudo que é feito no sistema").
- 2026-07-27 — Nome do cliente (razão social) extraído do romaneio passa a vir do campo "Razão Social Cliente:", não do nome ao lado de "Destino:" (fallback só se esse campo não existir no documento); cliente já cadastrado com o nome de Destino é corrigido automaticamente no próximo pedido importado para o mesmo CNPJ (update incondicional já existente em `pedidos/save/route.ts`, sem mudança de código ali). — mudança de regra existente — efeito retroativo: não (sem backfill em lote; correção cliente a cliente, no próximo pedido de cada um) — decidido pelo dono do projeto, que também pediu para mapear todo o sistema em busca de outros pontos que grava nome vindo de "Destino"; único ponto encontrado foi `extract-romaneio.ts` → `pedidos/save/route.ts` (grep confirmou "Destino" não aparece em nenhum outro arquivo do projeto).
- 2026-07-27 — Pedido importado por PDF pode ser classificado como Amostra Grátis, Bonificação ou Troca (`pedidos.tipo_pedido`, migration 092). Amostra Grátis/Bonificação zeram o valor_total automaticamente (estoque baixa normal); Troca anula o valor dos itens escolhidos do pedido antigo (informado por número, precisa existir), estorna a baixa Schreiber desses itens, e o pedido novo mantém o próprio valor; todos os 3 tipos continuam entrando normalmente em Faturamento/Confronto e metas comerciais. — nova regra — efeito retroativo: não aplicável (campo novo, só afeta pedidos importados a partir de agora) — decidido pelo dono do projeto por entrevista estruturada (4 perguntas: efeito no valor, mecânica exata da troca, obrigatoriedade do código do pedido antigo, e se sai do Faturamento/metas).
- 2026-07-28 — Auditoria de sincronização (Entregadores/Expedição/Ocorrências + módulos ligados) encontrou itens de pedido anulados por troca sendo contados em relatórios (Produtos, Saídas, Produção, mix Hambúrguer, Top Produtos do cliente) — corrigido para excluir `anulado_troca=true` em todos. Reimportar romaneio e Aplicar Confronto de Faturamento passam a BLOQUEAR (por pedido, não o lote inteiro) quando o pedido tem histórico de troca, em vez de sobrescrever itens/valor_total silenciosamente e apagar esse histórico. FK de `pedido_troca_origem_id`/`anulado_por_pedido_id` corrigida pra ON DELETE SET NULL (migration 097), desbloqueando "Desfazer importação" nesses casos. — mudança de regra existente (fecha lacunas da regra de troca de 2026-07-27, não muda a mecânica da troca em si) — efeito retroativo: não aplicável (troca ainda não tinha sido usada em produção) — decidido pelo dono do projeto, escolhendo "bloquear com aviso claro" entre 3 opções apresentadas para o caso de reimport/confronto colidir com troca.
- 2026-07-31 — Reversão da regra de 2026-07-27: `razao_social` volta a ser extraído do "Destino:" do romaneio (era "Razão Social Cliente:"); campo novo `razao_social_fiscal` (migration 114) guarda a razão social oficial à parte, no mesmo cadastro. Busca de cliente por nome (autocompletes de Ocorrências/Expedição/Eventos/Dia Hambúrguer/Auditoria/Confronto/lista de Pedidos, além da lista principal de Clientes e da Carteira) passa a considerar os 2 campos, achando o cliente por qualquer um dos 2 nomes. `findOrCreateCliente` do Confronto de Faturamento casa primeiro pelo nome fiscal (é o que vem da NF), com fallback pro nome de Destino. — mudança de regra existente — efeito retroativo: não (sem backfill dos clientes já cadastrados com o nome fiscal como principal entre 27/07 e 31/07; dono do projeto pediu para levantar candidatos a duplicado desse período à parte, pra revisão manual) — decidido pelo dono do projeto: a regra de 27/07 quebrou a busca de cliente pro time (que reconhece o cliente pelo nome de Destino, não pelo fiscal) e isso gerava recadastro manual duplicado.
- 2026-07-31 — Levantamento em produção achou 58 grupos de cliente duplicado por telefone+nome iguais sem CNPJ/CPF, espalhados desde maio — causa raiz: `pedidos/save/route.ts` só casava cliente por CNPJ/CPF, sem fallback nenhum por nome quando o documento não vinha no romaneio (caso comum de cliente final/informal). Unificados os 58 via script avulso (mesmo padrão de reatribuição das migrations 105/107). Fix de causa raiz: antes de criar cliente novo sem CNPJ/CPF, tenta achar cadastro existente com telefone E nome normalizado iguais (`normalizeRazao`, extraída pra `src/lib/normalizar-razao-social.ts`); achando, reaproveita; não achando, cria novo como antes. — nova regra (fecha uma lacuna que nunca tinha sido decidida — a rota nunca teve fallback nenhum por nome) — efeito retroativo: sim para os 58 já unificados (dado existente foi mesclado), não há reprocessamento de pedidos antigos além disso — decidido pelo dono do projeto, escolhendo "telefone E nome" (não só telefone) entre as 2 opções apresentadas, pra reduzir risco de juntar clientes diferentes que dividem telefone.
- 2026-07-31 — Nova feature "Migrar" na revisão de importação de romaneio (`pedidos/novo`): liga um cadastro antigo (ex.: PF) ao cadastro novo/atual (ex.: PJ) do mesmo cliente físico, sem excluir nem reatribuir pedidos (diferente da unificação de duplicata) — `clientes.cliente_sucessor_id` (migration 115) aponta pro novo, antigo vira `ativo=false` automaticamente, e a tela de perfil do cliente junta o histórico dos 2 cadastros com etiqueta PF/PJ por pedido, KPIs combinados. — nova regra — efeito retroativo: não aplicável (feature nova, só afeta migrações feitas a partir de agora) — decidido pelo dono do projeto por entrevista estruturada (2 perguntas: se o cadastro antigo vira inativo automaticamente — sim; como mostrar o histórico combinado — lista única com etiqueta de origem, não bloco separado).
- 2026-08-01 — Montagem de Carga ganha 2 campos por cliente: quantidade de sacolas (número) e status de pagamento esperado (Pago/Boleto/Pix/Cobrar/Outros, com descrição obrigatória só quando "Outros") — migration 116. É só uma anotação pro entregador, não se confunde com o pagamento real registrado na baixa (`expedicao_pagamentos`). Aparece no romaneio impresso/WhatsApp e na tela de Retorno. — nova regra — efeito retroativo: não aplicável (campos novos, cargas antigas ficam sem o dado) — decidido pelo dono do projeto, que já especificou os rótulos e o comportamento do "Outros" na própria instrução.
- 2026-08-01 — Sacolas e status de pagamento (regra acima) passam de opcionais para OBRIGATÓRIOS pra enviar a carga, mesmo bloqueio (borda vermelha + toast) já usado em Valor R$/Bairro de entrega. — mudança de regra existente (revertida no mesmo dia em que foi criada como opcional) — efeito retroativo: não aplicável (só afeta o formulário de montagem daqui pra frente, sem constraint no banco) — decidido pelo dono do projeto.
- 2026-08-20 — Novo comando `#conta` no bot de WhatsApp das rifas: participante manda `#conta` no grupo, bot identifica pelo telefone (por group_id) e responde no PRIVADO o total em aberto = soma de `ticket_price` de todos os tickets `payment_status='open'` dele, em todas as rifas do grupo (não só a ativa), sem somar saldo de `transactions`. Telefone sem cadastro no grupo recebe mensagem explicando que não achou, nunca silêncio. — nova regra — efeito retroativo: não aplicável (comando novo) — decidido pelo dono do projeto por entrevista estruturada (4 perguntas: fórmula entre as 2 já existentes no código, visibilidade grupo x privado, escopo de rifas, comportamento quando não acha participante).
- 2026-08-20 — Gatilho do `#conta` ampliado: passa a aceitar tanto admin quanto participante comum (antes só participante comum), e tanto no grupo quanto no privado direto com o número do bot (antes só no grupo). A RESPOSTA continua sempre indo pro privado do remetente, sem mudança — só o lugar de onde o comando pode ser DISPARADO mudou. — mudança de regra existente (amplia o gatilho da regra de 2026-08-20 acima, não muda fórmula/visibilidade da resposta) — efeito retroativo: não aplicável (é só roteamento de comando, sem dado persistido envolvido) — decidido pelo dono do projeto, que pediu explicitamente pra funcionar nos 2 contextos.
- 2026-08-20 — Novo sistema de contagem regressiva de abertura de grupo (`#contagem HH:MM`/`#cancelarcontagem`, só admin) + placeholder `{{mencao}}` disponível em toda mensagem editável do bot (marca todos os membros reais do grupo, invisível). Decisões: horário passado recusa (não agenda pra amanhã); `#contagem` novo substitui o ativo automaticamente; cron atrasado >2min marca "expirada" e NÃO abre sozinho, exige novo comando; `{{mencao}}` lê de um cache local (populado ao abrir/atualizar `/conexao`), nunca chama a API do WhatsApp ao vivo dentro do webhook (grupos com 835+ membros travam 40s+ nesse endpoint); cache vazio = manda sem marcar ninguém. Menu "Contagem" dentro de "Bot WhatsApp" no dashboard. — nova regra — efeito retroativo: não aplicável (comando e placeholder novos) — decidido pelo dono do projeto por entrevista estruturada (8 perguntas ao todo, em 2 rodadas: escopo do {{mencao}}, quem pode usar #contagem, nome do menu — inicialmente "Funções", depois trocado pra "Contagem" — comportamento de horário passado, substituição de contagem ativa, comando de cancelar, fallback de cache vazio, comportamento de cron atrasado).
- 2026-08-21 — Novo sistema "Auto Aceitar": aprova pedidos de entrada pendentes no grupo automaticamente 1x/dia num horário fixo configurado, e manda 1 mensagem (texto + mídia opcional foto/vídeo) depois de aceitar. Endpoints uazapi (`/group/info` getRequestsParticipants, `/group/updateParticipants` action:approve, `/send/media`) confirmados via projeto irmão do dono do projeto (ZapGrupos, já em produção), não foram adivinhados nem testados do zero aqui. Decisões: toggle nasce `FALSE` (diferente do padrão `TRUE` dos outros `bot_*_ativo` — ligar aceite automático sozinho numa migration seria arriscado demais); sem pendente = no-op mas marca o dia; cron atrasado no mesmo dia AINDA dispara (diferente do `#contagem`, aqui atraso é inofensivo); 1 mensagem só (não a sequência de 2 do projeto irmão); sem placeholder de marcar só os novos aceitos (só `{{mencao}}` de sempre); sem lista de bloqueio; áudio fora do escopo (nunca confirmado). Upload de mídia via signed URL do Supabase Storage (bucket `bot-midias` novo neste projeto, público-leitura), servidor só autoriza, groupId sempre de `userOwnsGroup`. — nova regra — efeito retroativo: não aplicável (feature nova) — decidido pelo dono do projeto por entrevista estruturada (3 perguntas: qtd de mensagens pós-aceite, marcar só os novos ou não, lista de bloqueio), depois de eu confirmar os endpoints direto no código de outro projeto do próprio dono em vez de adivinhar.
- 2026-08-21 — Novo comando `#hidetag [texto]`: marca todo mundo do grupo de forma invisível numa mensagem pontual (texto digitado ou, se usado sozinho respondendo a uma mensagem, o texto da mensagem citada). Copiado do padrão já em produção no projeto irmão (ZapGrupos), mas com 1 mudança deliberada: em vez de listar participantes ao vivo via `/group/list` (como o irmão faz), lê do cache local `group_member_cache` (mesma fonte do `{{mencao}}`) — esse endpoint trava 40s+ nos grupos deste projeto (800+ membros reais). Sem toggle/menu próprio, usa o `bot_comandos_ativo` já existente (mesma categoria de `#lista`/`#status`/`#faltam`/`#remover`). Apaga a mensagem do comando (pra todos) sempre; não apaga a mensagem citada (webhook só traz o texto dela, não o id). — nova regra — efeito retroativo: não aplicável (comando novo) — decidido pelo dono do projeto, que pediu explicitamente a confirmação de apagar a mensagem do comando pra todos após o envio.
```

## Checklist ao encerrar tarefa com lógica de negócio

- [ ] Toda regra implementada cita a seção deste documento?
- [ ] Nenhum [A DEFINIR]/[INFERIDO] foi implementado sem decisão do dono?
- [ ] Se é mudança de regra existente (não novidade): efeito temporal e quem é afetado foram decididos explicitamente?
- [ ] Decisões novas registradas com data e marcadas como nova regra ou mudança?
- [ ] Cálculo central único (sem duplicação em telas/mensagens)?
- [ ] Alçada de aprovação (se existir) checada antes de executar a ação sensível?
- [ ] Regra de dinheiro com teste na mesma tarefa?
