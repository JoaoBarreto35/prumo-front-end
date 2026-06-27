# Prumo — Wireframes Funcionais

## 1. Login

```text
┌──────────────────────────────────────┐
│                 PRUMO                │
│      Aprumando sua vida financeira   │
│                                      │
│  E-mail                              │
│  [_______________________________]   │
│                                      │
│  Senha                               │
│  [___________________________] [👁]  │
│                                      │
│  [ Entrar ]                          │
│                                      │
│  Solicitar acesso                    │
└──────────────────────────────────────┘
```

## 2. Cadastro

```text
┌──────────────────────────────────────┐
│           Solicitar acesso           │
│                                      │
│  Nome                                │
│  [_______________________________]   │
│  E-mail                              │
│  [_______________________________]   │
│  Senha                               │
│  [_______________________________]   │
│  Confirmar senha                     │
│  [_______________________________]   │
│                                      │
│  [ Solicitar acesso ]                │
│  Voltar ao login                     │
└──────────────────────────────────────┘
```

## 3. Acesso pendente

```text
┌──────────────────────────────────────┐
│                 PRUMO                │
│                                      │
│  Sua solicitação está em análise.    │
│  conta@email.com                     │
│                                      │
│  [ Verificar novamente ]             │
│  [ Sair ]                            │
└──────────────────────────────────────┘
```

## 4. Home desktop

```text
┌──────────────┬──────────────────────────────────────────────┐
│ Sidebar      │ Home                       Junho de 2026     │
│              │ [ Pergunte ou peça algo ao Lume__________ ] │
│              │                                              │
│              │ [Buscar][Tipo][Conta][Categoria][Status]     │
│              │                                              │
│              │ [Saldo] [Receitas] [Despesas] [Pendente]     │
│              │                                              │
│              │ [Gráfico categorias] [Receitas x despesas]   │
│              │                                              │
│              │ Tabela de movimentações                      │
│              │ ┌──────────────────────────────────────────┐ │
│              │ │ data | descrição | conta | status | valor│ │
│              │ └──────────────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────────────┘
```

## 5. Home mobile

```text
┌────────────────────────────┐
│ Home          Junho de 2026│
│ Visão geral do seu mês     │
│                            │
│ [ Pergunte ao Lume______ ] │
│                            │
│ [Saldo]       [Receitas]   │
│ [Despesas]    [Pendente]   │
│                            │
│ [Gráfico resumido]         │
│                            │
│ Movimentações              │
│ ┌────────────────────────┐ │
│ │ 05/06 Salário +R$ ...  │ │
│ └────────────────────────┘ │
│                            │
│ Home Calendar Mov. Mais    │
└────────────────────────────┘
```

## 6. Calendário

```text
┌─────────────────────────────────────────────────────────────┐
│ Calendário             [Calendário] [Agenda]                │
│ Junho de 2026   [Tipo][Conta][Categoria][Status][Mais]      │
│                                                             │
│ ┌─────────────────────────────┬───────────────────────────┐ │
│ │ Calendário mensal           │ Dia selecionado           │ │
│ │ + receitas / - despesas     │ resumo                    │ │
│ │ indicadores de pendência    │ lista de movimentações    │ │
│ │                             │ ações em lote             │ │
│ └─────────────────────────────┴───────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 7. Agenda

```text
┌──────────────────────────────────────┐
│ Agenda — Junho de 2026               │
│ [Filtros globais]                    │
│                                      │
│ 05 de junho                          │
│ ┌──────────────────────────────────┐ │
│ │ Salário                 + R$ ... │ │
│ │ PIX · Receita · Concluído        │ │
│ └──────────────────────────────────┘ │
│                                      │
│ 07 de junho                          │
│ ┌──────────────────────────────────┐ │
│ │ Gasolina                - R$ ... │ │
│ │ Crédito Pai · Pendente           │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

## 8. Movimentações

```text
┌─────────────────────────────────────────────────────────────┐
│ Movimentações                        Últimos 12 meses        │
│ [Receitas] [Despesas] [Resultado]                           │
│                                                             │
│ [Buscar][Tipo][Conta][Categoria][Status][Repetição][Mais]   │
│ [chips ativos] [Salvar visualização]                        │
│                                                             │
│ [Ações em lote] [PDF] [CSV] [Nova movimentação]             │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Data | Compra | Descrição | Categoria | Conta | Valor  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Paginação                                                   │
└─────────────────────────────────────────────────────────────┘
```

## 9. Drawer de movimentação

```text
┌──────────────────────────────────────┐
│ Nova movimentação               [X]  │
│                                      │
│ Tipo [Despesa ▼]                     │
│ Descrição [_______________________]  │
│ Valor [R$ ________________________]  │
│ Conta [PIX ▼]                        │
│ Categoria [Sugestão da IA ▼]         │
│ Data da movimentação [Hoje]          │
│ Data prevista [Hoje]                 │
│ Status [Concluído ▼]                 │
│ Repetição [Avulsa ▼]                 │
│                                      │
│ Mais detalhes ▾                      │
│                                      │
│ [Cancelar] [Salvar movimentação]     │
└──────────────────────────────────────┘
```

