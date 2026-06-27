# Prumo — Mapa de Telas e Rotas

> **Prumo — aprumando sua vida financeira.**

Este documento transforma a especificação funcional do Prumo em uma estrutura de navegação concreta.

---

## 1. Estrutura geral de rotas

```text
/
├── /login
├── /register
├── /access-pending
├── /access-rejected
├── /access-suspended
├── /change-temporary-password
│
├── /home
├── /calendar
├── /transactions
│   ├── /new
│   └── /:transactionId/edit
├── /accounts
│   ├── /new
│   └── /:accountId/edit
├── /categories
│   ├── /new
│   └── /:categoryId/edit
├── /closings
│   ├── /new
│   └── /:closingId
├── /lume
│   └── /:conversationId
├── /settings
│   ├── /profile
│   ├── /preferences
│   ├── /security
│   └── /appearance
│
├── /admin
│   └── /users
│       └── /:userId
│
├── /unauthorized
└── /*
```

---

## 2. Redirecionamento da rota inicial

### `/`

A rota inicial não terá conteúdo próprio.

Comportamento:

- usuário não autenticado → `/login`;
- usuário pendente → `/access-pending`;
- usuário rejeitado → `/access-rejected`;
- usuário suspenso → `/access-suspended`;
- usuário com senha temporária → `/change-temporary-password`;
- usuário ativo → `/home`;
- administrador ativo → `/home`, com acesso adicional ao painel administrativo.

---

# 3. Layouts

## 3.1 PublicLayout

Usado por:

- `/login`;
- `/register`;
- `/access-pending`;
- `/access-rejected`;
- `/access-suspended`;
- `/change-temporary-password`.

Características:

- identidade do Prumo;
- layout centralizado;
- tema claro e escuro;
- sem sidebar;
- sem navegação financeira;
- sem atalho global do Lume.

---

## 3.2 AppLayout

Usado por toda a área autenticada.

Elementos globais:

- sidebar desktop;
- cabeçalho;
- seletor de tema;
- acesso ao perfil;
- contexto global de período;
- contexto global de filtros;
- atalho global do Lume;
- conteúdo principal;
- navegação mobile.

---

## 3.3 AdminLayout

Usado por:

- `/admin/users`;
- `/admin/users/:userId`.

Pode reutilizar o AppLayout, mas deve apresentar:

- identificação clara de área administrativa;
- navegação reduzida;
- nenhuma exposição de dados financeiros de outros usuários;
- retorno rápido ao Prumo pessoal.

---

# 4. Rotas públicas

## 4.1 Login

### Rota

```text
/login
```

### Objetivo

Autenticar usuário por e-mail e senha.

### Conteúdo

- logotipo e nome Prumo;
- slogan;
- campo de e-mail;
- campo de senha;
- mostrar ou ocultar senha;
- botão Entrar;
- link Solicitar acesso;
- mensagem de bloqueio temporário;
- estados de carregamento e erro.

### Ações

- autenticar;
- redirecionar conforme status;
- acessar cadastro.

---

## 4.2 Solicitação de acesso

### Rota

```text
/register
```

### Conteúdo

- nome;
- e-mail;
- senha;
- confirmação de senha;
- requisitos da senha;
- botão Solicitar acesso;
- link para Login.

### Resultado

Após cadastro:

```text
/access-pending
```

---

## 4.3 Acesso pendente

### Rota

```text
/access-pending
```

### Conteúdo

- mensagem curta de solicitação em análise;
- e-mail cadastrado;
- botão Verificar novamente;
- botão Sair.

Sem tutorial ou textos longos.

---

## 4.4 Acesso rejeitado

### Rota

```text
/access-rejected
```

### Conteúdo

- informação de que a solicitação não foi aprovada;
- botão Sair.

---

## 4.5 Acesso suspenso

### Rota

```text
/access-suspended
```

### Conteúdo

- informação de acesso temporariamente indisponível;
- botão Sair.

---

## 4.6 Troca obrigatória de senha

### Rota

```text
/change-temporary-password
```

### Conteúdo

- nova senha;
- confirmação;
- requisitos;
- botão Atualizar senha.

