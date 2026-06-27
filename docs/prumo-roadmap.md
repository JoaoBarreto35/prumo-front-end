# Prumo — Roadmap de Desenvolvimento

> **Prumo — aprumando sua vida financeira.**

Este roadmap organiza a implementação do Prumo em fases pequenas, progressivas e verificáveis.

## Decisões consolidadas

### Front-end

- React;
- Vite;
- TypeScript;
- React Router;
- React Query;
- React Hook Form;
- Zod;
- Axios;
- CSS Modules;
- mobile-first;
- sem `any`.

### Backend

- Python;
- FastAPI;
- SQLAlchemy;
- Alembic;
- PostgreSQL;
- Pydantic;
- autenticação própria;
- JWT com refresh token;
- regras de negócio em services;
- testes automatizados.

### Núcleo financeiro

```text
transaction_groups
        ↓
transactions
```

Regras:

- tudo nasce em `transaction_groups`;
- avulsa gera uma transação;
- parcelada gera N transações mensais;
- recorrente gera transações mensais;
- recorrências mantêm uma janela móvel de 12 meses;
- `description`, `account_id` e `category_id` existem no grupo e nas transações;
- edição e exclusão acontecem no grupo;
- mudanças são aplicadas em cascata;
- parcelas e recorrências são sempre mensais na primeira versão.

---

## Fase 0 — Preparação

### Objetivo

Criar a base do projeto e padronizar o ambiente.

### Tarefas

- criar repositório;
- definir estrutura `frontend`, `backend` e `docs`;
- adicionar `.gitignore`, `.editorconfig` e `.env.example`;
- configurar ESLint e Prettier;
- configurar lint e formatador Python;
- criar React + Vite + TypeScript;
- criar FastAPI;
- adicionar endpoint de health check;
- documentar execução local.

### Critério de conclusão

- front e backend iniciam;
- health check responde;
- lint funciona;
- documentação local está pronta.

### Commit

```text
chore: initialize prumo frontend and backend
```

---

## Fase 1 — Design system em código

### Objetivo

Transformar a direção visual em componentes reutilizáveis.

### Tarefas

- tokens CSS;
- temas claro e escuro;
- tipografia;
- espaçamentos;
- botões;
- campos;
- selects;
- checkboxes;
- badges;
- cards;
- modais;
- drawers;
- estados de loading, vazio e erro.

### Critério de conclusão

- componentes demonstráveis em uma página interna;
- temas funcionando;
- sem duplicação visual relevante.

### Commit

```text
feat(ui): create foundational design system
```

---

## Fase 2 — Navegação e layouts

### Objetivo

Construir a estrutura principal do produto.

### Tarefas

- PublicLayout;
- AppLayout;
- AdminLayout;
- sidebar recolhível;
- header;
- navegação mobile;
- rotas principais;
- páginas placeholder;
- botão global do Lume.

### Critério de conclusão

- desktop e mobile navegáveis;
- todas as rotas acessíveis;
- item ativo destacado.

### Commit

```text
feat(navigation): build layouts and application routing
```

---

## Fase 3 — Banco e migrations

### Objetivo

Criar o modelo relacional inicial.

### Tabelas

- `users`;
- `user_sessions`;
- `admin_actions`;
- `user_preferences`;
- `accounts`;
- `categories`;
- `transaction_groups`;
- `transactions`;
- `transaction_history`;
- `monthly_closings`;
- `saved_views`;
- `lume_conversations`;
- `lume_messages`;
- `lume_action_requests`.

### Tarefas

- models SQLAlchemy;
- enums;
- relacionamentos;
- constraints;
- índices;
- cascatas;
- migrations Alembic;
- seeds de desenvolvimento.

### Critério de conclusão

- banco sobe do zero;
- migrations executam;
- seed cria usuário, PIX e categorias iniciais.

### Commit

```text
feat(database): create initial relational schema
```

---

## Fase 4 — Autenticação backend

### Tarefas

- cadastro;
- login;
- hash de senha;
- access token;
- refresh token;
- logout;
- sessões;
- bloqueio temporário;
- status do usuário;
- troca obrigatória de senha;
- autorização por papel.

### Critério de conclusão

- cadastro cria usuário pendente;
- login respeita status;
- refresh e logout funcionam;
- suspensão invalida acesso.

### Commit

```text
feat(auth): implement authentication and session control
```

---

