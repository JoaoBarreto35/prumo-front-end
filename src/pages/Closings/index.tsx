import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  useNavigate,
} from "react-router";

import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Modal } from "../../components/Modal";
import { PageSkeleton } from "../../components/PageSkeleton";
import { PageState } from "../../components/PageState";
import { ApiError } from "../../services/api";
import {
  closingService,
} from "../../services/closingService";
import type {
  ClosingBreakdownItem,
  ClosingHistoryItem,
  ClosingMetrics,
  ClosingSnapshot,
  ClosingStatus,
  ClosingSummary,
  ClosingTransactionItem,
} from "../../types/closings";
import {
  formatCurrency,
} from "../../utils/currency";
import {
  BulkTransactionActions,
} from "../../components/BulkTransactionActions";

import styles from "./styles.module.css";


type Section =
  | "overview"
  | "pending"
  | "breakdown"
  | "history";


const monthFormatter =
  new Intl.DateTimeFormat(
    "pt-BR",
    {
      month: "long",
      year: "numeric",
    },
  );


function toMonthKey(
  value: Date,
): string {
  const year =
    value.getFullYear();
  const month = String(
    value.getMonth() + 1,
  ).padStart(2, "0");

  return `${year}-${month}-01`;
}


function parseMonth(
  value: string,
): Date {
  return new Date(
    `${value.slice(0, 7)}-01T12:00:00`,
  );
}


function addMonths(
  value: string,
  amount: number,
): string {
  const parsed = parseMonth(
    value,
  );

  return toMonthKey(
    new Date(
      parsed.getFullYear(),
      parsed.getMonth()
      + amount,
      1,
      12,
    ),
  );
}


function formatMonth(
  value: string,
): string {
  return monthFormatter
    .format(parseMonth(value))
    .replace(
      /^./,
      (letter) =>
        letter.toLocaleUpperCase(
          "pt-BR",
        ),
    );
}


function formatDateTime(
  value: string | null,
): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value));
}


function statusContent(
  status: ClosingStatus,
): {
  label: string;
  variant:
  | "positive"
  | "warning"
  | "info";
} {
  if (status === "closed") {
    return {
      label: "Fechado",
      variant: "positive",
    };
  }

  if (status === "reopened") {
    return {
      label: "Reaberto",
      variant: "warning",
    };
  }

  return {
    label: "Aberto",
    variant: "info",
  };
}


function realizationLabel(
  value: number,
): string {
  if (value >= 100) {
    return "100% ou mais";
  }

  return `${value.toFixed(1)}%`;
}


function metricsChanged(
  live: ClosingMetrics,
  snapshot: ClosingMetrics,
): boolean {
  const keys:
    Array<
      keyof ClosingMetrics
    > = [
      "planned_income",
      "planned_expense",
      "projected_result",
      "actual_income",
      "actual_expense",
      "actual_result",
      "pending_count",
      "overdue_count",
      "transaction_count",
    ];

  return keys.some(
    (key) =>
      Math.abs(
        Number(live[key])
        - Number(snapshot[key]),
      ) > 0.009,
  );
}


function Progress({
  label,
  value,
  amount,
}: {
  label: string;
  value: number;
  amount: number;
}) {
  return (
    <div
      className={styles.progress}
    >
      <div
        className={
          styles.progressHeader
        }
      >
        <span>{label}</span>

        <strong>
          {realizationLabel(value)}
        </strong>
      </div>

      <div
        className={
          styles.progressTrack
        }
      >
        <div
          style={{
            width:
              `${Math.min(
                100,
                Math.max(
                  0,
                  value,
                ),
              )}%`,
          }}
        />
      </div>

      <small>
        {formatCurrency(amount)}
        {" "}realizados
      </small>
    </div>
  );
}