A navegação financeira permanece bloqueada até a troca.

---

# 5. Navegação principal

## 5.1 Sidebar desktop

### Grupo: Visão financeira

- Home;
- Calendário;
- Movimentações;
- Fechamentos.

### Grupo: Organização

- Contas;
- Categorias.

### Grupo: Assistente

- Lume.

### Grupo: Sistema

- Configurações.

### Grupo administrativo

Visível somente para administradores:

- Usuários.

---

## 5.2 Navegação mobile

Barra inferior:

- Home;
- Calendário;
- Movimentações;
- Mais.

O Lume terá botão flutuante próprio.

### Menu Mais

- Fechamentos;
- Contas;
- Categorias;
- Configurações;
- Administração, quando aplicável;
- Sair.

---

# 6. Home

## Rota

```text
/home
```

## Objetivo

Responder de forma imediata:

> Como está meu mês?

## Estrutura

### 1. Cabeçalho do período

- mês e ano;
- mês anterior;
- próximo mês;
- seletor direto;
- voltar ao mês atual;
- botão Fechar mês ou Atualizar fechamento.

### 2. Entrada do Lume

No desktop:

- campo conversacional;
- sugestões rápidas.

No mobile:

- acessível pelo botão global do Lume.

### 3. Filtros globais

- busca;
- tipo;
- conta;
- categoria;
- status;
- mais filtros;
- filtros ativos;
- visões salvas;
- limpar filtros.

### 4. Indicadores

- Saldo previsto ou Resultado filtrado;
- Receitas previstas;
- Despesas previstas;
- Pendente;
- recebido;
- pago;
- a receber;
- a pagar.

### 5. Comparações

- mesmo recorte do mês anterior;
- sem comparação artificial quando não houver dados.

### 6. Pontos de atenção

- atrasos;
- receitas não recebidas;
- acertos pendentes;
- fechamento desatualizado;
- classificações incertas.

### 7. Gráficos

- distribuição das despesas;
- receitas, despesas e resultado.

### 8. Tabela mensal

- todos os lançamentos filtrados do período;
- colunas configuráveis;
- seleção múltipla;
- ações em lote;
- paginação quando necessário;
- exportação PDF e CSV.

## Estado vazio

- indicadores zerados;
- tabela com “Nenhuma movimentação neste mês”;
- Falar com o Lume;
- Adicionar manualmente;
- gráficos ocultos.

---

# 7. Calendário

## Rota

```text
/calendar
```

## Parâmetro de visualização

```text
/calendar?view=month
/calendar?view=agenda
```

## Objetivo

Responder:

> Quando cada valor será pago ou recebido?

## Estrutura

### Cabeçalho

- período;
- navegação;
- voltar ao mês atual;
- alternância Calendário / Agenda.

### Filtros

Usa o mesmo contexto global da Home.

### Visualização mensal

Cada dia mostra:

- total de receitas;
- total de despesas;
- indicador de pendência;
- indicador de atraso.

### Detalhamento do dia

Desktop:

- painel lateral.

Mobile:

- folha inferior ou tela completa.

Conteúdo:

- movimentações;
- seleção múltipla;
- ações em lote;
- adicionar movimentação nessa data.

### Agenda

- agrupamento por data prevista;
- movimentações completas;
- edição direta;
- seleção múltipla.

---

# 8. Movimentações

## Rota

```text
/transactions
```

## Objetivo

Consulta ampla e administração do histórico.

## Período padrão

```text
Últimos 12 meses
```

## Estrutura

### Resumo

- receitas;
- despesas;
- resultado do período.

### Filtros

- globais;
- intervalos amplos;
- todo o histórico;
- parcelas;
- recorrências;
- origem;
- confiança;
- alterações após fechamento.

### Tabela

- configurável;
- ordenável;
- seleção múltipla;
- ações em lote;
- exportação;
- paginação 25, 50 ou 100;
- padrão 50.

### Acesso a grupos

- ver todas as parcelas;
- ver todas as ocorrências;
- resumo do conjunto.

---

## 8.1 Nova movimentação

