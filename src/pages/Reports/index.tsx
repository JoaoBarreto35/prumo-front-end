import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ExpenseDonutChart,
  HorizontalAmountChart,
  MonthlyComparisonChart,
} from "../../components/ReportCharts";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { PageState } from "../../components/PageState";
import { accountService } from "../../services/accountService";
import { ApiError } from "../../services/api";
import { categoryService } from "../../services/categoryService";
import { transactionService } from "../../services/transactionService";
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
import {
  buildAccountTotals,
  buildCategoryTotals,
  buildComparison,
  buildGroupTypeTotals,
  buildMonthlySeries,
  buildSummary,
  createReportCsv,
  filterReportTransactions,
  getPreviousRange,
  getReportRange,
  getTopExpenses,
  type ReportFilters,
  type ReportPeriodPreset,
} from "../../utils/reporting";
import {
  formatCurrency,
} from "../../utils/currency";

import styles from "./styles.module.css";


const initialFilters:
  ReportFilters = {
    accountId: "all",
    categoryId: "all",
    transactionType: "all",
    status: "active",
    groupType: "all",
    search: "",
  };


const periodLabels:
  Record<
    ReportPeriodPreset,
    string
  > = {
    current_month: "Mês atual",
    previous_month: "Mês anterior",
    last_3_months: "Últimos 3 meses",
    last_6_months: "Últimos 6 meses",
    last_12_months: "Últimos 12 meses",
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
  if (value === null) {
    return "Sem base";
  }

  return `${value.toFixed(1)}%`;
}


