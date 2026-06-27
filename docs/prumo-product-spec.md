# Prumo — Especificação Funcional

> **Prumo — aprumando sua vida financeira.**

## 1. Visão

O Prumo é um aplicativo de organização financeira pessoal focado em reduzir o esforço de registrar, acompanhar e compreender a vida financeira.

A experiência deve permitir que o usuário informe o que aconteceu de forma natural, enquanto o sistema organiza descrições, valores, categorias, contas, datas, parcelas, recorrências e previsões.

O produto não é banco, carteira digital, ERP ou sistema contábil. Seu foco é:

- organização pessoal;
- visão consolidada;
- previsibilidade;
- facilidade;
- fechamento mensal;
- apoio a decisões.

## 2. Princípios

1. Registrar deve ser rápido.
2. O sistema deve preencher automaticamente tudo que puder.
3. A experiência não deve criar burocracia desnecessária.
4. A IA ajuda, mas não é obrigatória.
5. Cálculos financeiros são responsabilidade do backend.
6. A IA interpreta e explica; não inventa números.
7. Toda ação relevante da IA exige confirmação.
8. O usuário continua no controle.
9. Desktop e mobile têm a mesma importância.
10. O código deve demonstrar autoria, arquitetura e evolução reais.

## 3. Identidade

### Produto

**Prumo**

**Slogan:** Aprumando sua vida financeira.

### Assistente

**Lume**

O Lume será o assistente financeiro integrado ao produto. Sua personalidade será equilibrada: amigável, clara, direta, útil e não julgadora.

Visualmente, será representado por uma presença abstrata de luz, com animações discretas para estados como espera, análise, insight e confirmação.

## 4. Modelo de uso

O Prumo será estritamente pessoal.

Cada usuário terá apenas os próprios dados. Não haverá:

- workspaces;
- colaboração;
- membros;
- convites;
- contas compartilhadas;
- acesso de terceiros.

Situações envolvendo outras pessoas serão registradas como contas ou movimentações comuns. Exemplo: `Crédito Pai`.

## 5. Cadastro e acesso

O sistema ficará publicamente acessível, mas novos usuários dependerão de aprovação manual.

### Status

- `pending`;
- `active`;
- `rejected`;
- `suspended`.

### Fluxo

1. Cadastro com nome, e-mail e senha.
2. Conta criada como `pending`.
3. Administrador aprova ou rejeita.
4. Usuário aprovado entra diretamente na Home.

Não haverá na primeira versão:

- confirmação de e-mail;
- e-mail de aprovação;
- login social;
- onboarding.

## 6. Autenticação e segurança

A autenticação será própria, por e-mail e senha.

### Senha

- mínimo de 8 caracteres;
- pelo menos uma letra;
- pelo menos um número;
- sem obrigação de símbolo;
- sem obrigação de maiúscula;
- sem troca periódica.

### Recuperação

O administrador gera uma senha temporária. O usuário é obrigado a criar uma nova senha no próximo login.

### Sessões

O usuário poderá:

- consultar sessões e dispositivos;
- encerrar uma sessão;
- encerrar todas as outras.

Suspensão, redefinição administrativa e ações de segurança poderão invalidar sessões.

## 7. Movimentações

Tipos principais:

- receita;
- despesa.

Não haverá transferência como tipo próprio.

### Dados principais

- tipo;
- descrição obrigatória;
- observações opcionais;
- valor;
- conta;
- categoria;
- data da movimentação;
- data prevista;
- data de realização;
- status;
- forma de repetição;
- origem;
- confiança da IA;
- grupo de parcelas ou recorrência;
- datas de criação e atualização.

## 8. Datas e competência

### Data da movimentação

Quando aconteceu.

### Data prevista

Quando deverá ser pago ou recebido.

Essa data define:

- mês financeiro;
- Home;
- Calendário;
- saldo previsto;
- fechamento;
- relatórios.

### Data de realização

Quando foi efetivamente concluído.

Pagamentos antecipados ou atrasados não mudam automaticamente o mês financeiro.

