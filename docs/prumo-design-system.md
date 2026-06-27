# Prumo — Design System

> **Prumo — aprumando sua vida financeira.**

## 1. Direção visual

O Prumo deve parecer:

- moderno;
- elegante;
- confiável;
- simples;
- analítico;
- confortável no uso diário;
- humano sem ser infantil.

A interface deve equilibrar:

- grande densidade de informação;
- leitura rápida;
- tabelas fortes;
- filtros poderosos;
- presença discreta do Lume;
- boa experiência mobile.

## 2. Personalidade visual

### Prumo

Representa:

- organização;
- estabilidade;
- direção;
- equilíbrio;
- clareza financeira.

### Lume

Representa:

- inteligência;
- orientação;
- presença;
- análise;
- ajuda contextual.

O Lume será o principal elemento expressivo da identidade, usando brilho, luz e movimento sutil.

## 3. Estrutura visual

### Desktop

- sidebar fixa escura;
- conteúdo principal claro;
- largura máxima confortável para leitura;
- cards com bordas suaves;
- tabelas como elemento central;
- filtros sempre próximos do conteúdo afetado;
- Lume flutuante no canto inferior direito.

### Mobile

- navegação inferior;
- conteúdo em uma coluna;
- listas expansíveis em vez de tabelas largas;
- Lume como botão flutuante;
- drawers substituídos por telas completas;
- filtros em folha inferior;
- ações em lote em barra fixa contextual.

## 4. Paleta base

### Neutros

```css
--color-bg: #F7F6F2;
--color-surface: #FFFFFF;
--color-surface-soft: #FBFAF7;
--color-border: #E8E4DC;
--color-border-strong: #D8D2C8;

--color-text-primary: #152235;
--color-text-secondary: #667085;
--color-text-muted: #98A2B3;

--color-sidebar: #112235;
--color-sidebar-soft: #1A3045;
--color-sidebar-text: #F6F8FA;
--color-sidebar-muted: #AAB6C3;
```

### Marca e Lume

```css
--color-brand: #D98B00;
--color-brand-strong: #B76E00;
--color-brand-soft: #FFF4D9;
--color-lume-glow: rgba(229, 153, 24, 0.38);
```

### Financeiro

```css
--color-positive: #2E9B50;
--color-positive-soft: #EAF7EE;

--color-negative: #D64545;
--color-negative-soft: #FDECEC;

--color-warning: #D97706;
--color-warning-soft: #FFF3E0;

--color-info: #3178C6;
--color-info-soft: #EAF3FF;
```

## 5. Tema escuro

```css
--color-bg: #0D1621;
--color-surface: #13202D;
--color-surface-soft: #182735;
--color-border: #26394A;
--color-border-strong: #365064;

--color-text-primary: #F5F7FA;
--color-text-secondary: #C2CBD4;
--color-text-muted: #8493A3;

--color-sidebar: #09121A;
--color-sidebar-soft: #101F2D;
```

Regras:

- não inverter cores automaticamente;
- reduzir brilho excessivo;
- manter positivos e negativos legíveis;
- preservar contraste em tabelas;
- o brilho do Lume deve ficar mais suave no escuro.

## 6. Tipografia

Recomendação principal:

- **Inter** ou **Manrope**.

Escala:

```css
--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-md: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.5rem;
--font-size-2xl: 2rem;
--font-size-3xl: 2.5rem;
```

Pesos:

- 400: corpo;
- 500: controles;
- 600: títulos de seção;
- 700: valores e títulos principais.

## 7. Espaçamento

Sistema de 4px:

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
```

## 8. Raios

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-pill: 999px;
```

## 9. Sombras

```css
--shadow-sm: 0 2px 8px rgba(21, 34, 53, 0.06);
--shadow-md: 0 8px 24px rgba(21, 34, 53, 0.08);
--shadow-lg: 0 16px 40px rgba(21, 34, 53, 0.12);
--shadow-lume: 0 0 28px rgba(229, 153, 24, 0.38);
```

## 10. Grid e largura

### Desktop

- sidebar expandida: 240px;
- sidebar recolhida: 72px;
- conteúdo: largura fluida;
- padding lateral: 32px;
- gap entre blocos: 24px;
- máximo recomendado de conteúdo: 1600px.

### Tablet

- sidebar em drawer;
- conteúdo com padding de 24px.

### Mobile

- padding lateral: 16px;
- gap entre blocos: 16px;
- navegação inferior fixa;
- áreas de toque mínimas de 44px.

## 11. Sidebar

### Expandida