### Rota

```text
/transactions/new
```

### Apresentação

- drawer no desktop;
- tela completa no mobile.

### Campos essenciais

- tipo;
- descrição;
- valor;
- conta;
- categoria;
- data da movimentação;
- data prevista;
- status;
- repetição.

### Campos progressivos

- observações;
- data de realização;
- parcelas;
- recorrência;
- confiança da IA;
- histórico.

---

## 8.2 Editar movimentação

### Rota

```text
/transactions/:transactionId/edit
```

### Conteúdo

Mesmo formulário da criação, com:

- dados atuais;
- status;
- histórico;
- grupo relacionado;
- escopo de edição;
- cancelar;
- excluir;
- restaurar.

---

# 9. Contas

## Rota

```text
/accounts
```

## Objetivo

Administrar contas e comportamentos de pagamento.

## Tabela

Colunas:

- Conta;
- Tipo;
- Configuração;
- Status.

## Filtros

- busca;
- tipo;
- status.

## Ações

- criar;
- editar;
- definir padrão;
- inativar;
- reativar.

Sem valores financeiros.

---

## 9.1 Nova conta

### Rota

```text
/accounts/new
```

### Campos

- nome;
- tipo;
- conta padrão;
- status;
- fechamento, quando aplicável;
- vencimento, quando aplicável.

---

## 9.2 Editar conta

### Rota

```text
/accounts/:accountId/edit
```

Mesmo formulário da criação.

Contas usadas não podem ser apagadas pela interface comum.

---

# 10. Categorias

## Rota

```text
/categories
```

## Tabela

- Categoria;
- Aplicação;
- Status.

## Filtros

- busca;
- aplicação;
- status.

## Ações

- criar;
- editar;
- inativar;
- reativar;
- excluir somente se nunca usada.

---

## 10.1 Nova categoria

```text
/categories/new
```

Campos:

- nome;
- aplicação;
- status.

---

## 10.2 Editar categoria

```text
/categories/:categoryId/edit
```

A alteração de aplicação afeta apenas novos lançamentos.

---

# 11. Fechamentos

## Rota

```text
/closings
```

## Objetivo

Consultar o histórico formal dos meses fechados.

## Tabela

- Período;
- Fechado em;
- Receitas;
- Despesas;
- Resultado;
- Pendências;
- Alterações posteriores.

## Filtros

- ano;
- status de atualização;
- período;
- com pendências;
- com alterações posteriores.

---

## 11.1 Novo fechamento

### Rota

```text
/closings/new?period=2026-06
```

### Fluxo guiado

1. resumo;
2. receitas pendentes;
3. despesas e atrasos;
4. acertos;
5. classificações para revisão;
6. análise do Lume;
7. observações;
8. confirmação.

O fechamento pode ser concluído com pendências.

---

## 11.2 Detalhe do fechamento

### Rota

```text
/closings/:closingId
```

### Conteúdo

- fotografia atual;
- versões;
- valores originais;
- valores atuais;
- alterações posteriores;
- pendências;
- observações;
- análise do Lume;
- exportar PDF;
- atualizar fechamento.

---

# 12. Lume

## Rota principal

```text
/lume
```

## Conversa específica

```text
/lume/:conversationId
```

## Objetivo

Centralizar:

- perguntas;
- análises;
- registros;
- filtros;
- simulações;
- preparação de ações.

## Estrutura

### Desktop

- histórico de conversas;
- conversa atual;
- área de resposta;
- ações estruturadas;
- presença visual do Lume.

### Mobile

- lista de conversas separada;
- conversa em tela completa;
- compositor fixo.

## Sugestões iniciais

- Como está meu mês?;
- Quanto preciso pagar ao meu pai?;
- Posso assumir uma nova parcela?;
- O que aumentou meus gastos?;
- Registrar uma movimentação.

## Ações estruturadas

As respostas podem oferecer:

- abrir movimentações;
- aplicar filtro;
- preparar acerto;
- confirmar lançamento;
- editar;
- simular novamente;
- transformar simulação em movimentação.

---

# 13. Configurações

## Rota base

```text
/settings
```