## 9. Saldo previsto

O principal indicador será:

`receitas previstas - despesas previstas`

Ele considera movimentações concluídas e pendentes do período, exceto canceladas.

Sem filtros: **Saldo previsto**.

Com filtros: **Resultado filtrado**.

As contas não terão saldo individual. O Prumo mostrará uma visão financeira consolidada.

## 10. Status

Persistidos:

- `pending`;
- `completed`;
- `cancelled`.

Derivados automaticamente:

- vence hoje;
- vence em breve;
- atrasado;
- concluído antecipadamente;
- concluído no prazo;
- concluído com atraso;
- receita atrasada.

Movimentações atrasadas permanecem no mês original e não são contabilizadas novamente no mês seguinte.

## 11. Repetição

### Avulsa

Uma ocorrência.

### Parcelada

Quantidade definida de parcelas.

O usuário pode informar:

- valor total;
- ou valor por parcela.

### Recorrente

Mantém uma janela móvel de 12 meses futuros.

Pode ter:

- duração indefinida;
- data final;
- quantidade máxima;
- status ativo ou encerrado.

### Escopo de edição

- somente esta ocorrência;
- esta e as seguintes;
- todo o conjunto.

## 12. Cancelamento e exclusão

### Cancelar

Para algo que existiu como previsão, mas não acontecerá. Permanece no histórico e sai dos cálculos.

### Excluir

Para duplicidade, teste ou erro de cadastro. Ação menos destacada e com confirmação.

## 13. Contas

As contas servem para identificar onde a movimentação aconteceu, não para controlar saldo.

### Tipos

- pagamento imediato;
- cartão de crédito;
- crédito de terceiro;
- dinheiro;
- outro.

### Campos

- nome;
- tipo;
- conta padrão;
- status;
- dia de fechamento, quando aplicável;
- dia de vencimento, quando aplicável.

Não haverá:

- cor;
- ícone;
- saldo;
- limite;
- agência;
- número bancário;
- dados sensíveis.

Cada usuário terá uma conta padrão. A inicial será `PIX`.

## 14. Cálculo automático de datas

### Pagamento imediato e dinheiro

- data prevista igual à data da movimentação;
- concluído por padrão.

### Cartão e crédito de terceiro

Usam fechamento e vencimento.

Exemplo:

- fechamento: 20;
- vencimento: 25;
- compra: 23/06;
- pagamento previsto: 25/07.

Parcelas seguintes avançam mensalmente.

## 15. Faturas e acertos

Faturas não serão cadastradas manualmente.

Serão visões dinâmicas agrupadas por:

- conta;
- período;
- vencimento.

O usuário poderá selecionar itens e marcar todos ou parte como concluídos.

Contas como `Crédito Pai` terão acerto em lote, sem criar uma nova despesa consolidada.

## 16. Categorias

Não haverá subcategorias, cores ou ícones.

### Campos

- nome;
- aplicação;
- status.

### Aplicações

- receitas;
- despesas;
- ambos.

### Categorias iniciais

Despesas:

- Alimentação;
- Transporte;
- Carro;
- Moradia;
- Saúde;
- Educação;
- Lazer;
- Assinaturas;
- Compras;
- Dívidas.

Receitas:

- Salário;
- Renda extra;
- Venda;
- Reembolso;
- Presente.

Geral:

- Outros.

Categorias usadas podem ser inativadas, mas não apagadas. Categorias nunca usadas podem ser excluídas.

## 17. Cadastro com IA

O usuário poderá escrever livremente:

> Gastei 200 reais de gasolina hoje no Crédito Pai.

A IA sugere:

- tipo;
- descrição;
- observações;
- valor;
- conta;
- categoria;
- datas;
- status;
- repetição.

O fluxo será:

1. interpretar;
2. exibir resumo compacto;
3. confirmar, editar ou cancelar;
4. salvar somente após confirmação.

Baixa confiança destaca apenas o campo incerto e oferece alternativas.

## 18. Falha da IA