## Fase 5 — Autenticação front-end

### Tarefas

- Login;
- Cadastro;
- Acesso pendente;
- Acesso rejeitado;
- Acesso suspenso;
- Troca de senha temporária;
- AuthContext;
- rotas protegidas;
- renovação automática de token;
- tratamento de sessão expirada.

### Commit

```text
feat(auth-ui): connect authentication flows
```

---

## Fase 6 — Preferências, contas e categorias

### Backend

- defaults automáticos;
- conta PIX inicial;
- categorias iniciais;
- CRUD de contas;
- CRUD de categorias;
- regra de conta padrão;
- inativação;
- proteção contra exclusão de itens usados.

### Front-end

- página de Contas;
- formulário de conta;
- página de Categorias;
- formulário de categoria;
- filtros;
- estados vazios.

### Commit

```text
feat(financial-setup): implement accounts categories and preferences
```

---

## Fase 7 — Domínio de transaction groups

### Objetivo

Implementar o coração do Prumo.

### Tarefas

- schemas;
- repositories;
- services;
- validações;
- duplicação controlada de dados;
- geração de transactions;
- cascata de edição;
- cascata de exclusão;
- histórico;
- testes unitários.

### Critério de conclusão

- nenhuma transaction existe sem grupo;
- os três tipos de grupo são suportados;
- dados duplicados permanecem consistentes.

### Commit

```text
feat(transactions): implement transaction group domain
```

---

## Fase 8 — Lançamento avulso

### Tarefas

- grupo `single`;
- geração de uma transaction;
- data prevista;
- status padrão;
- formulário manual;
- drawer desktop;
- tela completa mobile;
- edição e exclusão em cascata.

### Commit

```text
feat(transactions): add single transaction flow
```

---

## Fase 9 — Parcelamento mensal

### Tarefas

- valor total ou por parcela;
- arredondamento seguro;
- cálculo da primeira parcela;
- fechamento e vencimento;
- geração mensal;
- sequência;
- resumo antes de salvar;
- atualização em cascata;
- exclusão em cascata.

### Critério de conclusão

- soma das parcelas fecha com o total;
- datas mensais corretas;
- grupo e transactions sincronizados.

### Commit

```text
feat(transactions): add monthly installment groups
```

---

## Fase 10 — Recorrência mensal

### Regras

- sempre mensal;
- indefinida, com data final ou quantidade máxima;
- janela móvel de 12 meses;
- sem duplicidade;
- grupo encerrado deixa de gerar.

### Tarefas

- geração inicial;
- campo de limite gerado;
- complementação da janela;
- atualização futura em cascata;
- encerramento;
- exclusão.

### Commit

```text
feat(transactions): add monthly recurring groups
```

---

## Fase 11 — Movimentações

### Tarefas

- listagem paginada;
- busca;
- filtros;
- ordenação;
- período;
- resumo;
- tabela desktop;
- lista mobile;
- colunas configuráveis;
- grupos expansíveis;
- acesso às ocorrências relacionadas.

### Commit

```text
feat(transactions): build history and filtering experience
```

---

## Fase 12 — Ações em lote

### Ações

- concluir;
- alterar categoria;
- alterar conta;
- cancelar;
- excluir grupo;
- exportar.

### Critério de conclusão

- confirmação mostra quantidade e valor;
- cascatas respeitadas;
- histórico registrado.

### Commit

```text
feat(transactions): add bulk transaction actions
```

---

## Fase 13 — Home financeira

### Backend

- saldo previsto;
- receitas;
- despesas;
- pendências;
- comparação mensal;
- distribuição por categoria;
- distribuição por conta;
- distribuição por repetição;
- pontos de atenção.

### Front-end

- seletor mensal;
- indicadores;
- filtros globais;
- gráficos;
- tabela mensal;
- estado vazio.

### Commit

```text
feat(home): create monthly financial overview
```

---

## Fase 14 — Calendário e agenda

### Tarefas

- calendário mensal;
- totais por dia;
- atrasos;
- detalhe do dia;
- agenda cronológica;
- filtros globais;
- ações em lote;
- nova movimentação com data preenchida.

### Commit

```text
feat(calendar): build monthly calendar and agenda
```

---

## Fase 15 — Faturas e acertos dinâmicos

### Regra

Não haverá tabelas de fatura ou acerto.

Tudo será calculado a partir de `transactions`.

