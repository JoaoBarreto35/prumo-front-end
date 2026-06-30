import {
  useState,
} from "react";

import { Button } from "../Button";
import { Card } from "../Card";
import { PageState } from "../PageState";
import {
  ExpenseDonutChart,
  HorizontalAmountChart,
  MonthlyComparisonChart,
} from "../ReportCharts";
import type {
  Account,
  Category,
} from "../../types/finance";
import type {
  GroupType,
  Transaction,
  TransactionStatus,
  TransactionType,
} from "../../types/transactions";
import type {
  DateRange,
  MonthlyReportPoint,
  NamedAmount,
  ReportFilters,
  ReportPeriodPreset,
  ReportSummary,
} from "../../utils/reporting";
import {
  formatCurrency,
} from "../../utils/currency";

import styles from "./styles.module.css";


type MobileSection =
  | "overview"
  | "breakdown"
  | "details";


type ReportsMobileProps = {
  accounts: Account[];
  categories: Category[];
  preset: ReportPeriodPreset;
  customStart: string;
  customEnd: string;
  filters: ReportFilters;
  range: DateRange;
  summary: ReportSummary;
  previousIncomeChange: number | null;
  previousExpenseChange: number | null;
  previousBalanceChange: number | null;
  monthlySeries: MonthlyReportPoint[];
  categoryTotals: NamedAmount[];
  accountTotals: NamedAmount[];
  groupTypeTotals: NamedAmount[];
  topExpenses: Transaction[];
  transactions: Transaction[];
  hasFilters: boolean;
  onPresetChange: (
    preset: ReportPeriodPreset,
  ) => void;
  onCustomStartChange: (
    value: string,
  ) => void;
  onCustomEndChange: (
    value: string,
  ) => void;
  onFilterChange: <
    Key extends keyof ReportFilters,
  >(
    key: Key,
    value: ReportFilters[Key],
  ) => void;
  onResetFilters: () => void;
  onExportCsv: () => void;
};


const periodLabels:
  Record<
    ReportPeriodPreset,
    string
  > = {
    current_month: "Mês atual",
    previous_month: "Mês anterior",
    last_3_months: "3 meses",
    last_6_months: "6 meses",
    last_12_months: "12 meses",
    custom: "Personalizado",
  };


function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "pt-BR",
  ).format(
    new Date(`${value}T12:00:00`),
  );
}


function formatPercentage(
  value: number | null,
): string {
  return value === null
    ? "Sem base"
    : `${value.toFixed(1)}%`;
}


function comparisonLabel(
  value: number | null,
  invertMeaning = false,
): {
  label: string;
  className: string;
} {
  if (value === null) {
    return {
      label: "Sem comparação",
      className:
        styles.neutral,
    };
  }

  if (Math.abs(value) < 0.05) {
    return {
      label: "Sem mudança",
      className:
        styles.neutral,
    };
  }

  const isPositive =
    invertMeaning
      ? value < 0
      : value > 0;

  return {
    label:
      `${value > 0 ? "+" : ""}`
      + `${value.toFixed(1)}%`,
    className:
      isPositive
        ? styles.positiveChange
        : styles.negativeChange,
  };
}


function groupTypeLabel(
  value: GroupType,
): string {
  if (value === "installment") {
    return "Parcelada";
  }

  if (value === "recurring") {
    return "Recorrente";
  }

  return "Avulsa";
}


function statusLabel(
  value: TransactionStatus,
): string {
  if (value === "completed") {
    return "Concluída";
  }

  if (value === "cancelled") {
    return "Cancelada";
  }

  return "Pendente";
}


function countActiveFilters(
  filters: ReportFilters,
): number {
  return [
    filters.accountId !== "all",
    filters.categoryId !== "all",
    filters.transactionType !== "all",
    filters.status !== "active",
    filters.groupType !== "all",
    filters.search.trim().length > 0,
  ].filter(Boolean).length;
}