Quando a IA falhar:

- o texto será preservado;
- haverá nova tentativa;
- haverá preenchimento manual;
- nenhuma informação será perdida.

Não haverá classificador local alternativo na primeira versão.

As chaves ficam apenas no backend, com integração abstraída para fallback e troca futura de provedor.

## 19. Lume

O Lume será a entrada inteligente unificada do Prumo.

Ele poderá:

- registrar movimentações;
- responder perguntas;
- explicar análises;
- aplicar filtros;
- preparar acertos;
- simular cenários;
- navegar para telas;
- preparar ações.

Nenhuma alteração será executada sem confirmação.

### Memória

Somente dentro da sessão atual.

Conversas podem ser consultadas posteriormente, mas novas sessões não herdam automaticamente o contexto anterior.

### Contexto de tela

O Lume poderá considerar:

- página atual;
- período;
- filtros;
- seleção;
- conta aberta;
- fechamento;
- dia do Calendário.

### Presença

- página própria;
- atalho global;
- Home;
- formulário;
- Calendário;
- fechamento;
- tabelas.

No desktop, painel lateral. No mobile, folha inferior ou tela quase completa.

## 20. Home mensal

A Home abre no mês atual e responde:

- quanto deve sobrar;
- quanto entra;
- quanto sai;
- quanto está pendente;
- o que merece atenção;
- onde o dinheiro está sendo gasto.

### Estrutura

1. período;
2. entrada do Lume;
3. indicadores;
4. comparação com mês anterior;
5. avisos;
6. gráficos;
7. tabela completa.

### Gráficos

- distribuição das despesas por categoria, conta ou repetição;
- receitas, despesas e resultado.

Preferência por barras horizontais.

## 21. Tabela da Home

Colunas padrão:

- data prevista;
- descrição;
- categoria;
- conta;
- status;
- valor.

O usuário poderá:

- mostrar ou ocultar colunas;
- reordenar;
- restaurar padrão;
- ordenar dados;
- selecionar itens;
- executar ações em lote;
- salvar a visualização.

### Mobile

Linhas compactas e expansíveis, agrupadas por dia.

### Ações em lote

- concluir;
- alterar categoria;
- alterar conta;
- cancelar;
- excluir;
- exportar;
- incluir ou remover de acerto.

## 22. Filtros globais

### Rápidos

- busca;
- tipo;
- conta;
- categoria;
- status.

### Avançados

- valor;
- datas;
- repetição;
- atraso;
- origem;
- confiança;
- observações;
- parcelas;
- recorrências;
- canceladas;
- alterações pós-fechamento.

### Salvos

Podem guardar:

- filtros;
- ordenação;
- colunas;
- ordem das colunas;
- período relativo.

Os filtros acompanham o usuário entre Home, Calendário, Movimentações, relatórios e Lume.

Todos os elementos respondem ao mesmo filtro.

## 23. Navegação de período

A Home abre no mês atual.

Permite:

- mês anterior;
- próximo mês;
- seleção direta;
- voltar ao mês atual.

Filtros e configuração permanecem ao trocar de período.

Comparações com o mês anterior usam exatamente o mesmo recorte.

## 24. Formulário

### Desktop

Drawer lateral largo.

### Mobile

Tela completa.

Rotas:

- `/transactions/new`;
- `/transactions/:id/edit`.

Clicar em uma movimentação abre diretamente a edição.

### Divulgação progressiva

Campos essenciais primeiro. Parcelas, recorrências, observações, histórico e dados da IA aparecem quando necessários.

### Defaults

- despesa;
- conta padrão;
- hoje;
- avulsa;
- BRL;
- status derivado;
- data prevista calculada;
- data de realização preenchida quando concluída.

## 25. Calendário

Visualizações da primeira versão:

- calendário mensal;
- agenda.

A visão semanal fica para depois.

Cada dia mostra apenas:

- total de receitas;
- total de despesas;
- indicador de pendência ou atraso.

Ao clicar, abre os detalhes.

