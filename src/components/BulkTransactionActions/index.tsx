import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { ApiError } from "../../services/api";
import {
  dispatchNotificationRefresh,
} from "../../services/notificationService";
import {
  transactionBulkService,
} from "../../services/transactionBulkService";
import type {
  BulkTransactionAction,
  BulkTransactionPreview,
  BulkTransactionRequest,
  BulkTransactionScope,
} from "../../types/transactionBulk";
import type {
  Transaction,
} from "../../types/transactions";
import {
  formatCurrency,
} from "../../utils/currency";
import { Button } from "../Button";
import { Modal } from "../Modal";

import styles from "./styles.module.css";


type BulkTransactionActionsProps = {
  transactions?: Transaction[];
  onChanged:
    () => void | Promise<void>;
  triggerLabel?: string;
  defaultReferenceMonth?: string;
  initialScope?: BulkTransactionScope;
  buttonVariant?:
    | "primary"
    | "secondary"
    | "tertiary";
};


const scopeContent:
  Record<
    BulkTransactionScope,
    {
      label: string;
      description: string;
    }
  > = {
    selected: {
      label: "Selecionar manualmente",
      description:
        "Escolha movimentações da lista atual.",
    },
    month: {
      label: "Mês específico",
      description:
        "Altera todas as candidatas do mês.",
    },
    past_due: {
      label: "Vencidas até hoje",
      description:
        "Inclui datas anteriores e o dia atual.",
    },
    until_date: {
      label: "Até uma data",
      description:
        "Inclui tudo até a data-limite.",
    },
  };


function todayInput(): string {
  return new Date()
    .toISOString()
    .slice(0, 10);
}


function currentMonthInput(): string {
  return todayInput().slice(0, 7);
}


function toReferenceMonth(
  value: string,
): string | null {
  if (!value) {
    return null;
  }

  return `${value}-01`;
}


function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
  ).format(
    new Date(
      `${value}T12:00:00`,
    ),
  );
}


function formatMonth(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      month: "long",
      year: "numeric",
    },
  ).format(
    new Date(
      `${value.slice(0, 7)}-01T12:00:00`,
    ),
  );
}


