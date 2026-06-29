import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router";

import { Badge } from "../../components/Badge";
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
  Transaction,
  TransactionStatus,
} from "../../types/transactions";
import { formatCurrency } from "../../utils/currency";

import styles from "./styles.module.css";

type BreakdownItem = {
  id: string;
  label: string;
  value: number;
  percentage: number;
};

function startOfMonth(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function endOfMonth(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth() + 1, 0);
}

function formatMonth(value: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR").format(
    new Date(`${value}T12:00:00`),
  );
}

function isSameOrBeforeToday(value: string): boolean {
  const today = new Date();
  const target = new Date(`${value}T23:59:59`);
  return target <= today;
}

function getStatusVariant(
  status: TransactionStatus,
): "positive" | "negative" | "warning" {
  if (status === "completed") {
    return "positive";
  }

  if (status === "cancelled") {
    return "negative";
  }

  return "warning";
}

export function HomePage() {
  const navigate = useNavigate();

  const [referenceDate, setReferenceDate] = useState(
    startOfMonth(new Date()),
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accountFilter, setAccountFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">(
    "all",
  );
  const [breakdownMode, setBreakdownMode] =
    useState<"category" | "account">("category");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [transactionsData, accountsData, categoriesData] =
        await Promise.all([
          transactionService.listTransactions({
            limit: 100,
          }),
          accountService.list(),
          categoryService.list(),
        ]);

      setTransactions(transactionsData);
      setAccounts(accountsData);
      setCategories(categoriesData);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível carregar a Home.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);

  const monthTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const dueDate = new Date(`${transaction.due_date}T12:00:00`);

        const belongsToMonth =
          dueDate >= monthStart && dueDate <= monthEnd;

        const belongsToAccount =
          accountFilter === "all" ||
          transaction.account_id === accountFilter;

        const belongsToStatus =
          statusFilter === "all" ||
          transaction.status === statusFilter;

        return (
          belongsToMonth &&
          belongsToAccount &&
          belongsToStatus
        );
      }),
    [
      accountFilter,
      monthEnd,
      monthStart,
      statusFilter,
      transactions,
    ],
  );

  const activeTransactions = useMemo(
    () =>
      monthTransactions.filter(
        (transaction) => transaction.status !== "cancelled",
      ),
    [monthTransactions],
  );

  const income = useMemo(
    () =>
      activeTransactions
        .filter(
          (transaction) =>
            transaction.transaction_type === "income",
        )
        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount),
          0,
        ),
    [activeTransactions],
  );

  const expense = useMemo(
    () =>
      activeTransactions
        .filter(
          (transaction) =>
            transaction.transaction_type === "expense",
        )
        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount),
          0,
        ),
    [activeTransactions],
  );

  const completedIncome = useMemo(
    () =>
      activeTransactions
        .filter(
          (transaction) =>
            transaction.transaction_type === "income" &&
            transaction.status === "completed",
        )
        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount),
          0,
        ),
    [activeTransactions],
  );

  const completedExpense = useMemo(
    () =>
      activeTransactions
        .filter(
          (transaction) =>
            transaction.transaction_type === "expense" &&
            transaction.status === "completed",
        )
        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount),
          0,
        ),
    [activeTransactions],
  );

  const overdue = useMemo(
    () =>
      activeTransactions.filter(
        (transaction) =>
          transaction.status === "pending" &&
          isSameOrBeforeToday(transaction.due_date),
      ),
    [activeTransactions],
  );

  const pending = useMemo(
    () =>
      activeTransactions.filter(
        (transaction) =>
          transaction.status === "pending",
      ),
    [activeTransactions],
  );

  const result = income - expense;
  const completedResult = completedIncome - completedExpense;

  const breakdown = useMemo<BreakdownItem[]>(() => {
    const totals = new Map<string, number>();

    activeTransactions
      .filter(
        (transaction) =>
          transaction.transaction_type === "expense",
      )
      .forEach((transaction) => {
        const key =
          breakdownMode === "category"
            ? transaction.category_id ?? "uncategorized"
            : transaction.account_id;

        totals.set(
          key,
          (totals.get(key) ?? 0) + Number(transaction.amount),
        );
      });

    const getLabel = (id: string): string => {
      if (id === "uncategorized") {
        return "Sem categoria";
      }

      if (breakdownMode === "category") {
        return (
          categories.find((category) => category.id === id)?.name ??
          "Categoria removida"
        );
      }

      return (
        accounts.find((account) => account.id === id)?.name ??
        "Conta removida"
      );
    };

    const maximum = Math.max(...totals.values(), 1);

    return [...totals.entries()]
      .map(([id, value]) => ({
        id,
        label: getLabel(id),
        value,
        percentage: (value / maximum) * 100,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [
    accounts,
    activeTransactions,
    breakdownMode,
    categories,
  ]);

  const nextTransactions = useMemo(
    () =>
      [...activeTransactions]
        .filter(
          (transaction) =>
            transaction.status === "pending",
        )
        .sort((a, b) =>
          a.due_date.localeCompare(b.due_date),
        )
        .slice(0, 8),
    [activeTransactions],
  );

  function changeMonth(offset: number) {
    setReferenceDate(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + offset,
          1,
        ),
    );
  }

  if (isLoading) {
    return (
      <Card>
        <PageState
          title="Organizando seu mês"
          description="Carregando movimentações, contas e categorias."
        />
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <PageState
          title="Não foi possível carregar a Home"
          description={error}
          actionLabel="Tentar novamente"
          onAction={() => void loadData()}
        />
      </Card>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>Visão financeira</span>
          <h1>Seu mês em equilíbrio</h1>
          <p>
            Acompanhe o que entra, o que sai e o que ainda precisa de atenção.
          </p>
        </div>

        <Button onClick={() => navigate("/transactions/new")}>
          Nova movimentação
        </Button>
      </header>

      <section className={styles.controls}>
        <div className={styles.monthSelector}>
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Mês anterior"
          >
            ‹
          </button>

          <strong>{formatMonth(referenceDate)}</strong>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Próximo mês"
          >
            ›
          </button>
        </div>

        <div className={styles.filters}>
          <label>
            <span>Conta</span>
            <select
              value={accountFilter}
              onChange={(event) =>
                setAccountFilter(event.target.value)
              }
            >
              <option value="all">Todas as contas</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as TransactionStatus | "all",
                )
              }
            >
              <option value="all">Todos</option>
              <option value="pending">Pendentes</option>
              <option value="completed">Concluídas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </label>
        </div>
      </section>

      <section className={styles.metricsGrid}>
        <Card>
          <div className={styles.metric}>
            <span>Receitas previstas</span>
            <strong className={styles.income}>
              {formatCurrency(income)}
            </strong>
            <small>
              {formatCurrency(completedIncome)} concluídos
            </small>
          </div>
        </Card>

        <Card>
          <div className={styles.metric}>
            <span>Despesas previstas</span>
            <strong className={styles.expense}>
              {formatCurrency(expense)}
            </strong>
            <small>
              {formatCurrency(completedExpense)} concluídos
            </small>
          </div>
        </Card>

        <Card>
          <div className={styles.metric}>
            <span>Resultado previsto</span>
            <strong
              className={
                result >= 0 ? styles.income : styles.expense
              }
            >
              {formatCurrency(result)}
            </strong>
            <small>
              Resultado realizado: {formatCurrency(completedResult)}
            </small>
          </div>
        </Card>

        <Card>
          <div className={styles.metric}>
            <span>Pendências</span>
            <strong>{pending.length}</strong>
            <small>{overdue.length} vencidas ou vencendo hoje</small>
          </div>
        </Card>
      </section>

      {overdue.length > 0 ? (
        <section className={styles.alert}>
          <div>
            <strong>
              {overdue.length} movimentação
              {overdue.length > 1 ? "ões" : ""} precisa
              {overdue.length === 1 ? "" : "m"} de atenção
            </strong>
            <p>
              Existem valores pendentes com data prevista até hoje.
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={() => navigate("/transactions")}
          >
            Ver movimentações
          </Button>
        </section>
      ) : null}

      <section className={styles.contentGrid}>
        <Card
          title="Despesas do mês"
          description="Veja onde o dinheiro está concentrado."
        >
          <div className={styles.breakdownHeader}>
            <div className={styles.breakdownTabs}>
              <button
                type="button"
                className={
                  breakdownMode === "category"
                    ? styles.tabActive
                    : ""
                }
                onClick={() => setBreakdownMode("category")}
              >
                Categorias
              </button>

              <button
                type="button"
                className={
                  breakdownMode === "account"
                    ? styles.tabActive
                    : ""
                }
                onClick={() => setBreakdownMode("account")}
              >
                Contas
              </button>
            </div>
          </div>

          {breakdown.length === 0 ? (
            <PageState
              title="Sem despesas neste período"
              description="Os gastos aparecerão aqui quando forem registrados."
            />
          ) : (
            <div className={styles.breakdownList}>
              {breakdown.map((item) => (
                <div className={styles.breakdownItem} key={item.id}>
                  <div className={styles.breakdownLabel}>
                    <span>{item.label}</span>
                    <strong>{formatCurrency(item.value)}</strong>
                  </div>

                  <div className={styles.barTrack}>
                    <div
                      className={styles.barValue}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card
          title="Próximos compromissos"
          description="Pendências ordenadas pela data prevista."
        >
          {nextTransactions.length === 0 ? (
            <PageState
              title="Nenhuma pendência"
              description="Seu mês está sem compromissos pendentes."
            />
          ) : (
            <div className={styles.upcomingList}>
              {nextTransactions.map((transaction) => (
                <article
                  className={styles.upcomingItem}
                  key={transaction.id}
                >
                  <div>
                    <strong>{transaction.description}</strong>
                    <span>{formatDate(transaction.due_date)}</span>
                  </div>

                  <div className={styles.upcomingValue}>
                    <strong
                      className={
                        transaction.transaction_type === "income"
                          ? styles.income
                          : styles.expense
                      }
                    >
                      {transaction.transaction_type === "income"
                        ? "+ "
                        : "− "}
                      {formatCurrency(transaction.amount)}
                    </strong>

                    <Badge
                      variant={getStatusVariant(transaction.status)}
                    >
                      Pendente
                    </Badge>
                  </div>
                </article>
              ))}
            </div>
          )}

          {nextTransactions.length > 0 ? (
            <div className={styles.cardAction}>
              <Button
                variant="tertiary"
                onClick={() => navigate("/transactions")}
              >
                Ver todas
              </Button>
            </div>
          ) : null}
        </Card>
      </section>

      <Card
        title="Movimentações do mês"
        description="Resumo dos lançamentos do período selecionado."
      >
        {monthTransactions.length === 0 ? (
          <PageState
            title="Nenhuma movimentação"
            description="Registre uma receita ou despesa para começar."
            actionLabel="Nova movimentação"
            onAction={() => navigate("/transactions/new")}
          />
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Valor</th>
                </tr>
              </thead>

              <tbody>
                {monthTransactions.slice(0, 10).map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <div className={styles.descriptionCell}>
                        <strong>{transaction.description}</strong>
                        <span>
                          {transaction.transaction_type === "income"
                            ? "Receita"
                            : "Despesa"}
                        </span>
                      </div>
                    </td>

                    <td>{formatDate(transaction.due_date)}</td>

                    <td>
                      <Badge
                        variant={getStatusVariant(transaction.status)}
                      >
                        {transaction.status === "completed"
                          ? "Concluída"
                          : transaction.status === "cancelled"
                            ? "Cancelada"
                            : "Pendente"}
                      </Badge>
                    </td>

                    <td
                      className={
                        transaction.transaction_type === "income"
                          ? styles.income
                          : styles.expense
                      }
                    >
                      {transaction.transaction_type === "income"
                        ? "+ "
                        : "− "}
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