Redireciona para:

```text
/settings/profile
```

---

## 13.1 Perfil

### Rota

```text
/settings/profile
```

Conteúdo:

- nome;
- e-mail;
- alteração de senha.

Troca de e-mail exige senha atual.

---

## 13.2 Preferências

### Rota

```text
/settings/preferences
```

Conteúdo:

- conta padrão;
- moeda;
- idioma;
- formato de data;
- primeiro dia da semana;
- paginação padrão.

---

## 13.3 Segurança

### Rota

```text
/settings/security
```

Conteúdo:

- sessões;
- dispositivos;
- sessão atual;
- encerrar sessão;
- encerrar outras sessões.

---

## 13.4 Aparência

### Rota

```text
/settings/appearance
```

Conteúdo:

- claro;
- escuro;
- seguir sistema.

---

# 14. Administração

## 14.1 Usuários

### Rota

```text
/admin/users
```

### Tabela

- Nome;
- E-mail;
- Solicitação;
- Status;
- Último acesso.

### Filtros

- busca;
- status;
- período de solicitação.

### Ações

- aprovar;
- rejeitar;
- suspender;
- reativar;
- gerar senha temporária;
- encerrar sessões;
- excluir definitivamente.

O administrador não acessa movimentações, contas, categorias, fechamentos ou conversas do usuário.

---

## 14.2 Detalhe administrativo do usuário

### Rota

```text
/admin/users/:userId
```

### Conteúdo permitido

- nome;
- e-mail;
- status;
- solicitação;
- aprovação;
- último acesso;
- quantidade de sessões;
- histórico administrativo.

### Conteúdo proibido

- dados financeiros;
- conversas do Lume;
- relatórios;
- movimentações;
- fechamentos.

---

# 15. Overlays, drawers e modais

## Drawers

- criar movimentação;
- editar movimentação;
- criar conta;
- editar conta;
- criar categoria;
- editar categoria;
- detalhe do dia;
- Lume rápido.

## Modais

- confirmação de exclusão;
- confirmação de cancelamento;
- escopo de séries;
- ações em lote;
- exportação;
- salvar visão;
- configurar colunas;
- gerar senha temporária;
- excluir usuário.

## Painéis

- filtros avançados;
- colunas;
- histórico;
- versões de fechamento;
- seleção de itens de acerto.

---

# 16. Estados globais

A aplicação deverá possuir telas e componentes padronizados para:

- carregando;
- vazio;
- erro;
- sem conexão;
- IA indisponível;
- acesso não autorizado;
- sessão expirada;
- usuário suspenso;
- recurso não encontrado;
- página 404;
- manutenção futura.

---

# 17. Rotas protegidas

## GuestOnlyRoute

Para:

- login;
- cadastro.

Usuário autenticado é redirecionado conforme status.

## ActiveUserRoute

Exige:

- autenticação;
- status `active`;
- senha temporária já trocada.

## AdminRoute

Exige:

- autenticação;
- status `active`;
- papel administrativo.

## TemporaryPasswordRoute

Permite apenas a troca obrigatória de senha.

---

# 18. Contexto preservado entre telas

O Prumo deverá preservar:

- período;
- filtros;
- visão salva;
- ordenação;
- colunas;
- paginação;
- posição da rolagem;
- seleção, quando seguro;
- conversa atual do Lume.

Ao fechar um drawer ou voltar de uma edição, o usuário retorna ao mesmo ponto.

---

# 19. Parâmetros de URL

Filtros e períodos importantes deverão poder ser representados na URL.

Exemplo:

```text
/home?period=2026-06&account=credit-pai&status=pending
```

Benefícios:

- atualizar sem perder contexto;
- botão voltar previsível;
- abrir links internos;
- integração com o Lume;
- depuração;
- consistência entre telas.

---

# 20. Próximo passo

Com o mapa de rotas concluído, a próxima etapa será definir:

1. arquitetura da navegação desktop;
2. arquitetura da navegação mobile;
3. hierarquia visual de cada página;
4. wireframes;
5. sistema visual do Prumo;
6. identidade visual do Lume.