function comparisonText(
  value: number | null,
  invertMeaning = false,
): {
  label: string;
  className: string;
} {
  if (value === null) {
    return {
      label:
        "Sem período anterior comparável",
      className:
        styles.comparisonNeutral,
    };
  }

  if (Math.abs(value) < 0.05) {
    return {
      label:
        "Sem alteração relevante",
      className:
        styles.comparisonNeutral,
    };
  }

  const isGood =
    invertMeaning
      ? value < 0
      : value > 0;

  return {
    label:
      `${value > 0 ? "+" : ""}`
      + `${value.toFixed(1)}%`
      + " vs. período anterior",
    className:
      isGood
        ? styles.comparisonPositive
        : styles.comparisonNegative,
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


export function ReportsPage() {
  const [
    transactions,
    setTransactions,
  ] = useState<Transaction[]>([]);

  const [accounts, setAccounts] =
    useState<Account[]>([]);

  const [
    categories,
    setCategories,
  ] = useState<Category[]>([]);

  const [preset, setPreset] =
    useState<ReportPeriodPreset>(
      "last_6_months",
    );

  const [
    customStart,
    setCustomStart,
  ] = useState("");

  const [
    customEnd,
    setCustomEnd,
  ] = useState("");

  const [filters, setFilters] =
    useState<ReportFilters>(
      initialFilters,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const loadData = useCallback(
    async () => {
      setIsLoading(true);
      setError("");

      try {
        const [
          transactionsData,
          accountsData,
          categoriesData,
        ] = await Promise.all([
          transactionService
            .listTransactions({
              limit: 500,
            }),
          accountService.list(),
          categoryService.list(),
        ]);

        setTransactions(
          transactionsData,
        );
        setAccounts(accountsData);
        setCategories(categoriesData);
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Não foi possível carregar os relatórios.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );


  useEffect(() => {
    void loadData();
  }, [loadData]);


  const range = useMemo(
    () =>
      getReportRange(
        preset,
        customStart,
        customEnd,
      ),
    [
      customEnd,
      customStart,
      preset,
    ],
  );


  const previousRange = useMemo(
    () => getPreviousRange(range),
    [range],
  );


  const filteredTransactions =
    useMemo(
      () =>
        filterReportTransactions(
          transactions,
          range,
          filters,
        ),
      [
        filters,
        range,
        transactions,
      ],
    );


  const previousTransactions =
    useMemo(
      () =>
        filterReportTransactions(
          transactions,
          previousRange,
          filters,
        ),
      [
        filters,
        previousRange,
        transactions,
      ],
    );


  const summary = useMemo(
    () =>
      buildSummary(
        filteredTransactions,
        range,
      ),
    [
      filteredTransactions,
      range,
    ],
  );


  const previousSummary = useMemo(
    () =>
      buildSummary(
        previousTransactions,
        previousRange,
      ),
    [
      previousRange,
      previousTransactions,
    ],
  );


  const incomeComparison =
    buildComparison(
      summary.income,
      previousSummary.income,
    );

  const expenseComparison =
    buildComparison(
      summary.expense,
      previousSummary.expense,
    );

  const balanceComparison =
    buildComparison(
      summary.balance,
      previousSummary.balance,
    );


  const monthlySeries = useMemo(
    () =>
      buildMonthlySeries(
        filteredTransactions,
        range,
      ),
    [
      filteredTransactions,
      range,
    ],
  );


  const categoryTotals = useMemo(
    () =>
      buildCategoryTotals(
        filteredTransactions,
      ),
    [filteredTransactions],
  );


  const accountTotals = useMemo(
    () =>
      buildAccountTotals(
        filteredTransactions,
      ),
    [filteredTransactions],
  );


  const groupTypeTotals = useMemo(
    () =>
      buildGroupTypeTotals(
        filteredTransactions,
      ),
    [filteredTransactions],
  );


  const topExpenses = useMemo(
    () =>
      getTopExpenses(
        filteredTransactions,
        10,
      ),
    [filteredTransactions],
  );


  const visibleCategories =
    useMemo(
      () =>
        categories.filter(
          (category) =>
            category.is_active,
        ),
      [categories],
    );


  const hasFilters =
    filters.accountId !== "all"
    || filters.categoryId !== "all"
    || filters.transactionType
      !== "all"
    || filters.status !== "active"
    || filters.groupType !== "all"
    || filters.search.trim().length
      > 0;


  function updateFilter<
    Key extends keyof ReportFilters,
  >(
    key: Key,
    value: ReportFilters[Key],
  ) {
    setFilters(
      (current) => ({
        ...current,
        [key]: value,
      }),
    );
  }


  function resetFilters() {
    setFilters(initialFilters);
  }


  function exportCsv() {
    const csv =
      createReportCsv(
        filteredTransactions,
      );

    const blob = new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;",
      },
    );

    const url =
      URL.createObjectURL(blob);
    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      `prumo-relatorio-${range.start}`
      + `-a-${range.end}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }


  if (isLoading) {
    return (
      <Card>
        <PageState
          title="Preparando seus relatórios"
          description="Analisando movimentações, contas e categorias."
        />
      </Card>
    );
  }


  if (error) {
    return (
      <Card>
        <PageState
          title="Não foi possível carregar"
          description={error}
          actionLabel="Tentar novamente"
          onAction={() =>
            void loadData()
          }
        />
      </Card>
    );
  }


  const incomeChange =
    comparisonText(
      incomeComparison
        .percentageChange,
    );

  const expenseChange =
    comparisonText(
      expenseComparison
        .percentageChange,
      true,
    );

  const balanceChange =
    comparisonText(
      balanceComparison
        .percentageChange,
    );


  return (
    <div className={styles.page}>
      <header
        className={styles.pageHeader}
      >
        <div>
          <span className={styles.eyebrow}>
            Análise financeira
          </span>

          <h1>Relatórios</h1>

          <p>
            Entenda seus resultados,
            padrões de gastos e
            compromissos financeiros.
          </p>
        </div>

        <div
          className={
            styles.headerActions
          }
        >
          <Button
            variant="secondary"
            onClick={() =>
              window.print()
            }
          >
            Imprimir
          </Button>

          <Button
            onClick={exportCsv}
            disabled={
              filteredTransactions.length
              === 0
            }
          >
            Exportar CSV
          </Button>
        </div>
      </header>

      <Card
        title="Período e filtros"
        description={
          `${formatDate(range.start)}`
          + ` até ${formatDate(range.end)}`
        }
      >
        <div
          className={
            styles.filterGrid
          }
        >
          <label
            className={
              styles.filterField
            }
          >
            <span>Período</span>

            <select
              value={preset}
              onChange={(event) =>
                setPreset(
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

          {preset === "custom" ? (
            <>
              <label
                className={
                  styles.filterField
                }
              >
                <span>Data inicial</span>

                <input
                  type="date"
                  value={customStart}
                  onChange={(event) =>
                    setCustomStart(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label
                className={
                  styles.filterField
                }
              >
                <span>Data final</span>

                <input
                  type="date"
                  value={customEnd}
                  onChange={(event) =>
                    setCustomEnd(
                      event.target.value,
                    )
                  }
                />
              </label>
            </>
          ) : null}

          <label
            className={
              styles.filterField
            }
          >
            <span>Conta</span>

            <select
              value={filters.accountId}
              onChange={(event) =>
                updateFilter(
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

          <label
            className={
              styles.filterField
            }
          >
            <span>Categoria</span>

            <select
              value={
                filters.categoryId
              }
              onChange={(event) =>
                updateFilter(
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

          <label
            className={
              styles.filterField
            }
          >
            <span>Receita/Despesa</span>

            <select
              value={
                filters.transactionType
              }
              onChange={(event) =>
                updateFilter(
                  "transactionType",
                  event.target.value as TransactionType | "all",
                )
              }
            >
              <option value="all">
                Ambos
              </option>
              <option value="income">
                Receitas
              </option>
              <option value="expense">
                Despesas
              </option>
            </select>
          </label>

          <label
            className={
              styles.filterField
            }
          >
            <span>Formato</span>

            <select
              value={
                filters.groupType
              }
              onChange={(event) =>
                updateFilter(
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

          <label
            className={
              styles.filterField
            }
          >
            <span>Status</span>

            <select
              value={filters.status}
              onChange={(event) =>
                updateFilter(
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
            className={[
              styles.filterField,
              styles.searchField,
            ].join(" ")}
          >
            <span>Buscar</span>

            <input
              type="search"
              placeholder="Descrição, conta, categoria..."
              value={filters.search}
              onChange={(event) =>
                updateFilter(
                  "search",
                  event.target.value,
                )
              }
            />
          </label>
        </div>

        <div
          className={
            styles.filterFooter
          }
        >
          <span>
            {
              filteredTransactions.length
            }{" "}
            movimentações encontradas
          </span>

          {hasFilters ? (
            <Button
              variant="tertiary"
              size="small"
              onClick={resetFilters}
            >
              Limpar filtros
            </Button>
          ) : null}
        </div>
      </Card>

      <section
        className={
          styles.metricsGrid
        }
      >
        <Card>
          <div className={styles.metric}>
            <span>Receitas</span>

            <strong
              className={styles.income}
            >
              {formatCurrency(
                summary.income,
              )}
            </strong>

            <small
              className={
                incomeChange.className
              }
            >
              {incomeChange.label}
            </small>
          </div>
        </Card>

        <Card>
          <div className={styles.metric}>
            <span>Despesas</span>

            <strong
              className={styles.expense}
            >
              {formatCurrency(
                summary.expense,
              )}
            </strong>

            <small
              className={
                expenseChange.className
              }
            >
              {expenseChange.label}
            </small>
          </div>
        </Card>

        <Card>
          <div className={styles.metric}>
            <span>Resultado</span>

            <strong
              className={
                summary.balance >= 0
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
                balanceChange.className
              }
            >
              {balanceChange.label}
            </small>
          </div>
        </Card>

        <Card>
          <div className={styles.metric}>
            <span>Taxa de sobra</span>

            <strong>
              {formatPercentage(
                summary.savingsRate,
              )}
            </strong>

            <small>
              Quanto restou das receitas
            </small>
          </div>
        </Card>
      </section>

      <section
        className={
          styles.secondaryMetrics
        }
      >
        <Card>
          <div
            className={
              styles.compactMetric
            }
          >
            <span>
              Receita média mensal
            </span>
            <strong>
              {formatCurrency(
                summary
                  .averageMonthlyIncome,
              )}
            </strong>
          </div>
        </Card>

        <Card>
          <div
            className={
              styles.compactMetric
            }
          >
            <span>
              Despesa média mensal
            </span>
            <strong>
              {formatCurrency(
                summary
                  .averageMonthlyExpense,
              )}
            </strong>
          </div>
        </Card>

        <Card>
          <div
            className={
              styles.compactMetric
            }
          >
            <span>Pendentes</span>
            <strong>
              {summary.pendingCount}
            </strong>
          </div>
        </Card>

        <Card>
          <div
            className={
              styles.compactMetric
            }
          >
            <span>Concluídas</span>
            <strong>
              {summary.completedCount}
            </strong>
          </div>
        </Card>
      </section>

      <Card
        title="Evolução mensal"
        description={
          "Receitas, despesas e "
          + "resultado de cada mês."
        }
      >
        <MonthlyComparisonChart
          data={monthlySeries}
        />
      </Card>

      <section
        className={styles.chartGrid}
      >
        <Card
          title="Despesas por categoria"
          description={
            "Participação de cada "
            + "categoria no período."
          }
        >
          <ExpenseDonutChart
            data={categoryTotals}
            emptyMessage={
              "Nenhuma despesa "
              + "encontrada."
            }
          />
        </Card>

        <Card
          title="Despesas por conta"
          description={
            "Onde os gastos estão "
            + "concentrados."
          }
        >
          <HorizontalAmountChart
            data={accountTotals}
            emptyMessage={
              "Nenhuma despesa "
              + "encontrada."
            }
          />
        </Card>
      </section>

      <section
        className={styles.chartGrid}
      >
        <Card
          title="Compromissos por formato"
          description={
            "Avulsas, parcelas e "
            + "recorrências."
          }
        >
          <HorizontalAmountChart
            data={groupTypeTotals}
            emptyMessage={
              "Nenhum compromisso "
              + "encontrado."
            }
          />
        </Card>

        <Card
          title="Maiores despesas"
          description={
            "Os lançamentos de maior "
            + "impacto no período."
          }
        >
          {topExpenses.length === 0 ? (
            <p
              className={
                styles.emptyCard
              }
            >
              Nenhuma despesa encontrada.
            </p>
          ) : (
            <div
              className={
                styles.topExpenseList
              }
            >
              {topExpenses.map(
                (
                  transaction,
                  index,
                ) => (
                  <article
                    className={
                      styles.topExpense
                    }
                    key={transaction.id}
                  >
                    <span
                      className={
                        styles.position
                      }
                    >
                      {index + 1}
                    </span>

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
                        }{" "}
                        ·{" "}
                        {
                          transaction
                            .account_name
                        }
                      </span>
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
      </section>

      <Card
        title="Movimentações analisadas"
        description={
          "Detalhamento dos dados "
          + "que compõem o relatório."
        }
      >
        {filteredTransactions.length
        === 0 ? (
          <PageState
            title="Nenhum dado no período"
            description={
              "Altere o período ou "
              + "os filtros para "
              + "encontrar movimentações."
            }
          />
        ) : (
          <div
            className={
              styles.tableWrapper
            }
          >
            <table
              className={styles.table}
            >
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Formato</th>
                  <th>Conta</th>
                  <th>Categoria</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Valor</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions
                  .slice(0, 100)
                  .map(
                    (transaction) => (
                      <tr
                        key={
                          transaction.id
                        }
                      >
                        <td>
                          <div
                            className={
                              styles
                                .descriptionCell
                            }
                          >
                            <strong>
                              {
                                transaction
                                  .description
                              }
                            </strong>

                            <span>
                              {transaction
                                .transaction_type
                                === "income"
                                ? "Receita"
                                : "Despesa"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div
                            className={
                              styles
                                .descriptionCell
                            }
                          >
                            <strong>
                              {groupTypeLabel(
                                transaction
                                  .group_type,
                              )}
                            </strong>

                            {transaction
                              .group_type
                            !== "single" ? (
                              <span>
                                {
                                  transaction
                                    .sequence_number
                                }{" "}
                                de{" "}
                                {
                                  transaction
                                    .total_occurrences
                                }
                              </span>
                            ) : null}
                          </div>
                        </td>

                        <td>
                          {
                            transaction
                              .account_name
                          }
                        </td>

                        <td>
                          {
                            transaction
                              .category_name
                            ?? "Sem categoria"
                          }
                        </td>

                        <td>
                          {formatDate(
                            transaction
                              .due_date,
                          )}
                        </td>

                        <td>
                          {statusLabel(
                            transaction.status,
                          )}
                        </td>

                        <td
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
                        </td>
                      </tr>
                    ),
                  )}
              </tbody>
            </table>

            {filteredTransactions.length
            > 100 ? (
              <p
                className={
                  styles.tableNotice
                }
              >
                Exibindo as primeiras
                100 movimentações. O CSV
                contém todos os resultados.
              </p>
            ) : null}
          </div>
        )}
      </Card>
    </div>
  );
}
