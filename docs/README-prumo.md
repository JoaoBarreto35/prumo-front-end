# Prumo

> **Aprumando sua vida financeira.**

O Prumo é uma aplicação de organização financeira pessoal criada para tornar o registro, o acompanhamento e a compreensão da vida financeira mais simples.

A proposta é permitir que o usuário registre receitas e despesas com pouco esforço, acompanhe compromissos futuros, visualize quanto deverá sobrar no fim do mês e conte com o apoio do **Lume**, um assistente financeiro inteligente integrado à experiência.

## Status

> Projeto em fase de planejamento técnico e preparação da implementação.

As etapas de definição de produto, regras de negócio, mapa de telas, direção visual, wireframes e roadmap inicial já foram concluídas.

## Problema

Aplicativos financeiros costumam exigir muito trabalho manual.

O usuário precisa preencher vários campos, organizar categorias, calcular parcelas, lembrar vencimentos, interpretar gráficos e conferir informações espalhadas.

Com o tempo, o controle financeiro se torna cansativo e acaba sendo abandonado.

## Proposta

O Prumo busca reduzir esse esforço.

O usuário poderá registrar informações de forma simples, inclusive por linguagem natural:

```text
Gastei R$ 200 de gasolina hoje no Crédito Pai.
```

O sistema poderá interpretar e sugerir:

- tipo;
- descrição;
- valor;
- conta;
- categoria;
- datas;
- status;
- forma de repetição.

Nada será salvo sem confirmação.

## Funcionalidades planejadas

### Organização financeira

- receitas e despesas;
- lançamentos avulsos;
- parcelamentos mensais;
- recorrências mensais;
- contas;
- categorias;
- previsões;
- valores pendentes;
- conclusão e cancelamento.

### Visão mensal

- saldo previsto;
- receitas previstas;
- despesas previstas;
- valores pendentes;
- comparação com mês anterior;
- gráficos;
- tabela completa;
- filtros globais.

### Calendário

- calendário mensal;
- agenda cronológica;
- totais por dia;
- atrasos;
- ações em lote.

### Fechamento mensal

- resumo do período;
- pendências;
- atrasos;
- acertos;
- análise;
- observações;
- atualização posterior.

### Lume

O Lume será o assistente inteligente do Prumo.

Ele poderá:

- registrar movimentações;
- responder perguntas;
- explicar resultados;
- preparar filtros;
- simular cenários;
- ajudar em fechamentos;
- preparar ações.

Toda ação financeira exigirá confirmação do usuário.

## Modelo financeiro

O núcleo do Prumo é baseado em dois conceitos:

```text
transaction_groups
        ↓
transactions
```

### Transaction Group

Representa a origem lógica de um lançamento.

Pode ser:

- avulso;
- parcelado;
- recorrente.

### Transaction

Representa cada ocorrência financeira real.

```text
Compra avulsa
└── 1 transaction

Compra parcelada
├── transaction 1
├── transaction 2
└── transaction N

Receita recorrente
├── junho
├── julho
├── agosto
└── ...
```

Regras principais:

- todas as transações pertencem a um grupo;
- parcelas são mensais;
- recorrências são mensais;
- recorrências mantêm 12 meses futuros gerados;
- edição e exclusão acontecem pelo grupo;
- mudanças são aplicadas em cascata;
- descrição, conta e categoria também ficam nas transações.

## Saldo previsto

O principal indicador será:

```text
Receitas previstas - Despesas previstas
```

A data prevista define o mês financeiro.

Pagamentos antecipados ou atrasados não mudam automaticamente o período original.

## Stack planejada

### Front-end

- React;
- Vite;
- TypeScript;
- React Router;
- React Query;
- React Hook Form;
- Zod;
- Axios;
- CSS Modules.

### Backend

- Python;
- FastAPI;
- SQLAlchemy;
- Alembic;
- Pydantic;
- JWT;
- PostgreSQL.

### Qualidade

- tipagem estrita;
- sem `any`;
- testes automatizados;
- migrations;
- documentação de API;
- arquitetura em camadas;
- commits incrementais.

## Arquitetura planejada

```text
prumo/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── ...
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── tests/
│   └── ...
│
└── docs/
    ├── product-spec.md
    ├── screen-map.md
    ├── design-system.md
    ├── wireframes.md
    ├── architecture.md
    ├── business-rules.md
    ├── api.md
    └── roadmap.md
```

## Páginas planejadas

```text
/login
/register
/access-pending
/access-rejected
/access-suspended
/change-temporary-password

/home
/calendar
/transactions
/accounts
/categories
/closings
/lume
/settings

/admin/users
```

## Direção visual

O Prumo terá:

- sidebar escura;
- conteúdo claro e espaçoso;
- tema claro e escuro;
- tabelas fortes;
- filtros visíveis;
- navegação mobile própria;
- identidade elegante;
- Lume representado por uma presença abstrata de luz.

## Segurança

Planejado para a primeira versão:

- senha com hash;
- access token;
- refresh token;
- sessões por dispositivo;
- revogação de sessões;
- bloqueio temporário;
- troca obrigatória de senha temporária;
- aprovação manual de novos usuários;
- painel administrativo sem acesso aos dados financeiros.

## Documentação

Documentos já definidos:

- especificação funcional;
- mapa de telas;
- design system;
- wireframes;
- roadmap.

Documentos que serão atualizados durante a implementação:

- arquitetura;
- regras de negócio;
- API;
- banco;
- deploy;
- decisões técnicas.

## Roadmap resumido

1. preparação;
2. design system;
3. navegação;
4. banco;
5. autenticação;
6. contas e categorias;
7. transaction groups;
8. avulsas;
9. parcelamentos;
10. recorrências;
11. Movimentações;
12. Home;
13. Calendário;
14. fechamento;
15. exportações;
16. Lume;
17. administração;
18. testes;
19. deploy.

## Objetivo do projeto

O Prumo será desenvolvido como projeto de portfólio e como ferramenta de uso pessoal.

O projeto deve demonstrar domínio de:

- definição de produto;
- regras de negócio;
- UX;
- React;
- TypeScript;
- Python;
- APIs;
- banco relacional;
- autenticação;
- IA;
- testes;
- documentação;
- deploy.

## Autor

**João Vitor Barreto Pereira**

Projeto autoral em desenvolvimento.