### Tarefas

- agrupamento por conta;
- agrupamento por mês;
- agrupamento por vencimento;
- seleção parcial;
- conclusão em lote;
- data de realização;
- resumo visual.

### Commit

```text
feat(accounts): add dynamic invoice and settlement views
```

---

## Fase 16 — Fechamento mensal

### Tarefas

- criar fechamento;
- snapshot simples;
- totais;
- pendências;
- observações;
- primeira data de fechamento;
- última atualização;
- fluxo guiado;
- histórico;
- comparação com estado atual.

### Regra

- sem tabela de versões;
- atualização sobrescreve o snapshot atual;
- alterações das movimentações continuam auditadas no histórico.

### Commit

```text
feat(closings): implement monthly closing workflow
```

---

## Fase 17 — Visualizações salvas

### Tarefas

- filtros;
- ordenação;
- colunas;
- período relativo;
- visão padrão;
- editar e excluir.

### Commit

```text
feat(filters): add saved financial views
```

---

## Fase 18 — Exportações

### CSV

- todos os campos;
- UTF-8;
- filtros;
- ordenação;
- seleção.

### PDF

- Home;
- Movimentações;
- Fechamento;
- estilo próprio de impressão.

### Commit

```text
feat(exports): add csv and pdf reports
```

---

## Fase 19 — Infraestrutura do Lume

### Tarefas

- abstração de provedor;
- chaves no backend;
- fallback;
- schemas estruturados;
- validação;
- timeout;
- persistência de conversa;
- tratamento de indisponibilidade.

### Commit

```text
feat(lume): create ai provider infrastructure
```

---

## Fase 20 — Lume para lançamentos

### Tarefas

- interpretar texto;
- usar contas e categorias existentes;
- confiança;
- preview;
- confirmar;
- editar;
- cancelar;
- criar grupo;
- registrar origem IA.

### Commit

```text
feat(lume): add natural language transaction creation
```

---

## Fase 21 — Lume contextual

### Tarefas

- perguntas sobre o mês;
- análises;
- filtros;
- simulações;
- preparação de acerto;
- navegação;
- ações confirmáveis;
- contexto de tela.

### Commit

```text
feat(lume): add contextual financial assistance
```

---

## Fase 22 — Configurações e segurança

### Tarefas

- perfil;
- e-mail;
- senha;
- tema;
- conta padrão;
- paginação;
- sessões;
- encerramento remoto.

### Commit

```text
feat(settings): complete preferences and security
```

---

## Fase 23 — Administração

### Tarefas

- listar usuários;
- aprovar;
- rejeitar;
- suspender;
- reativar;
- senha temporária;
- revogar sessões;
- excluir;
- auditoria administrativa.

### Commit

```text
feat(admin): add user access management
```

---

## Fase 24 — Testes e robustez

### Tarefas

- testes unitários;
- services;
- API;
- autenticação;
- geração mensal;
- cascatas;
- filtros;
- fechamento;
- logs;
- tratamento de erros.

### Commit

```text
test: expand coverage for critical financial flows
```

---

## Fase 25 — Polimento

### Tarefas

- acessibilidade;
- teclado;
- foco;
- contraste;
- loading;
- skeleton;
- empty states;
- animações;
- reduced motion;
- responsividade;
- performance;
- revisão textual.

### Commit

```text
refactor(ui): polish accessibility and responsive experience
```

---

## Fase 26 — Deploy e documentação final

### Tarefas

- banco de produção;
- migrations;
- CI;
- deploy do front;
- deploy do backend;
- domínio;
- logs;
- screenshots;
- README final;
- arquitetura;
- API;
- regras de negócio;
- guia de execução.

### Commit

```text
docs: finalize documentation and deployment guide
```

---

## Marcos

### Marco 1 — Núcleo funcional

- autenticação;
- contas;
- categorias;
- lançamentos avulsos.

### Marco 2 — Planejamento financeiro

- parcelas;
- recorrências;
- Movimentações.

### Marco 3 — Experiência completa

- Home;
- Calendário;
- ações em lote;
- fechamento.

### Marco 4 — Diferenciais

- exportações;
- Lume;
- administração;
- deploy.

## Regra de documentação

Ao concluir cada fase:

- atualizar README;
- atualizar roadmap;
- registrar decisões;
- documentar endpoints;
- adicionar screenshot quando houver evolução visual relevante.