export function ReportsMobile({
  accounts,
  categories,
  preset,
  customStart,
  customEnd,
  filters,
  range,
  summary,
  previousIncomeChange,
  previousExpenseChange,
  previousBalanceChange,
  monthlySeries,
  categoryTotals,
  accountTotals,
  groupTypeTotals,
  topExpenses,
  transactions,
  hasFilters,
  onPresetChange,
  onCustomStartChange,
  onCustomEndChange,
  onFilterChange,
  onResetFilters,
  onExportCsv,
}: ReportsMobileProps) {
  const [
    activeSection,
    setActiveSection,
  ] = useState<MobileSection>(
    "overview",
  );

  const [
    filtersOpen,
    setFiltersOpen,
  ] = useState(false);

  const activeFilterCount =
    countActiveFilters(filters);

  const incomeChange =
    comparisonLabel(
      previousIncomeChange,
    );

  const expenseChange =
    comparisonLabel(
      previousExpenseChange,
      true,
    );

  const balanceChange =
    comparisonLabel(
      previousBalanceChange,
    );

  const visibleCategories =
    categories.filter(
      (category) =>
        category.is_active,
    );


  return (
    <div className={styles.page}>
      <header
        className={styles.header}
      >
        <div>
          <span
            className={
              styles.eyebrow
            }
          >
            Análise financeira
          </span>

          <h1>Relatórios</h1>

          <p>
            {
              formatDate(
                range.start,
              )
            }{" "}
            até{" "}
            {
              formatDate(
                range.end,
              )
            }
          </p>
        </div>

        <Button
          size="small"
          onClick={onExportCsv}
          disabled={
            transactions.length === 0
          }
        >
          Exportar
        </Button>
      </header>

      <section
        className={styles.toolbar}
      >
        <label>
          <span>Período</span>

          <select
            value={preset}
            onChange={(event) =>
              onPresetChange(
                event.target.value as ReportPeriodPreset,
              )
            }
          >
            {(
              Object.entries(
                periodLabels,
              ) as Array<
                [
                  ReportPeriodPreset,
                  string,
                ]
              >
            ).map(
              ([
                value,
                label,
              ]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              ),
            )}
          </select>
        </label>

        <button
          type="button"
          className={
            filtersOpen
              ? styles.filterButtonActive
              : styles.filterButton
          }
          onClick={() =>
            setFiltersOpen(
              (current) =>
                !current,
            )
          }
        >
          Filtros
          {activeFilterCount > 0 ? (
            <span>
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </section>

      {preset === "custom" ? (
        <div
          className={
            styles.customDates
          }
        >
          <label>
            <span>De</span>
            <input
              type="date"
              value={customStart}
              onChange={(event) =>
                onCustomStartChange(
                  event.target.value,
                )
              }
            />
          </label>

          <label>
            <span>Até</span>
            <input
              type="date"
              value={customEnd}
              onChange={(event) =>
                onCustomEndChange(
                  event.target.value,
                )
              }
            />
          </label>
        </div>
      ) : null}

      {filtersOpen ? (
        <Card>
          <div
            className={
              styles.filterPanel
            }
          >
            <label>
              <span>Conta</span>
              <select
                value={
                  filters.accountId
                }
                onChange={(event) =>
                  onFilterChange(
                    "accountId",
                    event.target.value,
                  )
                }
              >
                <option value="all">
                  Todas
                </option>
                {accounts.map(
                  (account) => (
                    <option
                      key={account.id}
                      value={account.id}
                    >
                      {account.name}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              <span>Categoria</span>
              <select
                value={
                  filters.categoryId
                }
                onChange={(event) =>
                  onFilterChange(
                    "categoryId",
                    event.target.value,
                  )
                }
              >
                <option value="all">
                  Todas
                </option>
                <option
                  value="uncategorized"
                >
                  Sem categoria
                </option>
                {visibleCategories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              <span>Tipo</span>
              <select
                value={
                  filters.transactionType
                }
                onChange={(event) =>
                  onFilterChange(
                    "transactionType",
                    event.target.value as TransactionType | "all",
                  )
                }
              >
                <option value="all">
                  Receitas e despesas
                </option>
                <option value="income">
                  Receitas
                </option>
                <option value="expense">
                  Despesas
                </option>
              </select>
            </label>

            <label>
              <span>Formato</span>
              <select
                value={
                  filters.groupType
                }
                onChange={(event) =>
                  onFilterChange(
                    "groupType",
                    event.target.value as GroupType | "all",
                  )
                }
              >
                <option value="all">
                  Todos
                </option>
                <option value="single">
                  Avulsa
                </option>
                <option value="installment">
                  Parcelada
                </option>
                <option value="recurring">
                  Recorrente
                </option>
              </select>
            </label>

            <label>
              <span>Status</span>
              <select
                value={filters.status}
                onChange={(event) =>
                  onFilterChange(
                    "status",
                    event.target.value as TransactionStatus | "active",
                  )
                }
              >
                <option value="active">
                  Ativas
                </option>
                <option value="pending">
                  Pendentes
                </option>
                <option value="completed">
                  Concluídas
                </option>
                <option value="cancelled">
                  Canceladas
                </option>
              </select>
            </label>

            <label
              className={
                styles.searchField
              }
            >
              <span>Buscar</span>
              <input
                type="search"
                placeholder="Descrição, conta ou categoria"
                value={filters.search}
                onChange={(event) =>
                  onFilterChange(
                    "search",
                    event.target.value,
                  )
                }
              />
            </label>

            <div
              className={
                styles.filterFooter
              }
            >
              <span>
                {transactions.length}{" "}
                movimentações
              </span>

              {hasFilters ? (
                <Button
                  variant="tertiary"
                  size="small"
                  onClick={
                    onResetFilters
                  }
                >
                  Limpar
                </Button>
              ) : null}
            </div>
          </div>
        </Card>
      ) : null}

      <nav
        className={styles.tabs}
        aria-label="Seções do relatório"
      >
        <button
          type="button"
          className={
            activeSection
            === "overview"
              ? styles.tabActive
              : ""
          }
          onClick={() =>
            setActiveSection(
              "overview",
            )
          }
        >
          Resumo
        </button>

        <button
          type="button"
          className={
            activeSection
            === "breakdown"
              ? styles.tabActive
              : ""
          }
          onClick={() =>
            setActiveSection(
              "breakdown",
            )
          }
        >
          Distribuição
        </button>

        <button
          type="button"
          className={
            activeSection
            === "details"
              ? styles.tabActive
              : ""
          }
          onClick={() =>
            setActiveSection(
              "details",
            )
          }
        >
          Lançamentos
        </button>
      </nav>

      {activeSection === "overview" ? (
        <div
          className={
            styles.section
          }
        >
          <section
            className={
              styles.metrics
            }
          >
            <article>
              <span>Receitas</span>
              <strong
                className={
                  styles.income
                }
              >
                {formatCurrency(
                  summary.income,
                )}
              </strong>
              <small
                className={
                  incomeChange
                    .className
                }
              >
                {incomeChange.label}
              </small>
            </article>

            <article>
              <span>Despesas</span>
              <strong
                className={
                  styles.expense
                }
              >
                {formatCurrency(
                  summary.expense,
                )}
              </strong>
              <small
                className={
                  expenseChange
                    .className
                }
              >
                {expenseChange.label}
              </small>
            </article>

            <article>
              <span>Resultado</span>
              <strong
                className={
                  summary.balance
                  >= 0
                    ? styles.income
                    : styles.expense
                }
              >
                {formatCurrency(
                  summary.balance,
                )}
              </strong>
              <small
                className={
                  balanceChange
                    .className
                }
              >
                {balanceChange.label}
              </small>
            </article>

            <article>
              <span>Taxa de sobra</span>
              <strong>
                {formatPercentage(
                  summary.savingsRate,
                )}
              </strong>
              <small>
                Das receitas
              </small>
            </article>
          </section>

          <Card
            title="Evolução mensal"
            description="Receitas, despesas e saldo."
          >
            <MonthlyComparisonChart
              data={monthlySeries}
            />
          </Card>

          <section
            className={
              styles.quickStats
            }
          >
            <article>
              <span>
                Receita média
              </span>
              <strong>
                {formatCurrency(
                  summary
                    .averageMonthlyIncome,
                )}
              </strong>
            </article>

            <article>
              <span>
                Despesa média
              </span>
              <strong>
                {formatCurrency(
                  summary
                    .averageMonthlyExpense,
                )}
              </strong>
            </article>

            <article>
              <span>Pendentes</span>
              <strong>
                {summary.pendingCount}
              </strong>
            </article>

            <article>
              <span>Concluídas</span>
              <strong>
                {summary.completedCount}
              </strong>
            </article>
          </section>
        </div>
      ) : null}

      {activeSection
      === "breakdown" ? (
        <div
          className={
            styles.section
          }
        >
          <Card
            title="Por categoria"
            description="Onde suas despesas se concentram."
          >
            <ExpenseDonutChart
              data={categoryTotals}
              emptyMessage="Nenhuma despesa encontrada."
            />
          </Card>

          <Card
            title="Por conta"
          >
            <HorizontalAmountChart
              data={accountTotals}
              emptyMessage="Nenhuma despesa encontrada."
            />
          </Card>

          <Card
            title="Por formato"
          >
            <HorizontalAmountChart
              data={groupTypeTotals}
              emptyMessage="Nenhum compromisso encontrado."
            />
          </Card>

          <Card
            title="Maiores despesas"
          >
            {topExpenses.length === 0 ? (
              <PageState
                title="Nenhuma despesa"
                description="Não existem despesas no período selecionado."
              />
            ) : (
              <div
                className={
                  styles.topExpenses
                }
              >
                {topExpenses.map(
                  (
                    transaction,
                    index,
                  ) => (
                    <article
                      key={
                        transaction.id
                      }
                    >
                      <span>
                        {index + 1}
                      </span>

                      <div>
                        <strong>
                          {
                            transaction
                              .description
                          }
                        </strong>
                        <small>
                          {
                            transaction
                              .category_name
                            ?? "Sem categoria"
                          }{" "}
                          ·{" "}
                          {
                            transaction
                              .account_name
                          }
                        </small>
                      </div>

                      <strong
                        className={
                          styles.expense
                        }
                      >
                        {formatCurrency(
                          transaction.amount,
                        )}
                      </strong>
                    </article>
                  ),
                )}
              </div>
            )}
          </Card>
        </div>
      ) : null}

      {activeSection
      === "details" ? (
        <div
          className={
            styles.section
          }
        >
          {transactions.length === 0 ? (
            <Card>
              <PageState
                title="Nenhum lançamento"
                description="Altere o período ou os filtros."
              />
            </Card>
          ) : (
            <div
              className={
                styles.transactionList
              }
            >
              {transactions
                .slice(0, 100)
                .map(
                  (transaction) => (
                    <article
                      key={
                        transaction.id
                      }
                      className={
                        styles.transaction
                      }
                    >
                      <header>
                        <div>
                          <strong>
                            {
                              transaction
                                .description
                            }
                          </strong>
                          <span>
                            {
                              transaction
                                .category_name
                              ?? "Sem categoria"
                            }
                          </span>
                        </div>

                        <strong
                          className={
                            transaction
                              .transaction_type
                            === "income"
                              ? styles.income
                              : styles.expense
                          }
                        >
                          {transaction
                            .transaction_type
                          === "income"
                            ? "+ "
                            : "− "}
                          {formatCurrency(
                            transaction.amount,
                          )}
                        </strong>
                      </header>

                      <dl>
                        <div>
                          <dt>Conta</dt>
                          <dd>
                            {
                              transaction
                                .account_name
                            }
                          </dd>
                        </div>

                        <div>
                          <dt>Formato</dt>
                          <dd>
                            {groupTypeLabel(
                              transaction
                                .group_type,
                            )}
                            {transaction
                              .group_type
                            !== "single"
                              ? ` ${transaction.sequence_number}/${transaction.total_occurrences}`
                              : ""}
                          </dd>
                        </div>

                        <div>
                          <dt>Data</dt>
                          <dd>
                            {formatDate(
                              transaction
                                .due_date,
                            )}
                          </dd>
                        </div>

                        <div>
                          <dt>Status</dt>
                          <dd>
                            {statusLabel(
                              transaction
                                .status,
                            )}
                          </dd>
                        </div>
                      </dl>
                    </article>
                  ),
                )}
            </div>
          )}

          {transactions.length > 100 ? (
            <p
              className={
                styles.notice
              }
            >
              Exibindo os primeiros
              100 lançamentos. O CSV
              contém todos.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