function MetricsGrid({
  snapshot,
  title,
}: {
  snapshot: ClosingSnapshot;
  title: string;
}) {
  const metrics =
    snapshot.metrics;

  return (
    <Card
      title={title}
      description={
        `Gerado em ${formatDateTime(
          snapshot.generated_at,
        )}`
      }
    >
      <div
        className={
          styles.metricsGrid
        }
      >
        <article>
          <span>
            Receitas previstas
          </span>
          <strong
            className={
              styles.positive
            }
          >
            {formatCurrency(
              metrics
                .planned_income,
            )}
          </strong>
        </article>

        <article>
          <span>
            Despesas previstas
          </span>
          <strong
            className={
              styles.negative
            }
          >
            {formatCurrency(
              metrics
                .planned_expense,
            )}
          </strong>
        </article>

        <article>
          <span>
            Resultado previsto
          </span>
          <strong
            className={
              metrics
                .projected_result
                >= 0
                ? styles.positive
                : styles.negative
            }
          >
            {formatCurrency(
              metrics
                .projected_result,
            )}
          </strong>
        </article>

        <article>
          <span>
            Resultado realizado
          </span>
          <strong
            className={
              metrics.actual_result
                >= 0
                ? styles.positive
                : styles.negative
            }
          >
            {formatCurrency(
              metrics
                .actual_result,
            )}
          </strong>
        </article>
      </div>

      <div
        className={
          styles.progressGrid
        }
      >
        <Progress
          label="Receitas recebidas"
          value={
            metrics
              .income_realization_rate
          }
          amount={
            metrics.actual_income
          }
        />

        <Progress
          label="Despesas pagas"
          value={
            metrics
              .expense_realization_rate
          }
          amount={
            metrics.actual_expense
          }
        />
      </div>

      <div
        className={
          styles.countGrid
        }
      >
        <article>
          <span>Pendentes</span>
          <strong>
            {metrics.pending_count}
          </strong>
          <small>
            {formatCurrency(
              metrics.pending_expense,
            )}{" "}
            em despesas
          </small>
        </article>

        <article>
          <span>Concluídas</span>
          <strong>
            {metrics.completed_count}
          </strong>
          <small>
            movimentações
          </small>
        </article>

        <article>
          <span>Atrasadas</span>
          <strong
            className={
              metrics.overdue_count
                > 0
                ? styles.negative
                : ""
            }
          >
            {metrics.overdue_count}
          </strong>
          <small>
            exigem atenção
          </small>
        </article>
      </div>
    </Card>
  );
}


function Breakdown({
  title,
  items,
}: {
  title: string;
  items: ClosingBreakdownItem[];
}) {
  const maximum = Math.max(
    ...items.map(
      (item) => item.amount,
    ),
    1,
  );

  return (
    <Card title={title}>
      {items.length === 0 ? (
        <PageState
          title="Sem despesas"
          description={
            "Não existem despesas "
            + "para distribuir."
          }
        />
      ) : (
        <div
          className={
            styles.breakdown
          }
        >
          {items.map(
            (item) => (
              <article key={item.id}>
                <header>
                  <span>
                    {item.label}
                  </span>

                  <strong>
                    {formatCurrency(
                      item.amount,
                    )}
                  </strong>
                </header>

                <div
                  className={
                    styles.breakdownTrack
                  }
                >
                  <div
                    style={{
                      width:
                        `${Math.max(
                          3,
                          (
                            item.amount
                            / maximum
                          )
                          * 100,
                        )}%`,
                    }}
                  />
                </div>

                <small>
                  {item.count}{" "}
                  movimentação
                  {item.count === 1
                    ? ""
                    : "ões"}
                  {" · "}
                  {item.percentage
                    .toFixed(1)}%
                </small>
              </article>
            ),
          )}
        </div>
      )}
    </Card>
  );
}


