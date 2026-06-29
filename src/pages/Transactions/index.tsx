import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
} from "react-router";

import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { PageState } from "../../components/PageState";
import { ApiError } from "../../services/api";
import { transactionService } from "../../services/transactionService";
import type {
  Transaction,
  TransactionStatus,
} from "../../types/transactions";
import { formatCurrency } from "../../utils/currency";

import styles from "./styles.module.css";

type LocationState = {
  successMessage?: string;
};

const statusLabels: Record<TransactionStatus, string> = {
  pending: "Pendente",
  completed: "Concluída",
  cancelled: "Cancelada",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR").format(
    new Date(`${value}T12:00:00`),
  );
}

export function TransactionsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statusFilter, setStatusFilter] =
    useState<TransactionStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const state = location.state as LocationState | null;

  const filteredTransactions = useMemo(
    () =>
      statusFilter === "all"
        ? transactions
        : transactions.filter(
          (transaction) =>
            transaction.status === statusFilter,
        ),
    [statusFilter, transactions],
  );

  const loadTransactions = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const data = await transactionService.listTransactions({
        limit: 100,
      });
      setTransactions(data);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível carregar as movimentações.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    if (state?.successMessage) {
      window.history.replaceState(
        {},
        document.title,
        location.pathname,
      );
    }
  }, [location.pathname, state?.successMessage]);

  async function updateStatus(
    transaction: Transaction,
    status: TransactionStatus,
  ) {
    setUpdatingId(transaction.id);

    try {
      const updated = await transactionService.updateStatus(
        transaction.id,
        status,
      );

      setTransactions((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item,
        ),
      );
    } catch (caughtError) {
      window.alert(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível atualizar a movimentação.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>Histórico</span>
          <h1>Movimentações</h1>
          <p>
            Consulte e acompanhe receitas e despesas.
          </p>
        </div>

        <Button onClick={() => navigate("/transactions/new")}>
          Nova movimentação
        </Button>
      </header>

      {state?.successMessage ? (
        <div className={styles.successMessage}>
          {state.successMessage}
        </div>
      ) : null}

      <Card>
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            {(
              [
                ["all", "Todas"],
                ["pending", "Pendentes"],
                ["completed", "Concluídas"],
                ["cancelled", "Canceladas"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={
                  statusFilter === value
                    ? styles.filterActive
                    : ""
                }
                onClick={() => setStatusFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <span className={styles.count}>
            {filteredTransactions.length} movimentações
          </span>
        </div>

        {isLoading ? (
          <PageState
            title="Carregando movimentações"
            description="Buscando seu histórico financeiro."
          />
        ) : error ? (
          <PageState
            title="Não foi possível carregar"
            description={error}
            actionLabel="Tentar novamente"
            onAction={() => void loadTransactions()}
          />
        ) : filteredTransactions.length === 0 ? (
          <PageState
            title="Nenhuma movimentação encontrada"
            description="Crie uma movimentação ou altere o filtro."
            actionLabel="Nova movimentação"
            onAction={() => navigate("/transactions/new")}
          />
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Data prevista</th>
                  <th>Status</th>
                  <th>Valor</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <div className={styles.descriptionCell}>
                        <button
                          type="button"
                          className={styles.transactionLink}
                          onClick={() =>
                            navigate(`/transactions/${transaction.id}`)
                          }
                        >
                          <strong>{transaction.description}</strong>
                          <span>
                            {transaction.transaction_type === "expense"
                              ? "Despesa"
                              : "Receita"}
                          </span>
                        </button>
                      </div>
                    </td>

                    <td>{formatDate(transaction.due_date)}</td>

                    <td>
                      <Badge
                        variant={
                          transaction.status === "completed"
                            ? "positive"
                            : transaction.status === "cancelled"
                              ? "negative"
                              : "warning"
                        }
                      >
                        {statusLabels[transaction.status]}
                      </Badge>
                    </td>

                    <td
                      className={
                        transaction.transaction_type === "expense"
                          ? styles.expense
                          : styles.income
                      }
                    >
                      {transaction.transaction_type === "expense"
                        ? "− "
                        : "+ "}
                      {formatCurrency(transaction.amount)}
                    </td>

                    <td>
                      <div className={styles.actions}>
                        {transaction.status !== "completed" ? (
                          <Button
                            variant="tertiary"
                            size="small"
                            isLoading={updatingId === transaction.id}
                            onClick={() =>
                              void updateStatus(
                                transaction,
                                "completed",
                              )
                            }
                          >
                            Concluir
                          </Button>
                        ) : (
                          <Button
                            variant="tertiary"
                            size="small"
                            isLoading={updatingId === transaction.id}
                            onClick={() =>
                              void updateStatus(
                                transaction,
                                "pending",
                              )
                            }
                          >
                            Reabrir
                          </Button>
                        )}

                        {transaction.status !== "cancelled" ? (
                          <Button
                            variant="tertiary"
                            size="small"
                            disabled={updatingId === transaction.id}
                            onClick={() =>
                              void updateStatus(
                                transaction,
                                "cancelled",
                              )
                            }
                          >
                            Cancelar
                          </Button>
                        ) : null}
                      </div>
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
