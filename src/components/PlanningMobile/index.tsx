import type {
  Dispatch,
  FormEvent,
  SetStateAction,
} from "react";
import {
  useState,
} from "react";

import { Badge } from "../Badge";
import { Button } from "../Button";
import { Card } from "../Card";
import { Input } from "../Input";
import { Modal } from "../Modal";
import { PageState } from "../PageState";
import type {
  PlanningScenario,
  ProjectionMonth,
  ProjectionSummary,
} from "../../types/planning";
import type {
  GroupType,
  TransactionType,
} from "../../types/transactions";
import {
  formatCurrency,
  parseCurrencyInput,
} from "../../utils/currency";

import styles from "./styles.module.css";


export type ScenarioForm = {
  description: string;
  notes: string;
  transactionType: TransactionType;
  groupType: GroupType;
  amountInput: string;
  occurrenceCount: string;
  startDate: string;
  isActive: boolean;
};


type ScenarioProjection = {
  balanceImpact: number;
  minimumBalance: number;
  firstNegativeMonth:
    ProjectionMonth | null;
  verdict:
    | "comfortable"
    | "attention"
    | "risk";
};


type MobileSection =
  | "summary"
  | "scenarios"
  | "months";


type PlanningMobileProps = {
  horizon: number;
  initialBalance: number;
  summary: ProjectionSummary;
  projection: ProjectionMonth[];
  scenarios: PlanningScenario[];
  selectedScenarioId: string | null;
  selectedScenario:
    PlanningScenario | null;
  selectedScenarioProjection:
    ScenarioProjection | null;
  actionId: string | null;
  isModalOpen: boolean;
  isSaving: boolean;
  form: ScenarioForm;
  editingScenario:
    PlanningScenario | null;
  formError: string;
  setHorizon: (
    value: number,
  ) => void;
  setInitialBalance: (
    value: number,
  ) => void;
  setSelectedScenarioId: (
    value: string | null,
  ) => void;
  setIsModalOpen: (
    value: boolean,
  ) => void;
  setForm: Dispatch<
    SetStateAction<ScenarioForm>
  >;
  openCreateModal: () => void;
  openEditModal: (
    scenario: PlanningScenario,
  ) => void;
  toggleScenario: (
    scenario: PlanningScenario,
  ) => Promise<void>;
  removeScenario: (
    scenario: PlanningScenario,
  ) => Promise<void>;
  changeGroupType: (
    groupType: GroupType,
  ) => void;
  submitScenario: (
    event:
      FormEvent<HTMLFormElement>,
  ) => Promise<void>;
};


const groupLabels:
  Record<GroupType, string> = {
    single: "Avulso",
    installment: "Parcelado",
    recurring: "Recorrente",
  };


const verdictContent = {
  comfortable: {
    label: "Confortável",
    variant:
      "positive" as const,
    description:
      "A projeção mantém uma margem saudável.",
  },
  attention: {
    label: "Atenção",
    variant:
      "warning" as const,
    description:
      "A margem continua positiva, mas fica apertada.",
  },
  risk: {
    label: "Risco alto",
    variant:
      "negative" as const,
    description:
      "A projeção entra no negativo.",
  },
};