function TransactionCard({
  item,
  onOpen,
}: {
  item:
  ClosingTransactionItem;
  onOpen: () => void;
}) {
  const today = new Date();
  const localToday =
    `${today.getFullYear()}-${String(
      today.getMonth() + 1,
    ).padStart(2, "0")}-${String(
      today.getDate(),
    ).padStart(2, "0")}`;

  const isOverdue =
    item.status === "pending"
    && item.due_date < localToday;

  return (
    <article
      className={
        styles.transaction
      }
    >
      <header>
        <div>
          <strong>
            {item.description}
          </strong>

          <span>
            {item.category_name}
            {" · "}
            {item.account_name}
          </span>
        </div>

        <strong
          className={
            item.transaction_type
              === "income"
              ? styles.positive
              : styles.negative
          }
        >
          {item.transaction_type
            === "income"
            ? "+ "
            : "− "}
          {formatCurrency(
            item.amount,
          )}
        </strong>
      </header>

      <footer>
        <span>
          {new Intl.DateTimeFormat(
            "pt-BR",
          ).format(
            new Date(
              `${item.due_date}T12:00:00`,
            ),
          )}
        </span>

        {isOverdue ? (
          <Badge variant="negative">
            Atrasada
          </Badge>
        ) : (
          <Badge variant="warning">
            Pendente
          </Badge>
        )}

        <Button
          size="small"
          variant="tertiary"
          onClick={onOpen}
        >
          Abrir
        </Button>
      </footer>
    </article>
  );
}