- logo;
- nome;
- slogan curto;
- grupos;
- usuário no rodapé;
- tema;
- sair.

### Recolhida

- símbolo;
- ícones;
- tooltips;
- usuário por iniciais.

Estados:

- padrão;
- hover;
- ativo;
- desabilitado.

## 12. Header

Conteúdo:

- título;
- descrição curta;
- período;
- ações contextuais;
- retorno ao mês atual;
- fechamento;
- exportação.

O header não deve competir com o conteúdo.

## 13. Botões

### Primário

Uso:

- confirmar;
- criar;
- salvar;
- concluir;
- atualizar fechamento.

### Secundário

Uso:

- editar;
- exportar;
- abrir;
- voltar.

### Terciário

Uso:

- limpar;
- cancelar;
- ações discretas.

### Destrutivo

Uso:

- excluir;
- remover definitivamente;
- suspender.

Tamanhos:

- small: 32px;
- medium: 40px;
- large: 48px.

## 14. Campos

Características:

- label sempre visível;
- placeholder como ajuda;
- erro abaixo;
- ícone apenas quando útil;
- estado readonly;
- estado disabled;
- suporte a prefixos como `R$`.

## 15. Filtros

### Rápidos

- linha horizontal;
- selects compactos;
- busca;
- botão Mais filtros.

### Ativos

- chips removíveis;
- ação Limpar filtros.

### Avançados

- drawer ou popover no desktop;
- bottom sheet no mobile.

## 16. Tabelas

### Desktop

- cabeçalho fixo opcional;
- hover por linha;
- checkbox;
- ordenação;
- paginação;
- colunas configuráveis;
- ações no fim da linha;
- expansão de grupos.

### Mobile

- cartões-linha;
- informações em duas camadas;
- expansão por toque;
- seleção por modo dedicado.

## 17. Cards

Cards devem ser usados somente quando agregarem:

- resumo;
- destaque;
- agrupamento;
- análise.

Não usar cards para tudo.

## 18. Gráficos

Regras:

- barras horizontais para categorias;
- colunas para comparação;
- cores semânticas;
- tooltips simples;
- legenda curta;
- interação aplicando filtro;
- sem excesso de efeitos.

## 19. Lume

### Forma

- núcleo luminoso;
- estrela abstrata;
- brilho quente;
- movimento orgânico.

### Estados

- idle;
- listening;
- thinking;
- insight;
- warning;
- awaiting-confirmation;
- success;
- error.

### Uso

- botão flutuante;
- avatar em conversa;
- destaque em cards;
- contexto em fechamento e calendário.

## 20. Animações

Duração:

```css
--motion-fast: 120ms;
--motion-normal: 200ms;
--motion-slow: 320ms;
```

Curva:

```css
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
```

Aplicações:

- drawers;
- filtros;
- expansão de linhas;
- feedback do Lume;
- loading;
- troca de tema.

Respeitar `prefers-reduced-motion`.

## 21. Estados

Cada componente deve prever:

- default;
- hover;
- active;
- focus;
- disabled;
- loading;
- empty;
- error;
- success.

## 22. Acessibilidade

- contraste AA;
- navegação por teclado;
- foco visível;
- labels associados;
- aria-labels;
- não depender apenas de cor;
- texto alternativo;
- suporte a redução de movimento;
- áreas de toque adequadas.

## 23. Componentes base

### Layout

- AppShell;
- Sidebar;
- Header;
- MobileNavigation;
- PageContainer;
- Section;
- Drawer;
- Modal;
- BottomSheet.

### Formulários

- Input;
- CurrencyInput;
- DateInput;
- Select;
- Combobox;
- Switch;
- Checkbox;
- RadioGroup;
- Textarea;
- FormField.

### Dados

- DataTable;
- MobileTransactionList;
- FilterBar;
- ActiveFilterChips;
- SavedViewSelect;
- Pagination;
- KPIGroup;
- ChartCard;
- EmptyState;
- StatusBadge.

### Lume

- LumeOrb;
- LumeLauncher;
- LumeComposer;
- LumeMessage;
- LumeActionCard;
- LumeInsightCard;
- LumeThinkingState.

## 24. Padrão de arquivos

```text
components/
  Button/
    index.tsx
    styles.module.css
    types.ts
```

```text
pages/
  Home/
    index.tsx
    styles.module.css
    components/
    hooks/
```

## 25. Direção final

O Prumo deve parecer um produto:

- simples de usar;
- sofisticado sem exagero;
- pessoal sem ser infantil;
- analítico sem ser cansativo;
- moderno sem depender de efeitos decorativos.