export function PlanningMobile({
  horizon,
  initialBalance,
  summary,
  projection,
  scenarios,
  selectedScenarioId,
  selectedScenario,
  selectedScenarioProjection,
  actionId,
  isModalOpen,
  isSaving,
  form,
  editingScenario,
  formError,
  setHorizon,
  setInitialBalance,
  setSelectedScenarioId,
  setIsModalOpen,
  setForm,
  openCreateModal,
  openEditModal,
  toggleScenario,
  removeScenario,
  changeGroupType,
  submitScenario,
}: PlanningMobileProps) {
  const [
    activeSection,
    setActiveSection,
  ] = useState<MobileSection>(
    "summary",
  );

  const verdict =
    verdictContent[
      summary.verdict
    ];

  const maximumBalance =
    Math.max(
      ...projection.map(
        (month) =>
          Math.abs(
            month
              .accumulatedBalance,
          ),
      ),
      1,
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
            Projeção futura
          </span>

          <h1>Planejamento</h1>

          <p>
            Teste compromissos antes
            de assumir.
          </p>
        </div>

        <Button
          size="small"
          onClick={openCreateModal}
        >
          Novo
        </Button>
      </header>

      <section
        className={
          styles.controls
        }
      >
        <label>
          <span>Horizonte</span>
          <select
            value={horizon}
            onChange={(event) =>
              setHorizon(
                Number(
                  event.target.value,
                ),
              )
            }
          >
            <option value={6}>
              6 meses
            </option>
            <option value={12}>
              12 meses
            </option>
            <option value={18}>
              18 meses
            </option>
            <option value={24}>
              24 meses
            </option>
          </select>
        </label>

        <label>
          <span>
            Saldo disponível hoje
          </span>
          <input
            type="number"
            step="0.01"
            value={initialBalance}
            onChange={(event) =>
              setInitialBalance(
                Number(
                  event.target.value,
                ) || 0,
              )
            }
          />
        </label>
      </section>

      <nav
        className={styles.tabs}
        aria-label="Seções do planejamento"
      >
        <button
          type="button"
          className={
            activeSection
            === "summary"
              ? styles.tabActive
              : ""
          }
          onClick={() =>
            setActiveSection(
              "summary",
            )
          }
        >
          Resumo
        </button>

        <button
          type="button"
          className={
            activeSection
            === "scenarios"
              ? styles.tabActive
              : ""
          }
          onClick={() =>
            setActiveSection(
              "scenarios",
            )
          }
        >
          Cenários
          {scenarios.length > 0 ? (
            <span>
              {scenarios.length}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          className={
            activeSection
            === "months"
              ? styles.tabActive
              : ""
          }
          onClick={() =>
            setActiveSection(
              "months",
            )
          }
        >
          Meses
        </button>
      </nav>

      {activeSection
      === "summary" ? (
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
              <span>Saldo final</span>
              <strong
                className={
                  summary.finalBalance
                  >= 0
                    ? styles.positive
                    : styles.negative
                }
              >
                {formatCurrency(
                  summary.finalBalance,
                )}
              </strong>
              <small>
                Após {horizon} meses
              </small>
            </article>

            <article>
              <span>Menor saldo</span>
              <strong
                className={
                  summary.minimumBalance
                  >= 0
                    ? styles.positive
                    : styles.negative
                }
              >
                {formatCurrency(
                  summary.minimumBalance,
                )}
              </strong>
              <small>
                Pior ponto
              </small>
            </article>

            <article>
              <span>
                Primeiro negativo
              </span>
              <strong>
                {
                  summary
                    .firstNegativeMonth
                    ?.label
                  ?? "Nenhum"
                }
              </strong>
              <small>
                {
                  summary
                    .firstNegativeMonth
                    ? "Requer ajuste"
                    : "Projeção positiva"
                }
              </small>
            </article>

            <article>
              <span>Diagnóstico</span>
              <Badge
                variant={
                  verdict.variant
                }
              >
                {verdict.label}
              </Badge>
              <small>
                {verdict.description}
              </small>
            </article>
          </section>

          <Card
            title="Linha do tempo"
            description="Saldo projetado mês a mês."
          >
            <div
              className={
                styles.timeline
              }
            >
              {projection.map(
                (month) => {
                  const scenarioImpact =
                    month
                      .scenarioIncome
                    - month
                      .scenarioExpense;

                  return (
                    <article
                      key={month.key}
                    >
                      <header>
                        <strong>
                          {month.label}
                        </strong>

                        <span
                          className={
                            month
                              .accumulatedBalance
                            >= 0
                              ? styles
                                  .positive
                              : styles
                                  .negative
                          }
                        >
                          {formatCurrency(
                            month
                              .accumulatedBalance,
                          )}
                        </span>
                      </header>

                      <div
                        className={
                          styles.timelineValues
                        }
                      >
                        <span>
                          Base{" "}
                          {formatCurrency(
                            month
                              .baseResult,
                          )}
                        </span>

                        <span
                          className={
                            scenarioImpact
                            >= 0
                              ? styles
                                  .positive
                              : styles
                                  .negative
                          }
                        >
                          Cenários{" "}
                          {
                            scenarioImpact
                            >= 0
                              ? "+"
                              : "−"
                          }{" "}
                          {formatCurrency(
                            Math.abs(
                              scenarioImpact,
                            ),
                          )}
                        </span>
                      </div>

                      <div
                        className={
                          styles.track
                        }
                      >
                        <div
                          className={
                            month
                              .accumulatedBalance
                            >= 0
                              ? styles
                                  .trackPositive
                              : styles
                                  .trackNegative
                          }
                          style={{
                            width:
                              `${Math.max(
                                6,
                                Math.min(
                                  100,
                                  (
                                    Math.abs(
                                      month
                                        .accumulatedBalance,
                                    )
                                    / maximumBalance
                                  )
                                  * 100,
                                ),
                              )}%`,
                          }}
                        />
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          </Card>
        </div>
      ) : null}

      {activeSection
      === "scenarios" ? (
        <div
          className={
            styles.section
          }
        >
          {scenarios.length === 0 ? (
            <Card>
              <PageState
                title="Nenhum cenário"
                description="Simule uma compra, dívida, renda ou assinatura."
                actionLabel="Criar cenário"
                onAction={openCreateModal}
              />
            </Card>
          ) : (
            <div
              className={
                styles.scenarioList
              }
            >
              {scenarios.map(
                (scenario) => (
                  <article
                    className={[
                      styles.scenario,
                      selectedScenarioId
                      === scenario.id
                        ? styles
                            .scenarioSelected
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={scenario.id}
                  >
                    <button
                      type="button"
                      className={
                        styles
                          .scenarioMain
                      }
                      onClick={() =>
                        setSelectedScenarioId(
                          scenario.id,
                        )
                      }
                    >
                      <header>
                        <div>
                          <strong>
                            {
                              scenario
                                .description
                            }
                          </strong>
                          <span>
                            {
                              groupLabels[
                                scenario
                                  .group_type
                              ]
                            }
                            {
                              scenario
                                .occurrence_count
                                ? ` · ${scenario.occurrence_count} meses`
                                : ""
                            }
                          </span>
                        </div>

                        <Badge
                          variant={
                            scenario
                              .transaction_type
                            === "income"
                              ? "positive"
                              : "negative"
                          }
                        >
                          {scenario
                            .transaction_type
                          === "income"
                            ? "Receita"
                            : "Despesa"}
                        </Badge>
                      </header>

                      <div
                        className={
                          styles.scenarioValue
                        }
                      >
                        <strong>
                          {formatCurrency(
                            scenario.amount,
                          )}
                        </strong>

                        <span>
                          {scenario.is_active
                            ? "Ativo na projeção"
                            : "Fora da projeção"}
                        </span>
                      </div>
                    </button>

                    <div
                      className={
                        styles.actions
                      }
                    >
                      <Button
                        size="small"
                        variant="tertiary"
                        disabled={
                          actionId
                          === scenario.id
                        }
                        onClick={() =>
                          openEditModal(
                            scenario,
                          )
                        }
                      >
                        Editar
                      </Button>

                      <Button
                        size="small"
                        variant="secondary"
                        isLoading={
                          actionId
                          === scenario.id
                        }
                        onClick={() =>
                          void toggleScenario(
                            scenario,
                          )
                        }
                      >
                        {scenario.is_active
                          ? "Desativar"
                          : "Ativar"}
                      </Button>

                      <Button
                        size="small"
                        variant="danger"
                        disabled={
                          actionId
                          === scenario.id
                        }
                        onClick={() =>
                          void removeScenario(
                            scenario,
                          )
                        }
                      >
                        Excluir
                      </Button>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}

          {selectedScenario
          && selectedScenarioProjection ? (
            <Card
              title="Esse compromisso cabe?"
              description={
                selectedScenario
                  .description
              }
            >
              <div
                className={
                  styles.analysis
                }
              >
                <Badge
                  variant={
                    verdictContent[
                      selectedScenarioProjection
                        .verdict
                    ].variant
                  }
                >
                  {
                    verdictContent[
                      selectedScenarioProjection
                        .verdict
                    ].label
                  }
                </Badge>

                <dl>
                  <div>
                    <dt>
                      Impacto no saldo
                    </dt>
                    <dd
                      className={
                        selectedScenarioProjection
                          .balanceImpact
                        >= 0
                          ? styles
                              .positive
                          : styles
                              .negative
                      }
                    >
                      {formatCurrency(
                        selectedScenarioProjection
                          .balanceImpact,
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt>Menor saldo</dt>
                    <dd>
                      {formatCurrency(
                        selectedScenarioProjection
                          .minimumBalance,
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt>
                      Primeiro negativo
                    </dt>
                    <dd>
                      {
                        selectedScenarioProjection
                          .firstNegativeMonth
                          ?.label
                        ?? "Nenhum"
                      }
                    </dd>
                  </div>
                </dl>
              </div>
            </Card>
          ) : null}
        </div>
      ) : null}

      {activeSection
      === "months" ? (
        <div
          className={
            styles.monthCards
          }
        >
          {projection.map(
            (month) => {
              const scenarioImpact =
                month.scenarioIncome
                - month.scenarioExpense;

              return (
                <article
                  key={month.key}
                >
                  <header>
                    <strong>
                      {month.label}
                    </strong>
                    <span
                      className={
                        month
                          .accumulatedBalance
                        >= 0
                          ? styles
                              .positive
                          : styles
                              .negative
                      }
                    >
                      Saldo{" "}
                      {formatCurrency(
                        month
                          .accumulatedBalance,
                      )}
                    </span>
                  </header>

                  <dl>
                    <div>
                      <dt>Receitas</dt>
                      <dd
                        className={
                          styles.positive
                        }
                      >
                        {formatCurrency(
                          month.baseIncome,
                        )}
                      </dd>
                    </div>

                    <div>
                      <dt>Despesas</dt>
                      <dd
                        className={
                          styles.negative
                        }
                      >
                        {formatCurrency(
                          month.baseExpense,
                        )}
                      </dd>
                    </div>

                    <div>
                      <dt>Cenários</dt>
                      <dd
                        className={
                          scenarioImpact
                          >= 0
                            ? styles
                                .positive
                            : styles
                                .negative
                        }
                      >
                        {formatCurrency(
                          scenarioImpact,
                        )}
                      </dd>
                    </div>

                    <div>
                      <dt>Resultado</dt>
                      <dd
                        className={
                          month
                            .projectedResult
                          >= 0
                            ? styles
                                .positive
                            : styles
                                .negative
                        }
                      >
                        {formatCurrency(
                          month
                            .projectedResult,
                        )}
                      </dd>
                    </div>
                  </dl>
                </article>
              );
            },
          )}
        </div>
      ) : null}

      <Modal
        title={
          editingScenario
            ? "Editar cenário"
            : "Novo cenário"
        }
        description="Afeta somente a projeção."
        isOpen={isModalOpen}
        onClose={() =>
          setIsModalOpen(false)
        }
      >
        <form
          className={styles.form}
          onSubmit={submitScenario}
        >
          {formError ? (
            <div
              className={
                styles.formError
              }
              role="alert"
            >
              {formError}
            </div>
          ) : null}

          <Input
            label="Descrição"
            placeholder="Ex.: Financiamento do carro"
            value={
              form.description
            }
            onChange={(event) =>
              setForm(
                (current) => ({
                  ...current,
                  description:
                    event.target
                      .value,
                }),
              )
            }
            required
          />

          <div
            className={
              styles.twoColumns
            }
          >
            <label
              className={
                styles.field
              }
            >
              <span>Tipo</span>
              <select
                value={
                  form
                    .transactionType
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      transactionType:
                        event.target.value as TransactionType,
                    }),
                  )
                }
              >
                <option
                  value="expense"
                >
                  Despesa
                </option>
                <option
                  value="income"
                >
                  Receita
                </option>
              </select>
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>Formato</span>
              <select
                value={
                  form.groupType
                }
                onChange={(event) =>
                  changeGroupType(
                    event.target.value as GroupType,
                  )
                }
              >
                <option
                  value="single"
                >
                  Avulso
                </option>
                <option
                  value="installment"
                >
                  Parcelado
                </option>
                <option
                  value="recurring"
                >
                  Recorrente
                </option>
              </select>
            </label>
          </div>

          <Input
            label={
              form.groupType
              === "installment"
                ? "Valor total"
                : "Valor por mês"
            }
            inputMode="numeric"
            value={
              form.amountInput
                ? formatCurrency(
                    parseCurrencyInput(
                      form.amountInput,
                    ),
                  )
                : ""
            }
            onChange={(event) =>
              setForm(
                (current) => ({
                  ...current,
                  amountInput:
                    event.target.value,
                }),
              )
            }
            required
          />

          <Input
            label="Início"
            type="date"
            value={form.startDate}
            onChange={(event) =>
              setForm(
                (current) => ({
                  ...current,
                  startDate:
                    event.target.value,
                }),
              )
            }
            required
          />

          {form.groupType
          !== "single" ? (
            <Input
              label={
                form.groupType
                === "installment"
                  ? "Número de parcelas"
                  : "Quantidade de meses"
              }
              type="number"
              min={
                form.groupType
                === "installment"
                  ? 2
                  : 1
              }
              placeholder={
                form.groupType
                === "recurring"
                  ? "Vazio para toda a projeção"
                  : undefined
              }
              value={
                form.occurrenceCount
              }
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    occurrenceCount:
                      event.target
                        .value,
                  }),
                )
              }
              required={
                form.groupType
                === "installment"
              }
            />
          ) : null}

          <label
            className={
              styles.field
            }
          >
            <span>Observações</span>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    notes:
                      event.target
                        .value,
                  }),
                )
              }
            />
          </label>

          <label
            className={
              styles.checkbox
            }
          >
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    isActive:
                      event.target
                        .checked,
                  }),
                )
              }
            />
            <span>
              Incluir na projeção
            </span>
          </label>

          <div
            className={
              styles.formActions
            }
          >
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setIsModalOpen(
                  false,
                )
              }
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              isLoading={isSaving}
            >
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