## 10. Contas

```text
┌──────────────────────────────────────────────────────┐
│ Contas                             [Nova conta]       │
│ [Buscar] [Tipo] [Status]                            │
│                                                      │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Conta | Tipo | Configuração | Status            │ │
│ │ PIX   | Pagamento imediato | Padrão | Ativa     │ │
│ │ Crédito Pai | Crédito terceiro | Fecha 20...    │ │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

## 11. Categorias

```text
┌──────────────────────────────────────────────────────┐
│ Categorias                       [Nova categoria]     │
│ [Buscar] [Aplicação] [Status]                        │
│                                                      │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Categoria | Aplicação | Status                  │ │
│ │ Alimentação | Despesas | Ativa                  │ │
│ │ Salário     | Receitas | Ativa                  │ │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

## 12. Fechamentos

```text
┌──────────────────────────────────────────────────────┐
│ Fechamentos                                          │
│ [Ano] [Pendências] [Alterações]                      │
│                                                      │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Período | Fechado em | Receita | Despesa | ... │ │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

## 13. Fechamento guiado

```text
┌──────────────────────────────────────┐
│ Fechar Junho de 2026                 │
│ 1 Resumo                             │
│ 2 Receitas pendentes                 │
│ 3 Despesas e atrasos                 │
│ 4 Acertos                            │
│ 5 Revisões                           │
│ 6 Análise do Lume                    │
│ 7 Observações                        │
│ 8 Confirmação                        │
│                                      │
│ [Voltar]                  [Continuar] │
└──────────────────────────────────────┘
```

## 14. Detalhe de fechamento

```text
┌──────────────────────────────────────────────────────┐
│ Junho de 2026                      [Atualizar] [PDF] │
│                                                      │
│ Resultado no fechamento      R$ ...                  │
│ Resultado atual              R$ ...                  │
│ 2 alterações posteriores                             │
│                                                      │
│ [Versão 1] [Versão 2]                               │
│                                                      │
│ Pendências | Observações | Lume | Alterações         │
└──────────────────────────────────────────────────────┘
```

## 15. Lume desktop

```text
┌──────────────────────────────────────────────────────┐
│ Conversas │ Lume                                     │
│           │ [Sugestões rápidas]                     │
│ Análise   │                                          │
│ Junho     │ Usuário: Como está meu mês?             │
│           │                                          │
│ Parcela   │ Lume: resposta estruturada              │
│ carro     │ [Abrir movimentações] [Simular]         │
│           │                                          │
│           │ [Digite sua mensagem_________________]  │
└──────────────────────────────────────────────────────┘
```

## 16. Lume rápido

```text
┌──────────────────────────────────────┐
│ Lume                            [↗]  │
│                                      │
│ Contexto: Home · Junho · Crédito Pai │
│                                      │
│ [mensagens]                          │
│                                      │
│ [Pergunte ou peça algo___________]   │
└──────────────────────────────────────┘
```

## 17. Configurações

```text
┌───────────────┬──────────────────────────────────┐
│ Perfil        │ Configurações                    │
│ Preferências  │                                  │
│ Segurança     │ conteúdo da seção selecionada    │
│ Aparência     │                                  │
└───────────────┴──────────────────────────────────┘
```

## 18. Segurança

```text
┌──────────────────────────────────────┐
│ Segurança                            │
│                                      │
│ Opera no Windows — sessão atual      │
│ Último acesso: hoje                  │
│                                      │
│ Chrome no Android                    │
│ Último acesso: ontem    [Encerrar]   │
│                                      │
│ [Encerrar todas as outras sessões]   │
└──────────────────────────────────────┘
```

## 19. Administração

```text
┌──────────────────────────────────────────────────────┐
│ Usuários                                             │
│ [Buscar] [Status] [Período]                         │
│                                                      │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Nome | E-mail | Solicitação | Status | Acesso  │ │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

## 20. Detalhe administrativo

```text
┌──────────────────────────────────────┐
│ Usuário                              │
│ Nome                                 │
│ E-mail                               │
│ Status                               │
│ Último acesso                        │
│ Sessões                              │
│                                      │
│ [Aprovar] [Suspender] [Senha temp.]  │
│ [Encerrar sessões] [Excluir]         │
└──────────────────────────────────────┘
```

## 21. Estados vazios

### Home

```text
Nenhuma movimentação neste mês.
[Falar com o Lume] [Adicionar manualmente]
```

### Tabela

```text
Nenhum resultado encontrado para os filtros aplicados.
[Limpar filtros]
```

### Conversas

```text
Nenhuma conversa ainda.
[Iniciar conversa]
```

## 22. Estados de erro

```text
Não foi possível carregar os dados.
[Tentar novamente]
```

```text
Não foi possível interpretar agora.
Seu texto foi preservado.
[Tentar novamente] [Preencher manualmente]
```

## 23. Padrão mobile

- uma coluna;
- navegação inferior;
- filtros em bottom sheet;
- ações em lote fixas;
- Lume flutuante;
- formulários em tela cheia;
- listas expansíveis;
- conteúdo principal sem rolagem horizontal.
