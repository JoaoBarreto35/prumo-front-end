import {
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router";

import { ApiError } from "../../services/api";
import { transactionCrudService } from "../../services/transactionCrudService";
import { transactionService } from "../../services/transactionService";
import type {
  Transaction,
  TransactionStatus,
} from "../../types/transactions";
import type {
  TransactionEditScope,
} from "../../types/transactionCrud";
import { formatCurrency } from "../../utils/currency";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Modal } from "../Modal";

import styles from "./styles.module.css";


type TransactionTableProps = {
  transactions: Transaction[];
  onChanged: () => void | Promise<void>;
};


const statusLabels: Record<
  TransactionStatus,
  string
> = {
  pending: "Pendente",
  completed: "Concluída",
  cancelled: "Cancelada",
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


function getGroupLabel(
  transaction: Transaction,
): string {
  if (
    transaction.group_type === "installment"
  ) {
    return "Parcelada";
  }

  if (
    transaction.group_type === "recurring"
  ) {
    return "Recorrente";
  }

  return "Avulsa";
}


function getSequenceLabel(
  transaction: Transaction,
): string | null {
  if (
    transaction.group_type === "installment"
  ) {
    return (
      `Parcela ${transaction.sequence_number}` +
      ` de ${transaction.total_occurrences}`
    );
  }

  // if (
  //   transaction.group_type === "recurring"
  // ) {
  //   return (
  //     `Ocorrência ${transaction.sequence_number}` +
  //     ` de ${transaction.total_occurrences}`
  //   );
  // }

  return null;
}


export function TransactionTable({
  transactions,
  onChanged,
}: TransactionTableProps) {
  const navigate = useNavigate();

  const [
    actionTransactionId,
    setActionTransactionId,
  ] = useState<string | null>(null);

  const [
    deleteTransaction,
    setDeleteTransaction,
  ] = useState<Transaction | null>(null);

  const [
    deleteScope,
    setDeleteScope,
  ] = useState<TransactionEditScope>(
    "single",
  );

  const [isDeleting, setIsDeleting] =
    useState(false);

  const deleteScopeOptions = useMemo(
    () => {
      if (!deleteTransaction) {
        return [];
      }

      if (
        deleteTransaction.group_type
        === "single"
      ) {
        return [
          {
            value: "single" as const,
            title: "Excluir movimentação",
            description:
              "Remove este lançamento definitivamente.",
          },
        ];
      }

      const itemName =
        deleteTransaction.group_type
        === "installment"
          ? "parcela"
          : "ocorrência";

      const groupName =
        deleteTransaction.group_type
        === "installment"
          ? "parcelamento"
          : "recorrência";

      return [
        {
          value: "single" as const,
          title: `Somente esta ${itemName}`,
          description:
            "As demais permanecem sem alteração.",
        },
        {
          value:
            "this_and_following" as const,
          title: "Esta e as próximas",
          description:
            "Mantém apenas as anteriores.",
        },
        {
          value: "entire_group" as const,
          title: `Todo o ${groupName}`,
          description:
            "Remove todas as ocorrências do grupo.",
        },
      ];
    },
    [deleteTransaction],
  );


  async function changeStatus(
    transaction: Transaction,
    status: TransactionStatus,
  ) {
    setActionTransactionId(
      transaction.id,
    );

    try {
      await transactionService.updateStatus(
        transaction.id,
        status,
      );

      await onChanged();
    } catch (caughtError) {
      window.alert(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível atualizar a movimentação.",
      );
    } finally {
      setActionTransactionId(null);
    }
  }


  function openDeleteModal(
    transaction: Transaction,
  ) {
    setDeleteTransaction(transaction);
    setDeleteScope("single");
  }


  function closeDeleteModal() {
    if (isDeleting) {
      return;
    }

    setDeleteTransaction(null);
    setDeleteScope("single");
  }


  async function confirmDelete() {
    if (!deleteTransaction) {
      return;
    }

    setIsDeleting(true);

    try {
      await transactionCrudService.remove(
        deleteTransaction.id,
        deleteScope,
      );

      setDeleteTransaction(null);
      setDeleteScope("single");
      await onChanged();
    } catch (caughtError) {
      window.alert(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível excluir a movimentação.",
      );
    } finally {
      setIsDeleting(false);
    }
  }


  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Tipo</th>
              <th>Conta</th>
              <th>Data prevista</th>
              <th>Status</th>
              <th>Valor</th>
              <th aria-label="Ações" />
            </tr>
          </thead>

          <tbody>
            {transactions.map(
              (transaction) => {
                const sequenceLabel =
                  getSequenceLabel(
                    transaction,
                  );

                const isRunning =
                  actionTransactionId
                  === transaction.id;

                return (
                  <tr key={transaction.id}>
                    <td>
                      <button
                        type="button"
                        className={
                          styles.transactionLink
                        }
                        onClick={() =>
                          navigate(
                            `/transactions/${transaction.id}`,
                          )
                        }
                      >
                        <strong>
                          {transaction.description}
                        </strong>

                        <span>
                          {transaction.category_name
                            ?? "Sem categoria"}
                        </span>
                      </button>
                    </td>

                    <td>
                      <div
                        className={
                          styles.typeCell
                        }
                      >
                        <Badge variant="info">
                          {getGroupLabel(
                            transaction,
                          )}
                        </Badge>

                        {sequenceLabel ? (
                          <span>
                            {sequenceLabel}
                          </span>
                        ) : null}

                        {!transaction.is_group_active
                        && transaction.group_type
                          !== "single" ? (
                          <span
                            className={
                              styles.inactiveLabel
                            }
                          >
                            Grupo inativo
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td>
                      <div
                        className={
                          styles.accountCell
                        }
                      >
                        <strong>
                          {transaction.account_name}
                        </strong>
                        <span>
                          {transaction.transaction_type
                            === "income"
                            ? "Receita"
                            : "Despesa"}
                        </span>
                      </div>
                    </td>

                    <td>
                      {formatDate(
                        transaction.due_date,
                      )}
                    </td>

                    <td>
                      <Badge
                        variant={getStatusVariant(
                          transaction.status,
                        )}
                      >
                        {
                          statusLabels[
                            transaction.status
                          ]
                        }
                      </Badge>
                    </td>

                    <td
                      className={
                        transaction.transaction_type
                        === "income"
                          ? styles.income
                          : styles.expense
                      }
                    >
                      {transaction.transaction_type
                      === "income"
                        ? "+ "
                        : "− "}

                      {formatCurrency(
                        transaction.amount,
                      )}
                    </td>

                    <td>
                      <div
                        className={
                          styles.actions
                        }
                      >
                        <Button
                          type="button"
                          variant="tertiary"
                          size="small"
                          disabled={isRunning}
                          onClick={() =>
                            navigate(
                              `/transactions/${transaction.id}/edit`,
                            )
                          }
                        >
                          Editar
                        </Button>

                        <Button
                          type="button"
                          variant="tertiary"
                          size="small"
                          isLoading={isRunning}
                          onClick={() =>
                            void changeStatus(
                              transaction,
                              transaction.status
                              === "pending"
                                ? "completed"
                                : "pending",
                            )
                          }
                        >
                          {transaction.status
                          === "pending"
                            ? "Concluir"
                            : "Reabrir"}
                        </Button>

                        {transaction.status
                        === "pending" ? (
                          <Button
                            type="button"
                            variant="tertiary"
                            size="small"
                            disabled={isRunning}
                            onClick={() =>
                              void changeStatus(
                                transaction,
                                "cancelled",
                              )
                            }
                          >
                            Cancelar
                          </Button>
                        ) : null}

                        <Button
                          type="button"
                          variant="danger"
                          size="small"
                          disabled={isRunning}
                          onClick={() =>
                            openDeleteModal(
                              transaction,
                            )
                          }
                        >
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>

      <Modal
        title="Excluir movimentação"
        description={
          deleteTransaction
            ? deleteTransaction.description
            : undefined
        }
        isOpen={Boolean(
          deleteTransaction,
        )}
        onClose={closeDeleteModal}
      >
        {deleteTransaction ? (
          <div className={styles.deleteContent}>
            <div className={styles.warning}>
              Esta ação é definitiva. Escolha
              cuidadosamente o alcance da exclusão.
            </div>

            <div
              className={
                styles.scopeOptions
              }
            >
              {deleteScopeOptions.map(
                (option) => (
                  <label
                    className={[
                      styles.scopeOption,
                      deleteScope
                      === option.value
                        ? styles.scopeOptionActive
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={option.value}
                  >
                    <input
                      type="radio"
                      name="delete-scope"
                      value={option.value}
                      checked={
                        deleteScope
                        === option.value
                      }
                      onChange={() =>
                        setDeleteScope(
                          option.value,
                        )
                      }
                    />

                    <span>
                      <strong>
                        {option.title}
                      </strong>
                      <small>
                        {option.description}
                      </small>
                    </span>
                  </label>
                ),
              )}
            </div>

            <div
              className={
                styles.deleteActions
              }
            >
              <Button
                type="button"
                variant="secondary"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Voltar
              </Button>

              <Button
                type="button"
                variant="danger"
                isLoading={isDeleting}
                onClick={() =>
                  void confirmDelete()
                }
              >
                Confirmar exclusão
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