O Calendário terá os mesmos filtros, seleção múltipla e ações em lote da Home.

Também permitirá criar uma movimentação já com a data prevista do dia selecionado.

## 26. Movimentações

Página de consulta geral do histórico.

Período padrão:

**Últimos 12 meses**

Resumo:

- receitas;
- despesas;
- resultado.

Recursos:

- busca ampla;
- períodos personalizados;
- filtros globais;
- tabela configurável;
- parcelas e recorrências;
- ações em lote;
- exportação.

Paginação:

- 25;
- 50;
- 100.

Padrão: 50.

## 27. Contas e Categorias

### Contas

Tabela com:

- Conta;
- Tipo;
- Configuração;
- Status.

### Categorias

Tabela com:

- Categoria;
- Aplicação;
- Status.

Ambas terão CRUD, pesquisa, filtros e abertura direta para edição.

## 28. Fechamento mensal

Fluxo guiado:

1. resumo;
2. receitas pendentes;
3. despesas e atrasos;
4. acertos;
5. classificações para revisão;
6. análise do Lume;
7. observações;
8. confirmação.

O fechamento pode ser concluído com pendências.

Meses fechados continuam editáveis.

Quando houver alteração, o usuário poderá atualizar o fechamento. Cada atualização cria uma nova versão e preserva as anteriores.

## 29. Exportações

### PDF

Representa a visualização atual:

- filtros;
- período;
- colunas visíveis;
- seções;
- gráficos;
- seleção.

### CSV

Inclui todos os campos disponíveis do recorte filtrado, mesmo que ocultos na tabela.

Importação de CSV fica para uma versão posterior.

## 30. Configurações

### Perfil

- nome;
- e-mail;
- senha.

Nome muda imediatamente.

E-mail exige senha atual, deve ser único e encerra outras sessões.

### Preferências

- conta padrão;
- BRL;
- pt-BR;
- formato de data;
- primeiro dia da semana;
- paginação;
- tema.

### Temas

- claro;
- escuro;
- seguir sistema.

O tema escuro será projetado individualmente.

## 31. Painel administrativo

Página mínima de usuários.

Colunas:

- nome;
- e-mail;
- solicitação;
- status;
- último acesso.

Ações:

- aprovar;
- rejeitar;
- suspender;
- reativar;
- gerar senha temporária;
- encerrar sessões;
- excluir.

O administrador não acessa dados financeiros pela interface.

A exclusão de usuário é:

- imediata;
- definitiva;
- irreversível;
- exclusiva do administrador;
- protegida por confirmação forte.

## 32. Fora da primeira versão

- importação de CSV;
- PDFs, documentos, imagens e comprovantes;
- WhatsApp;
- central de notificações;
- push e e-mail;
- login social;
- confirmação de e-mail;
- recuperação automática;
- metas e orçamentos;
- limites por categoria;
- visão semanal;
- memória permanente do Lume;
- compartilhamento;
- workspaces;
- saldos por conta;
- transferências;
- subcategorias.

## 33. Diretrizes técnicas

### Front-end

- React;
- Vite;
- TypeScript;
- sem `any`;
- CSS Modules;
- mobile-first;
- páginas no padrão:

```text
pages/
  Example/
    index.tsx
    styles.module.css
```

- componentes reutilizáveis;
- hooks;
- services;
- tipos;
- páginas enxutas;
- rotas protegidas;
- estados de loading, erro e vazio.

### Backend

- Python;
- API independente;
- banco relacional;
- migrations;
- autenticação própria;
- regras fora das rotas;
- schemas;
- documentação automática;
- testes;
- independência de Supabase ou fornecedor específico.

## 34. Objetivo de portfólio

O Prumo deverá demonstrar domínio de:

- produto;
- regras de negócio;
- React;
- TypeScript;
- Python;
- APIs;
- autenticação;
- banco relacional;
- IA;
- relatórios;
- testes;
- documentação;
- Git;
- deploy;
- manutenção.

O histórico de commits deverá mostrar evolução incremental, decisões conscientes e autoria real.