export function ClosingsPage() {
  const navigate = useNavigate();

  const [month, setMonth] =
    useState(
      toMonthKey(new Date()),
    );

  const [summary, setSummary] =
    useState<
      ClosingSummary | null
    >(null);

  const [history, setHistory] =
    useState<
      ClosingHistoryItem[]
    >([]);

  const [section, setSection] =
    useState<Section>(
      "overview",
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [isActionRunning, setIsActionRunning] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [isCloseModalOpen, setIsCloseModalOpen] =
    useState(false);

  const [notes, setNotes] =
    useState("");

  const [confirmPending, setConfirmPending] =
    useState(false);


  const loadData = useCallback(
    async () => {
      setIsLoading(true);
      setError("");

      try {
        const [
          monthSummary,
          closingHistory,
        ] = await Promise.all([
          closingService
            .getSummary(month),
          closingService
            .listHistory(),
        ]);

        setSummary(monthSummary);
        setHistory(closingHistory);
        setNotes(
          monthSummary.notes ?? "",
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Não foi possível carregar o fechamento.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [month],
  );


  useEffect(() => {
    void loadData();
  }, [loadData]);


  const status = summary
    ? statusContent(
      summary.status,
    )
    : null;

  const hasDrift = useMemo(
    () =>
      Boolean(
        summary
          ?.closed_snapshot
        && metricsChanged(
          summary.live.metrics,
          summary
            .closed_snapshot
            .metrics,
        ),
      ),
    [summary],
  );


  function moveMonth(
    amount: number,
  ) {
    setMonth(
      (current) =>
        addMonths(
          current,
          amount,
        ),
    );
  }


  function openCloseModal() {
    setConfirmPending(false);
    setIsCloseModalOpen(true);
  }


  async function handleClose(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (
      summary
      && summary.live.metrics
        .pending_count > 0
      && !confirmPending
    ) {
      setError(
        "Confirme que você está ciente das pendências antes de fechar.",
      );
      return;
    }

    setIsActionRunning(true);
    setError("");
    setSuccess("");

    try {
      const updated =
        await closingService
          .closeMonth(
            month,
            notes.trim()
            || null,
          );

      setSummary(updated);
      setIsCloseModalOpen(
        false,
      );
      setSuccess(
        "Mês fechado e fotografia financeira preservada.",
      );

      const closingHistory =
        await closingService
          .listHistory();

      setHistory(
        closingHistory,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível fechar o mês.",
      );
    } finally {
      setIsActionRunning(false);
    }
  }


  async function handleReopen() {
    if (
      !window.confirm(
        "Reabrir este mês? A fotografia atual será preservada até um novo fechamento.",
      )
    ) {
      return;
    }

    setIsActionRunning(true);
    setError("");
    setSuccess("");

    try {
      const updated =
        await closingService
          .reopenMonth(month);

      setSummary(updated);
      setSuccess(
        "Mês reaberto. Faça os ajustes e feche novamente quando terminar.",
      );

      const closingHistory =
        await closingService
          .listHistory();

      setHistory(
        closingHistory,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível reabrir o mês.",
      );
    } finally {
      setIsActionRunning(false);
    }
  }


  async function saveNotes() {
    if (!summary?.id) {
      return;
    }

    setIsActionRunning(true);
    setError("");
    setSuccess("");

    try {
      const updated =
        await closingService
          .updateNotes(
            month,
            notes.trim()
            || null,
          );

      setSummary(updated);
      setSuccess(
        "Observações salvas.",
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível salvar as observações.",
      );
    } finally {
      setIsActionRunning(false);
    }
  }


  if (isLoading) {
    return (
      <PageSkeleton
        cards={4}
        rows={6}
      />
    );
  }


  if (
    error
    && !summary
  ) {
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


  if (!summary || !status) {
    return null;
  }


  const activeSnapshot =
    summary.status === "closed"
      && summary.closed_snapshot
      ? summary.closed_snapshot
      : summary.live;


  return (
    <div className={styles.page}>
      <header
        className={
          styles.pageHeader
        }
      >
        <div>
          <span
            className={
              styles.eyebrow
            }
          >
            Encerramento financeiro
          </span>

          <h1>
            Fechamento mensal
          </h1>

          <p>
            Preserve a fotografia do
            mês e compare previsto com
            realizado.
          </p>
        </div>

        <div
          className={
            styles.headerActions
          }
        >
          {summary.status
            === "closed" ? (
            <Button
              variant="secondary"
              isLoading={
                isActionRunning
              }
              onClick={() =>
                void handleReopen()
              }
            >
              Reabrir mês
            </Button>
          ) : (
            <Button
              onClick={
                openCloseModal
              }
            >
              Fechar mês
            </Button>
          )}
        </div>
      </header>

      {error ? (
        <div
          className={styles.error}
        >
          {error}
        </div>
      ) : null}

      {success ? (
        <div
          className={
            styles.success
          }
        >
          {success}
        </div>
      ) : null}

      <section
        className={
          styles.monthToolbar
        }
      >
        <button
          type="button"
          onClick={() =>
            moveMonth(-1)
          }
          aria-label="Mês anterior"
        >
          ‹
        </button>

        <div>
          <strong>
            {formatMonth(month)}
          </strong>

          <Badge
            variant={status.variant}
          >
            {status.label}
          </Badge>
        </div>

        <button
          type="button"
          onClick={() =>
            moveMonth(1)
          }
          aria-label="Próximo mês"
        >
          ›
        </button>

        <button
          type="button"
          className={
            styles.todayButton
          }
          onClick={() =>
            setMonth(
              toMonthKey(
                new Date(),
              ),
            )
          }
        >
          Mês atual
        </button>
      </section>

      {summary.status
        === "closed" ? (
        <aside
          className={
            hasDrift
              ? styles.driftWarning
              : styles.closedNotice
          }
        >
          <span
            aria-hidden="true"
          >
            {hasDrift ? "!" : "✓"}
          </span>

          <div>
            <strong>
              {hasDrift
                ? "Os dados atuais mudaram após o fechamento"
                : "Fotografia oficial preservada"}
            </strong>

            <p>
              {hasDrift
                ? "O resumo oficial continua intacto. Consulte Situação atual para ver as alterações posteriores."
                : `Versão ${summary.snapshot_version}, fechada em ${formatDateTime(summary.closed_at)}.`}
            </p>
          </div>
        </aside>
      ) : null}

      <nav
        className={styles.tabs}
        aria-label="Seções do fechamento"
      >
        {(
          [
            [
              "overview",
              "Resumo",
            ],
            [
              "pending",
              `Pendências (${activeSnapshot.metrics.pending_count})`,
            ],
            [
              "breakdown",
              "Distribuição",
            ],
            [
              "history",
              "Histórico",
            ],
          ] as Array<
            [Section, string]
          >
        ).map(
          ([value, label]) => (
            <button
              type="button"
              key={value}
              className={
                section === value
                  ? styles.tabActive
                  : ""
              }
              onClick={() =>
                setSection(value)
              }
            >
              {label}
            </button>
          ),
        )}
      </nav>

      {section === "overview" ? (
        <div
          className={
            styles.section
          }
        >
          <MetricsGrid
            snapshot={
              activeSnapshot
            }
            title={
              summary.status
                === "closed"
                ? "Fotografia oficial"
                : "Situação do mês"
            }
          />

          {summary.status
            === "closed"
            && hasDrift ? (
            <MetricsGrid
              snapshot={
                summary.live
              }
              title="Situação atual"
            />
          ) : null}

          <Card
            title="Observações"
            description={
              summary.id
                ? "Registre decisões, imprevistos ou aprendizados do mês."
                : "As observações serão salvas ao fechar o mês."
            }
          >
            <div
              className={
                styles.notes
              }
            >
              <textarea
                rows={5}
                maxLength={2000}
                placeholder="Ex.: gasto extraordinário com manutenção do carro..."
                value={notes}
                onChange={(event) =>
                  setNotes(
                    event.target.value,
                  )
                }
              />

              {summary.id ? (
                <Button
                  size="small"
                  variant="secondary"
                  isLoading={
                    isActionRunning
                  }
                  onClick={() =>
                    void saveNotes()
                  }
                >
                  Salvar observações
                </Button>
              ) : null}
            </div>
          </Card>
        </div>
      ) : null}

      {section === "pending" ? (
        <div
          className={
            styles.section
          }
        >
          <div className={styles.pendingActions}>
              <BulkTransactionActions
                triggerLabel="Concluir pendências do mês"
                buttonVariant="primary"
                initialScope="month"
                defaultReferenceMonth={month}
                onChanged={loadData}
              />
            </div>
          <section
            className={
              styles.pendingSummary
            }
          >
            <Card>
              <div
                className={
                  styles.compactMetric
                }
              >
                <span>
                  Receitas pendentes
                </span>
                <strong
                  className={
                    styles.positive
                  }
                >
                  {formatCurrency(
                    activeSnapshot
                      .metrics
                      .pending_income,
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
                  Despesas pendentes
                </span>
                <strong
                  className={
                    styles.negative
                  }
                >
                  {formatCurrency(
                    activeSnapshot
                      .metrics
                      .pending_expense,
                  )}
                </strong>
              </div>
            </Card>
            
          </section>

          {activeSnapshot
            .pending_transactions
            .length === 0 ? (
            <Card>
              <PageState
                title="Mês sem pendências"
                description={
                  "Todas as movimentações "
                  + "foram concluídas."
                }
              />
            </Card>
          ) : (

            <div
              className={
                styles.transactionList
              }
            >
              {activeSnapshot
                .pending_transactions
                .map((item) => (
                  <TransactionCard
                    key={item.id}
                    item={item}
                    onOpen={() =>
                      navigate(
                        `/transactions/${item.id}`,
                      )
                    }
                  />
                ))}
            </div>
          )}
        </div>
      ) : null}

      {section
        === "breakdown" ? (
        <div
          className={
            styles.breakdownGrid
          }
        >
          <Breakdown
            title="Despesas por categoria"
            items={
              activeSnapshot
                .category_breakdown
            }
          />

          <Breakdown
            title="Despesas por conta"
            items={
              activeSnapshot
                .account_breakdown
            }
          />
        </div>
      ) : null}

      {section === "history" ? (
        <div
          className={
            styles.historyList
          }
        >
          {history.length === 0 ? (
            <Card>
              <PageState
                title="Nenhum mês fechado"
                description={
                  "Os fechamentos anteriores "
                  + "aparecerão aqui."
                }
              />
            </Card>
          ) : (
            history.map(
              (item) => {
                const itemStatus =
                  statusContent(
                    item.status,
                  );

                return (
                  <button
                    type="button"
                    key={item.id}
                    className={
                      styles.historyItem
                    }
                    onClick={() => {
                      setMonth(
                        item.reference_month,
                      );
                      setSection(
                        "overview",
                      );
                    }}
                  >
                    <div>
                      <strong>
                        {formatMonth(
                          item
                            .reference_month,
                        )}
                      </strong>

                      <span>
                        Versão{" "}
                        {
                          item
                            .snapshot_version
                        }
                        {" · "}
                        {formatDateTime(
                          item.closed_at,
                        )}
                      </span>
                    </div>

                    <Badge
                      variant={
                        itemStatus.variant
                      }
                    >
                      {
                        itemStatus.label
                      }
                    </Badge>

                    <div
                      className={
                        styles.historyValues
                      }
                    >
                      <span>
                        Previsto{" "}
                        <strong
                          className={
                            item
                              .projected_result
                              >= 0
                              ? styles
                                .positive
                              : styles
                                .negative
                          }
                        >
                          {formatCurrency(
                            item
                              .projected_result,
                          )}
                        </strong>
                      </span>

                      <span>
                        Realizado{" "}
                        <strong
                          className={
                            item
                              .actual_result
                              >= 0
                              ? styles
                                .positive
                              : styles
                                .negative
                          }
                        >
                          {formatCurrency(
                            item
                              .actual_result,
                          )}
                        </strong>
                      </span>
                    </div>
                  </button>
                );
              },
            )
          )}
        </div>
      ) : null}

      <Modal
        title={
          `Fechar ${formatMonth(
            month,
          )}`
        }
        description={
          "O Prumo guardará uma fotografia "
          + "dos números atuais."
        }
        isOpen={
          isCloseModalOpen
        }
        onClose={() =>
          setIsCloseModalOpen(
            false,
          )
        }
      >
        <form
          className={
            styles.closeForm
          }
          onSubmit={(event) =>
            void handleClose(event)
          }
        >
          <div
            className={
              styles.closePreview
            }
          >
            <div>
              <span>
                Resultado previsto
              </span>
              <strong
                className={
                  summary.live.metrics
                    .projected_result
                    >= 0
                    ? styles.positive
                    : styles.negative
                }
              >
                {formatCurrency(
                  summary.live.metrics
                    .projected_result,
                )}
              </strong>
            </div>

            <div>
              <span>
                Resultado realizado
              </span>
              <strong
                className={
                  summary.live.metrics
                    .actual_result
                    >= 0
                    ? styles.positive
                    : styles.negative
                }
              >
                {formatCurrency(
                  summary.live.metrics
                    .actual_result,
                )}
              </strong>
            </div>

            <div>
              <span>Pendências</span>
              <strong>
                {
                  summary.live.metrics
                    .pending_count
                }
              </strong>
            </div>
          </div>

          <label
            className={
              styles.notesField
            }
          >
            <span>
              Observações
            </span>

            <textarea
              rows={5}
              maxLength={2000}
              value={notes}
              placeholder="O que marcou este mês?"
              onChange={(event) =>
                setNotes(
                  event.target.value,
                )
              }
            />
          </label>

          {summary.live.metrics
            .pending_count > 0 ? (
            <label
              className={
                styles.confirmation
              }
            >
              <input
                type="checkbox"
                checked={
                  confirmPending
                }
                onChange={(event) =>
                  setConfirmPending(
                    event.target
                      .checked,
                  )
                }
              />

              <span>
                Estou ciente de que
                existem{" "}
                <strong>
                  {
                    summary.live
                      .metrics
                      .pending_count
                  }{" "}
                  pendências
                </strong>{" "}
                neste mês.
              </span>
            </label>
          ) : null}

          <div
            className={
              styles.modalActions
            }
          >
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setIsCloseModalOpen(
                  false,
                )
              }
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              isLoading={
                isActionRunning
              }
            >
              Confirmar fechamento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
