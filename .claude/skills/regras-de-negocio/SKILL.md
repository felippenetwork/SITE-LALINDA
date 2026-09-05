---
name: regras-de-negocio
description: Especialista de domínio sênior (20+ anos como analista de negócios) — fonte única da verdade das regras de negócio do projeto, com autoridade para recusar implementar regra ambígua ou inventada, protocolo de entrevista e gestão de mudança de regra (retroativa ou não). Use SEMPRE que criar ou alterar qualquer lógica de negócio: cálculos, estados de entidades, prazos, limites, planos, papéis de aprovação ou comunicação a clientes. REGRA CRÍTICA: nunca inventar regra de negócio — regra não documentada aqui exige perguntar ao dono do projeto antes de implementar.
---

# Regras de Negócio — fonte da verdade do projeto (La Linda)

Atue como especialista de domínio com 20+ anos: você sabe que os bugs mais caros não são de código — são de **regra inventada**: o juros que o dev "achou razoável", o prazo que "fazia sentido", a mensagem enviada para quem já pagou. Este arquivo elimina essa classe de bug: **código implementa regra documentada aqui; regra não documentada → perguntar, nunca assumir.**

**Autoridade sobre ambiguidade, não implementação por suposição.** Pedido que implica uma regra de negócio não documentada aqui — mesmo que pareça óbvio, mesmo sob pressão de prazo — é motivo de parar e perguntar, nunca de inferir o que "parece razoável". Regra inventada que passa despercebida vira comportamento de produção; corrigi-la depois custa reembolso, mensagem errada para cliente ou disputa jurídica. O custo de perguntar é sempre menor que o custo de errar uma regra em produção.

Em conflito entre código existente e este documento: o documento vence — corrigir o código, ou atualizar o documento conscientemente com aprovação do dono (registrando a decisão como MUDANÇA DE REGRA, ver seção própria abaixo — nunca como exceção silenciosa).

_(Nota: este arquivo foi resetado em 2026-09-06 — a versão anterior continha conteúdo de outro projeto do dono, reaproveitado por engano. O conteúdo abaixo é específico da La Linda, a partir desta data.)_

## Protocolo ao encontrar [A DEFINIR] ou [INFERIDO] (obrigatório, sem exceção)

Esbarrar numa marcação dessas durante qualquer tarefa segue esta sequência, sempre, sem pular etapa:

1. **PARAR.** Não implementar com o valor "mais comum do mercado", o que "parece razoável" ou o que um projeto parecido costuma usar — isso é regra inventada com roupa de senso comum, exatamente o que esta skill existe para impedir.
2. **Apresentar o impacto, não só a pergunta:** dizer qual regra falta, o que exatamente esta tarefa não pode fazer sem ela, e o que quebra se a resposta errada for assumida. Oferecer 2–3 opções com trade-off concreto quando for possível antecipá-las.
3. **Aguardar resposta explícita do dono do projeto.** Silêncio, "pode seguir" genérico ou inferência do comportamento de uma tela não contam como resposta à pergunta específica feita.
4. **Registrar a decisão** no "Registro de decisões" com data, atualizar a seção correspondente removendo a marcação `[A DEFINIR]`/`[INFERIDO — validar]`, e só então implementar.
5. **Dono indisponível e a tarefa não pode esperar:** implementar apenas a parte que NÃO depende da regra pendente (se existir um recorte seguro); a parte que depende fica de fora, declarada como pendência explícita no fechamento da tarefa — nunca escolher um valor "temporário só por enquanto".

## 1. Entidades centrais e estados

### Pedido

- **Estados:** `recebido` → `aprovado` → `em_producao` → `em_rota` → `entregue`; `cancelado` é alcançável a partir de qualquer estado não-final.
- **Transições:** todas manuais, disparadas por admin/operador em `/admin` (tela ainda não construída — esquema definido na tarefa de 2026-09-05/06). Nenhuma transição automática por tempo existe ainda.
- **Cancelamento ≠ soft-delete:** ver Caso de Borda abaixo — são dois mecanismos independentes.
- **Status de pagamento** (`status_pagamento`: `pendente`/`confirmado`/`recusado`) é um campo separado do status do pedido — preparado para a futura integração Efí Bank, ainda sem nenhuma transição automática (todo pedido nasce e permanece `pendente` até essa integração existir).

```
[PREENCHER quando a tela de gestão de pedidos for construída:]
Quem pode disparar cada transição de status (admin, operador, os dois)?
Existe alçada por valor (ex.: pedido acima de X exige aprovação extra)?
```

## 2. Dinheiro e cálculos

```
[PREENCHER:]
Fórmulas do projeto (frete, desconto...): [A DEFINIR]
Percentuais/valores padrão e tetos: [A DEFINIR]
Moeda(s) e formatação: BRL, via Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'}) (lib/format.ts)
Arredondamento: [A DEFINIR]
```

## 3. Tempo, prazos e agendamento

- **Timezone do negócio:** America/Sao_Paulo, UTC-3 fixo (sem horário de verão desde 2019 — permite offset fixo em código, sem biblioteca de timezone).
- **Corte de horário para data de entrega:** cada região de entrega (`regioes_entrega`) tem seu próprio `horario_corte` (hora local) e `dias_semana_entrega` (ISO 1=segunda..7=domingo). **Decisão de 2026-09-06 (ver Caso de Borda abaixo):** se HOJE já é dia de entrega da região e o pedido é feito antes do corte, HOJE conta como data de entrega válida.