export function BulkTransactionActions({
  transactions = [],
  onChanged,
  triggerLabel = "Ações em massa",
  defaultReferenceMonth,
  initialScope = "month",
  buttonVariant = "secondary",
}: BulkTransactionActionsProps) {
  const [isOpen, setIsOpen] =
    useState(false);

  const [action, setAction] =
    useState<
      BulkTransactionAction
    >("complete");

  const [scope, setScope] =
    useState<
      BulkTransactionScope
    >(initialScope);

  const [month, setMonth] =
    useState(
      defaultReferenceMonth
        ?.slice(0, 7)
      ?? currentMonthInput(),
    );

  const [untilDate, setUntilDate] =
    useState(todayInput());

  const [
    completionDate,
    setCompletionDate,
  ] = useState(todayInput());

  const [
    selectedIds,
    setSelectedIds,
  ] = useState<Set<string>>(
    new Set(),
  );

  const [preview, setPreview] =
    useState<
      BulkTransactionPreview | null
    >(null);

  const [
    confirmClosedMonths,
    setConfirmClosedMonths,
  ] = useState(false);

  const [isPreviewing, setIsPreviewing] =
    useState(false);

  const [isApplying, setIsApplying] =
    useState(false);

  const [error, setError] =
    useState("");


  const eligibleTransactions =
    useMemo(
      () =>
        transactions.filter(
          (transaction) =>
            action === "complete"
              ? transaction.status
                === "pending"
              : transaction.status
                === "completed",
        ),
      [
        action,
        transactions,
      ],
    );


  useEffect(() => {
    setSelectedIds(
      new Set(),
    );
    setPreview(null);
    setConfirmClosedMonths(
      false,
    );
    setError("");
  }, [
    action,
    scope,
  ]);


  useEffect(() => {
    if (
      defaultReferenceMonth
    ) {
      setMonth(
        defaultReferenceMonth
          .slice(0, 7),
      );
    }
  }, [
    defaultReferenceMonth,
  ]);


  function closeModal() {
    if (
      isApplying
      || isPreviewing
    ) {
      return;
    }

    setIsOpen(false);
    setPreview(null);
    setError("");
    setConfirmClosedMonths(
      false,
    );
  }


  function toggleSelected(
    transactionId: string,
  ) {
    setPreview(null);

    setSelectedIds(
      (current) => {
        const next =
          new Set(current);

        if (
          next.has(
            transactionId,
          )
        ) {
          next.delete(
            transactionId,
          );
        } else {
          next.add(
            transactionId,
          );
        }

        return next;
      },
    );
  }


  function selectAllEligible() {
    setPreview(null);

    setSelectedIds(
      new Set(
        eligibleTransactions
          .map(
            (transaction) =>
              transaction.id,
          ),
      ),
    );
  }


  function buildPayload():
    BulkTransactionRequest {
    return {
      action,
      scope,
      transaction_ids:
        scope === "selected"
          ? [...selectedIds]
          : [],
      reference_month:
        scope === "month"
          ? toReferenceMonth(
              month,
            )
          : null,
      until_date:
        scope === "until_date"
          ? untilDate
          : null,
      completion_date:
        action === "complete"
          ? completionDate
          : null,
    };
  }


  async function loadPreview() {
    setIsPreviewing(true);
    setError("");
    setPreview(null);
    setConfirmClosedMonths(
      false,
    );

    try {
      const result =
        await transactionBulkService
          .preview(
            buildPayload(),
          );

      setPreview(result);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível calcular a prévia.",
      );
    } finally {
      setIsPreviewing(false);
    }
  }


  async function applyAction() {
    if (!preview) {
      return;
    }

    if (
      preview
        .requires_closed_month_confirmation
      && !confirmClosedMonths
    ) {
      setError(
        "Confirme que está ciente dos meses fechados afetados.",
      );
      return;
    }

    setIsApplying(true);
    setError("");

    try {
      const result =
        await transactionBulkService
          .apply({
            ...buildPayload(),
            confirm_closed_months:
              confirmClosedMonths,
          });

      window.alert(
        result.message,
      );

      dispatchNotificationRefresh();
      await onChanged();

      setIsOpen(false);
      setPreview(null);
      setSelectedIds(
        new Set(),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível aplicar a ação em massa.",
      );
    } finally {
      setIsApplying(false);
    }
  }


  return (
    <>
      <Button
        variant={buttonVariant}
        onClick={() =>
          setIsOpen(true)
        }
      >
        {triggerLabel}
      </Button>

      <Modal
        title="Ações em massa"
        description={
          "Revise a prévia antes "
          + "de alterar as movimentações."
        }
        isOpen={isOpen}
        onClose={closeModal}
      >
        <div
          className={styles.content}
        >
          {error ? (
            <div
              className={styles.error}
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <section
            className={
              styles.actionSwitch
            }
          >
            <button
              type="button"
              className={
                action === "complete"
                  ? styles.active
                  : ""
              }
              onClick={() =>
                setAction(
                  "complete",
                )
              }
            >
              Concluir
            </button>

            <button
              type="button"
              className={
                action === "reopen"
                  ? styles.active
                  : ""
              }
              onClick={() =>
                setAction(
                  "reopen",
                )
              }
            >
              Reabrir
            </button>
          </section>

          <section
            className={
              styles.scopeGrid
            }
          >
            {(
              Object.entries(
                scopeContent,
              ) as Array<
                [
                  BulkTransactionScope,
                  {
                    label: string;
                    description:
                      string;
                  },
                ]
              >
            ).map(
              ([
                value,
                content,
              ]) => (
                <button
                  type="button"
                  key={value}
                  className={
                    scope === value
                      ? styles
                          .scopeActive
                      : styles.scope
                  }
                  disabled={
                    value === "selected"
                    && transactions.length
                    === 0
                  }
                  onClick={() =>
                    setScope(value)
                  }
                >
                  <strong>
                    {content.label}
                  </strong>

                  <span>
                    {
                      content
                        .description
                    }
                  </span>
                </button>
              ),
            )}
          </section>

          {scope === "month" ? (
            <label
              className={styles.field}
            >
              <span>Mês</span>
              <input
                type="month"
                value={month}
                onChange={(event) => {
                  setMonth(
                    event.target.value,
                  );
                  setPreview(null);
                }}
              />
            </label>
          ) : null}

          {scope
          === "until_date" ? (
            <label
              className={styles.field}
            >
              <span>
                Data-limite
              </span>
              <input
                type="date"
                value={untilDate}
                onChange={(event) => {
                  setUntilDate(
                    event.target.value,
                  );
                  setPreview(null);
                }}
              />
            </label>
          ) : null}

          {action === "complete" ? (
            <label
              className={styles.field}
            >
              <span>
                Data da conclusão
              </span>
              <input
                type="date"
                value={completionDate}
                onChange={(event) => {
                  setCompletionDate(
                    event.target.value,
                  );
                  setPreview(null);
                }}
              />
            </label>
          ) : null}

          {scope === "selected" ? (
            <section
              className={
                styles.selection
              }
            >
              <header>
                <div>
                  <strong>
                    Seleção manual
                  </strong>

                  <span>
                    {
                      selectedIds.size
                    }{" "}
                    selecionadas
                  </span>
                </div>

                <button
                  type="button"
                  onClick={
                    selectAllEligible
                  }
                >
                  Selecionar todas
                </button>
              </header>

              {eligibleTransactions
                .length === 0 ? (
                <p
                  className={
                    styles.empty
                  }
                >
                  Nenhuma movimentação
                  elegível na lista atual.
                </p>
              ) : (
                <div
                  className={
                    styles.selectionList
                  }
                >
                  {eligibleTransactions
                    .slice(0, 500)
                    .map(
                      (transaction) => (
                        <label
                          key={
                            transaction.id
                          }
                        >
                          <input
                            type="checkbox"
                            checked={
                              selectedIds
                                .has(
                                  transaction.id,
                                )
                            }
                            onChange={() =>
                              toggleSelected(
                                transaction.id,
                              )
                            }
                          />

                          <span>
                            <strong>
                              {
                                transaction
                                  .description
                              }
                            </strong>

                            <small>
                              {formatDate(
                                transaction
                                  .due_date,
                              )}
                              {" · "}
                              {
                                transaction
                                  .account_name
                              }
                            </small>
                          </span>

                          <strong
                            className={
                              transaction
                                .transaction_type
                              === "income"
                                ? styles
                                    .positive
                                : styles
                                    .negative
                            }
                          >
                            {formatCurrency(
                              transaction
                                .amount,
                            )}
                          </strong>
                        </label>
                      ),
                    )}
                </div>
              )}
            </section>
          ) : null}

          <div
            className={
              styles.previewAction
            }
          >
            <Button
              variant="secondary"
              isLoading={
                isPreviewing
              }
              disabled={
                scope === "selected"
                && selectedIds.size
                === 0
              }
              onClick={() =>
                void loadPreview()
              }
            >
              Calcular prévia
            </Button>
          </div>

          {preview ? (
            <section
              className={
                styles.preview
              }
            >
              <header>
                <div>
                  <span>
                    Serão{" "}
                    {action
                    === "complete"
                      ? "concluídas"
                      : "reabertas"}
                  </span>

                  <strong>
                    {
                      preview
                        .candidate_count
                    }{" "}
                    movimentações
                  </strong>
                </div>

                {preview.skipped_count
                > 0 ? (
                  <small>
                    {
                      preview
                        .skipped_count
                    }{" "}
                    ignoradas por já
                    estarem em outro status
                  </small>
                ) : null}
              </header>

              <div
                className={
                  styles.previewMetrics
                }
              >
                <article>
                  <span>Receitas</span>
                  <strong
                    className={
                      styles.positive
                    }
                  >
                    {formatCurrency(
                      preview
                        .income_total,
                    )}
                  </strong>
                  <small>
                    {
                      preview
                        .income_count
                    }{" "}
                    itens
                  </small>
                </article>

                <article>
                  <span>Despesas</span>
                  <strong
                    className={
                      styles.negative
                    }
                  >
                    {formatCurrency(
                      preview
                        .expense_total,
                    )}
                  </strong>
                  <small>
                    {
                      preview
                        .expense_count
                    }{" "}
                    itens
                  </small>
                </article>

                <article>
                  <span>Período</span>
                  <strong>
                    {formatDate(
                      preview
                        .first_due_date,
                    )}
                  </strong>
                  <small>
                    até{" "}
                    {formatDate(
                      preview
                        .last_due_date,
                    )}
                  </small>
                </article>
              </div>

              {preview.closed_months
                .length > 0 ? (
                <label
                  className={
                    styles
                      .closedWarning
                  }
                >
                  <input
                    type="checkbox"
                    checked={
                      confirmClosedMonths
                    }
                    onChange={(event) =>
                      setConfirmClosedMonths(
                        event.target
                          .checked,
                      )
                    }
                  />

                  <span>
                    <strong>
                      Meses fechados
                      afetados
                    </strong>

                    <small>
                      {preview
                        .closed_months
                        .map(
                          formatMonth,
                        )
                        .join(", ")}
                      . A fotografia oficial
                      será preservada, mas
                      a situação atual mudará.
                    </small>
                  </span>
                </label>
              ) : null}

              {preview.sample.length
              > 0 ? (
                <div
                  className={
                    styles.sample
                  }
                >
                  <strong>
                    Amostra
                  </strong>

                  {preview.sample.map(
                    (item) => (
                      <div
                        key={item.id}
                      >
                        <span>
                          {
                            item
                              .description
                          }
                        </span>

                        <small>
                          {formatDate(
                            item.due_date,
                          )}
                        </small>

                        <strong
                          className={
                            item
                              .transaction_type
                            === "income"
                              ? styles
                                  .positive
                              : styles
                                  .negative
                          }
                        >
                          {formatCurrency(
                            item.amount,
                          )}
                        </strong>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p
                  className={
                    styles.empty
                  }
                >
                  Nenhuma movimentação
                  será alterada.
                </p>
              )}
            </section>
          ) : null}

          <footer
            className={
              styles.footer
            }
          >
            <Button
              variant="secondary"
              disabled={
                isApplying
                || isPreviewing
              }
              onClick={closeModal}
            >
              Cancelar
            </Button>

            <Button
              isLoading={isApplying}
              disabled={
                !preview
                || preview
                  .candidate_count
                === 0
              }
              onClick={() =>
                void applyAction()
              }
            >
              Confirmar{" "}
              {action === "complete"
                ? "conclusão"
                : "reabertura"}
            </Button>
          </footer>
        </div>
      </Modal>
    </>
  );
}