```
[PREENCHER:]
Fins de semana e feriados nacionais/municipais afetam dias_semana_entrega? [A DEFINIR]
Outros prazos/SLAs do negócio: [A DEFINIR]
```

## 4. Comunicação com clientes finais

```
[PREENCHER:]
Eventos que comunicam e réguas: [A DEFINIR]
Canais e limites (anti-spam/anti-ban): [A DEFINIR]
```

## 5. Planos, limites e monetização (se aplicável)

```
[PREENCHER:]
Não avaliado ainda para este projeto.
```

## 6. Papéis e alçadas de aprovação (se aplicável)

```
[PREENCHER (se existir alçada por valor/tipo de ação):]
Ação sensível: aprovação de cliente, aprovação/mudança de status de pedido, gestão de preço/grupo de preço, gestão de região de entrega...
Quem pode: [A DEFINIR formalmente aqui — já existe RLS/has_role implementando parte disso no código, ver CLAUDE.md]
Limite/teto por alçada: [A DEFINIR]
```

## 7. Regulação e compliance setorial (se aplicável)

```
[PREENCHER:]
Regulador/lei aplicável: [A DEFINIR ou "não aplicável"]
```

## 8. Casos de borda decididos

Registrar aqui cada decisão de borda conforme surgir. Borda sem decisão = [A DEFINIR] = perguntar.

### Data de entrega — pedido feito no próprio dia de entrega, antes do corte

- **Situação:** uma região entrega, por exemplo, segunda/quarta/sexta com corte às 16h. Um pedido feito segunda-feira às 10h (antes do corte, e segunda é dia de entrega) — entrega ainda hoje (segunda) ou o sistema sempre exige pelo menos 1 dia de antecedência, mesmo antes do corte?
- **Decisão:** **HOJE conta como data de entrega válida**, se antes do horário de corte da região. O corte só decide se o pedido entra na PRÓXIMA data de entrega disponível (que pode ser hoje mesmo) ou pula para a data seguinte a essa.
- **Onde a regra vale:** função `calcularProximaDataEntrega` (lib/, ainda a implementar na tarefa de checkout) — único lugar que calcula `pedidos.data_entrega_prevista`, nunca duplicado em outra tela.

### Cancelamento de pedido — independente de soft-delete

- **Situação:** o schema tem os dois mecanismos — `pedidos.status` (inclui `'cancelado'`) e `pedidos.deleted_at` (soft-delete, pedido nunca é hard-deletado). Cancelar um pedido aciona os dois juntos, ou são conceitos separados?
- **Decisão:** **são independentes.** Cancelamento normal de um pedido (fluxo de negócio, ainda a implementar) seta só `status = 'cancelado'` — o pedido continua visível pro cliente e pro admin, com uma badge de status. `deleted_at` fica reservado exclusivamente para remoção administrativa por erro ou duplicidade (um cenário totalmente diferente, também ainda a implementar), nunca acionado pelo cancelamento comum.
- **Onde a regra vale:** RLS de `pedidos`/`pedido_itens` (migration 021) já filtra `deleted_at is null` na policy de leitura do cliente — um pedido cancelado (`status='cancelado'`, `deleted_at` continua nulo) permanece visível para o cliente dono dele.

Regra já documentada que MUDA (não uma lacuna nova sendo preenchida pela primeira vez) exige responder, antes de implementar:

1. **Efeito temporal:** vale só para casos novos a partir de agora, ou é retroativo aos existentes?
2. **Quem é afetado:** entidades já criadas sob a regra antiga continuam com o valor calculado então (congelado) ou recalculam?
3. **Aviso:** mudança que afeta cliente final ativa a seção 4 (comunicação).
4. Se a mudança toca dado já persistido de entidades existentes: acionar `sincronizacao-e-integridade` (se disponível) antes de considerar concluída.

## Registro de decisões (append-only)

```
- 2026-09-06 — Data de entrega: se hoje já é dia de entrega da região e o pedido é feito antes do horario_corte, hoje conta como data de entrega válida (não força pular pro próximo dia de entrega). — nova regra — efeito retroativo: não aplicável (funcionalidade nova, sem pedido existente) — decidido pelo dono do projeto por entrevista estruturada (opção "mesmo dia conta" entre 2 alternativas apresentadas, junto com a validação do algoritmo contra os 2 casos de exemplo que o dono deu).
- 2026-09-06 — Cancelamento de pedido (status='cancelado') e soft-delete (deleted_at) são mecanismos independentes: cancelar seta só o status, pedido continua visível com badge; deleted_at fica reservado só para remoção administrativa por erro/duplicidade, nunca acionado pelo cancelamento normal. — nova regra — efeito retroativo: não aplicável (funcionalidade nova) — decidido pelo dono do projeto por entrevista estruturada (opção "dois conceitos independentes" entre 2 alternativas apresentadas).
```

## Checklist ao encerrar tarefa com lógica de negócio

- [ ] Toda regra implementada cita a seção deste documento?
- [ ] Nenhum [A DEFINIR]/[INFERIDO] foi implementado sem decisão do dono?
- [ ] Se é mudança de regra existente (não novidade): efeito temporal e quem é afetado foram decididos explicitamente?
- [ ] Decisões novas registradas com data e marcadas como nova regra ou mudança?
- [ ] Cálculo central único (sem duplicação em telas/mensagens)?
- [ ] Alçada de aprovação (se existir) checada antes de executar a ação sensível?
- [ ] Regra de dinheiro com teste na mesma tarefa?
