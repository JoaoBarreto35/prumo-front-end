import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { Badge } from "../../components/Badge";
import {
  PlanningMobile,
  type ScenarioForm,
} from "../../components/PlanningMobile";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { Modal } from "../../components/Modal";
import { PageState } from "../../components/PageState";
import { PageSkeleton } from "../../components/PageSkeleton";
import { ApiError } from "../../services/api";
import { planningService } from "../../services/planningService";
import { transactionService } from "../../services/transactionService";
import type {
  PlanningScenario,
  PlanningScenarioInput,
} from "../../types/planning";
import type {
  GroupType,
  Transaction,
  TransactionType,
} from "../../types/transactions";
import {
  buildProjection,
  summarizeProjection,
} from "../../utils/projection";
import {
  formatCurrency,
  parseCurrencyInput,
} from "../../utils/currency";
import {
  useMediaQuery,
} from "../../hooks/useMediaQuery";

import styles from "./styles.module.css";


const BALANCE_STORAGE_KEY = (
  "prumo-planning-initial-balance"
);



function today(): string {
  return new Date().toISOString().slice(0, 10);
}


const emptyForm: ScenarioForm = {
  description: "",
  notes: "",
  transactionType: "expense",
  groupType: "installment",
  amountInput: "",
  occurrenceCount: "12",
  startDate: today(),
  isActive: true,
};


const groupLabels: Record<GroupType, string> = {
  single: "Avulso",
  installment: "Parcelado",
  recurring: "Recorrente",
};


const verdictContent = {
  comfortable: {
    label: "Confortável",
    variant: "positive" as const,
    description: (
      "A projeção mantém uma margem financeira saudável."
    ),
  },
  attention: {
    label: "Atenção",
    variant: "warning" as const,
    description: (
      "A projeção não fica negativa, mas sua margem fica apertada."
    ),
  },
  risk: {
    label: "Risco alto",
    variant: "negative" as const,
    description: (
      "A projeção entra no negativo. Reavalie valor, prazo ou início."
    ),
  },
};


export function PlanningPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [scenarios, setScenarios] = useState<PlanningScenario[]>([]);
  const [horizon, setHorizon] = useState(12);
  const [initialBalance, setInitialBalance] = useState(
    () => Number(
      localStorage.getItem(BALANCE_STORAGE_KEY)
      ?? 0,
    ),
  );
  const [form, setForm] = useState<ScenarioForm>(emptyForm);
  const [editingScenario, setEditingScenario] = (
    useState<PlanningScenario | null>(null)
  );
  const [selectedScenarioId, setSelectedScenarioId] = (
    useState<string | null>(null)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const isMobile =
    useMediaQuery(
      "(max-width: 720px)",
    );


  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [transactionsData, scenariosData] = await Promise.all([
        transactionService.listTransactions({
          limit: 500,
        }),
        planningService.list(),
      ]);

      setTransactions(transactionsData);
      setScenarios(scenariosData);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível carregar o planejamento.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    void loadData();
  }, [loadData]);


  useEffect(() => {
    localStorage.setItem(
      BALANCE_STORAGE_KEY,
      String(initialBalance),
    );
  }, [initialBalance]);


  const activeScenarios = useMemo(
    () => scenarios.filter(
      (scenario) => scenario.is_active,
    ),
    [scenarios],
  );


  const projection = useMemo(
    () => buildProjection(
      transactions,
      activeScenarios,
      horizon,
      initialBalance,
    ),
    [
      activeScenarios,
      horizon,
      initialBalance,
      transactions,
    ],
  );


  const summary = useMemo(
    () => summarizeProjection(
      projection,
      activeScenarios.length,
    ),
    [activeScenarios.length, projection],
  );


  const selectedScenario = useMemo(
    () => scenarios.find(
      (scenario) => scenario.id === selectedScenarioId,
    ) ?? null,
    [scenarios, selectedScenarioId],
  );


  const selectedScenarioProjection = useMemo(() => {
    if (!selectedScenario) {
      return null;
    }

    const withoutSelected = activeScenarios.filter(
      (scenario) => scenario.id !== selectedScenario.id,
    );
    const baseline = buildProjection(
      transactions,
      withoutSelected,
      horizon,
      initialBalance,
    );
    const withSelected = buildProjection(
      transactions,
      [
        ...withoutSelected,
        {
          ...selectedScenario,
          is_active: true,
        },
      ],
      horizon,
      initialBalance,
    );

    const baselineSummary = summarizeProjection(
      baseline,
      withoutSelected.length,
    );
    const withSummary = summarizeProjection(
      withSelected,
      withoutSelected.length + 1,
    );

    return {
      balanceImpact: (
        withSummary.finalBalance
        - baselineSummary.finalBalance
      ),
      minimumBalance: withSummary.minimumBalance,
      firstNegativeMonth: withSummary.firstNegativeMonth,
      verdict: withSummary.verdict,
    };
  }, [
    activeScenarios,
    horizon,
    initialBalance,
    selectedScenario,
    transactions,
  ]);


  function openCreateModal() {
    setEditingScenario(null);
    setForm(emptyForm);
    setFormError("");
    setIsModalOpen(true);
  }


  function openEditModal(
    scenario: PlanningScenario,
  ) {
    setEditingScenario(scenario);
    setForm({
      description: scenario.description,
      notes: scenario.notes ?? "",
      transactionType: scenario.transaction_type,
      groupType: scenario.group_type,
      amountInput: String(
        Math.round(Number(scenario.amount) * 100),
      ),
      occurrenceCount: (
        scenario.occurrence_count?.toString()
        ?? ""
      ),
      startDate: scenario.start_date,
      isActive: scenario.is_active,
    });
    setFormError("");
    setIsModalOpen(true);
  }


  function changeGroupType(groupType: GroupType) {
    setForm((current) => ({
      ...current,
      groupType,
      occurrenceCount: (
        groupType === "single"
          ? ""
          : current.occurrenceCount || "12"
      ),
    }));
  }


  async function submitScenario(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setFormError("");

    const amount = parseCurrencyInput(
      form.amountInput,
    );
    const occurrenceCount = (
      Number(form.occurrenceCount) || null
    );

    if (!form.description.trim()) {
      setFormError("Informe uma descrição.");
      return;
    }

    if (amount <= 0) {
      setFormError("Informe um valor maior que zero.");
      return;
    }

    if (
      form.groupType === "installment"
      && (
        occurrenceCount === null
        || occurrenceCount < 2
      )
    ) {
      setFormError("Informe pelo menos 2 parcelas.");
      return;
    }

    const payload: PlanningScenarioInput = {
      description: form.description.trim(),
      notes: form.notes.trim() || null,
      transaction_type: form.transactionType,
      group_type: form.groupType,
      amount,
      occurrence_count: (
        form.groupType === "single"
          ? null
          : occurrenceCount
      ),
      start_date: form.startDate,
      is_active: form.isActive,
    };

    setIsSaving(true);

    try {
      if (editingScenario) {
        await planningService.update(
          editingScenario.id,
          payload,
        );
      } else {
        const created = await planningService.create(payload);
        setSelectedScenarioId(created.id);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (caughtError) {
      setFormError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível salvar o cenário.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  async function toggleScenario(
    scenario: PlanningScenario,
  ) {
    setActionId(scenario.id);

    try {
      await planningService.setActive(
        scenario.id,
        !scenario.is_active,
      );
      await loadData();
    } catch (caughtError) {
      window.alert(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível alterar o cenário.",
      );
    } finally {
      setActionId(null);
    }
  }


  async function removeScenario(
    scenario: PlanningScenario,
  ) {
    const confirmed = window.confirm(
      `Excluir o cenário "${scenario.description}"?`,
    );

    if (!confirmed) {
      return;
    }

    setActionId(scenario.id);

    try {
      await planningService.remove(scenario.id);

      if (selectedScenarioId === scenario.id) {
        setSelectedScenarioId(null);
      }

      await loadData();
    } catch (caughtError) {
      window.alert(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível excluir o cenário.",
      );
    } finally {
      setActionId(null);
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


  if (error) {
    return (
      <Card>
        <PageState
          title="Não foi possível abrir o planejamento"
          description={error}
          actionLabel="Tentar novamente"
          onAction={() => void loadData()}
        />
      </Card>
    );
  }


  const verdict = verdictContent[summary.verdict];

  if (isMobile) {
    return (
      <PlanningMobile
        horizon={horizon}
        initialBalance={
          initialBalance
        }
        summary={summary}
        projection={projection}
        scenarios={scenarios}
        selectedScenarioId={
          selectedScenarioId
        }
        selectedScenario={
          selectedScenario
        }
        selectedScenarioProjection={
          selectedScenarioProjection
        }
        actionId={actionId}
        isModalOpen={
          isModalOpen
        }
        isSaving={isSaving}
        form={form}
        editingScenario={
          editingScenario
        }
        formError={formError}
        setHorizon={setHorizon}
        setInitialBalance={
          setInitialBalance
        }
        setSelectedScenarioId={
          setSelectedScenarioId
        }
        setIsModalOpen={
          setIsModalOpen
        }
        setForm={setForm}
        openCreateModal={
          openCreateModal
        }
        openEditModal={
          openEditModal
        }
        toggleScenario={
          toggleScenario
        }
        removeScenario={
          removeScenario
        }
        changeGroupType={
          changeGroupType
        }
        submitScenario={
          submitScenario
        }
      />
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>
            Projeção futura
          </span>
          <h1>Planejamento financeiro</h1>
          <p>
            Simule compromissos antes de transformá-los em despesas reais.
          </p>
        </div>

        <Button onClick={openCreateModal}>
          Novo cenário
        </Button>
      </header>

      <section className={styles.controls}>
        <label>
          <span>Horizonte</span>
          <select
            value={horizon}
            onChange={(event) => (
              setHorizon(Number(event.target.value))
            )}
          >
            <option value={6}>6 meses</option>
            <option value={12}>12 meses</option>
            <option value={18}>18 meses</option>
            <option value={24}>24 meses</option>
          </select>
        </label>

        <Input
          label="Saldo disponível hoje"
          type="number"
          step="0.01"
          value={initialBalance}
          onChange={(event) => (
            setInitialBalance(
              Number(event.target.value) || 0,
            )
          )}
          hint="Usado como ponto de partida da projeção."
        />
      </section>

      <section className={styles.metricsGrid}>
        <Card>
          <div className={styles.metric}>
            <span>Saldo ao final</span>
            <strong
              className={
                summary.finalBalance >= 0
                  ? styles.positive
                  : styles.negative
              }
            >
              {formatCurrency(summary.finalBalance)}
            </strong>
            <small>Após {horizon} meses</small>
          </div>
        </Card>

        <Card>
          <div className={styles.metric}>
            <span>Menor saldo projetado</span>
            <strong
              className={
                summary.minimumBalance >= 0
                  ? styles.positive
                  : styles.negative
              }
            >
              {formatCurrency(summary.minimumBalance)}
            </strong>
            <small>Pior ponto da projeção</small>
          </div>
        </Card>

        <Card>
          <div className={styles.metric}>
            <span>Primeiro mês negativo</span>
            <strong>
              {summary.firstNegativeMonth?.label ?? "Nenhum"}
            </strong>
            <small>
              {summary.firstNegativeMonth
                ? "Ajuste o cenário antes de assumir o compromisso"
                : "A projeção permanece positiva"}
            </small>
          </div>
        </Card>

        <Card>
          <div className={styles.metric}>
            <span>Diagnóstico</span>
            <div className={styles.verdictLine}>
              <Badge variant={verdict.variant}>
                {verdict.label}
              </Badge>
            </div>
            <small>{verdict.description}</small>
          </div>
        </Card>
      </section>

      <section className={styles.mainGrid}>
        <Card
          title="Projeção mensal"
          description="Base real somada aos cenários ativos."
        >
          <div className={styles.projectionList}>
            {projection.map((month) => {
              const scenarioImpact = (
                month.scenarioIncome
                - month.scenarioExpense
              );

              return (
                <article
                  className={styles.projectionMonth}
                  key={month.key}
                >
                  <div className={styles.monthHeader}>
                    <strong>{month.label}</strong>
                    <span
                      className={
                        month.accumulatedBalance >= 0
                          ? styles.positive
                          : styles.negative
                      }
                    >
                      Saldo {formatCurrency(month.accumulatedBalance)}
                    </span>
                  </div>

                  <div className={styles.monthValues}>
                    <span>
                      Base: {formatCurrency(month.baseResult)}
                    </span>
                    <span
                      className={
                        scenarioImpact >= 0
                          ? styles.positive
                          : styles.negative
                      }
                    >
                      Cenários: {scenarioImpact >= 0 ? "+ " : "− "}
                      {formatCurrency(Math.abs(scenarioImpact))}
                    </span>
                    <strong
                      className={
                        month.projectedResult >= 0
                          ? styles.positive
                          : styles.negative
                      }
                    >
                      Resultado {formatCurrency(month.projectedResult)}
                    </strong>
                  </div>

                  <div className={styles.balanceTrack}>
                    <div
                      className={
                        month.accumulatedBalance >= 0
                          ? styles.balancePositive
                          : styles.balanceNegative
                      }
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            8,
                            Math.abs(month.accumulatedBalance)
                            / Math.max(
                              ...projection.map(
                                (item) => Math.abs(item.accumulatedBalance),
                              ),
                              1,
                            )
                            * 100,
                          ),
                        )}%`,
                      }}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </Card>

        <aside className={styles.scenarioColumn}>
          <Card
            title="Cenários salvos"
            description="Ative e desative para comparar possibilidades."
          >
            {scenarios.length === 0 ? (
              <PageState
                title="Nenhum cenário"
                description="Simule uma compra, dívida, renda ou assinatura."
                actionLabel="Criar cenário"
                onAction={openCreateModal}
              />
            ) : (
              <div className={styles.scenarioList}>
                {scenarios.map((scenario) => (
                  <article
                    className={[
                      styles.scenarioItem,
                      selectedScenarioId === scenario.id
                        ? styles.scenarioSelected
                        : "",
                    ].filter(Boolean).join(" ")}
                    key={scenario.id}
                  >
                    <button
                      type="button"
                      className={styles.scenarioSelect}
                      onClick={() => setSelectedScenarioId(scenario.id)}
                    >
                      <div className={styles.scenarioTitle}>
                        <strong>{scenario.description}</strong>
                        <Badge
                          variant={
                            scenario.transaction_type === "income"
                              ? "positive"
                              : "negative"
                          }
                        >
                          {scenario.transaction_type === "income"
                            ? "Receita"
                            : "Despesa"}
                        </Badge>
                      </div>
                      <span>
                        {groupLabels[scenario.group_type]}
                        {scenario.occurrence_count
                          ? ` • ${scenario.occurrence_count} meses`
                          : ""}
                      </span>
                      <strong>
                        {formatCurrency(scenario.amount)}
                      </strong>
                    </button>

                    <div className={styles.scenarioActions}>
                      <Button
                        type="button"
                        variant="tertiary"
                        size="small"
                        disabled={actionId === scenario.id}
                        onClick={() => openEditModal(scenario)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="tertiary"
                        size="small"
                        isLoading={actionId === scenario.id}
                        onClick={() => void toggleScenario(scenario)}
                      >
                        {scenario.is_active ? "Desativar" : "Ativar"}
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="small"
                        disabled={actionId === scenario.id}
                        onClick={() => void removeScenario(scenario)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Card>

          {selectedScenario && selectedScenarioProjection ? (
            <Card
              title="Esse compromisso cabe?"
              description={selectedScenario.description}
            >
              <div className={styles.analysis}>
                <Badge
                  variant={
                    verdictContent[
                      selectedScenarioProjection.verdict
                    ].variant
                  }
                >
                  {
                    verdictContent[
                      selectedScenarioProjection.verdict
                    ].label
                  }
                </Badge>

                <dl>
                  <div>
                    <dt>Impacto no saldo final</dt>
                    <dd
                      className={
                        selectedScenarioProjection.balanceImpact >= 0
                          ? styles.positive
                          : styles.negative
                      }
                    >
                      {formatCurrency(
                        selectedScenarioProjection.balanceImpact,
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Menor saldo com o cenário</dt>
                    <dd>
                      {formatCurrency(
                        selectedScenarioProjection.minimumBalance,
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Primeiro mês negativo</dt>
                    <dd>
                      {
                        selectedScenarioProjection
                          .firstNegativeMonth?.label
                        ?? "Nenhum"
                      }
                    </dd>
                  </div>
                </dl>
              </div>
            </Card>
          ) : null}
        </aside>
      </section>

      <Card
        title="Tabela de projeção"
        description="Valores detalhados para conferir mês a mês."
      >
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mês</th>
                <th>Receitas reais</th>
                <th>Despesas reais</th>
                <th>Impacto dos cenários</th>
                <th>Resultado</th>
                <th>Saldo acumulado</th>
              </tr>
            </thead>
            <tbody>
              {projection.map((month) => (
                <tr key={month.key}>
                  <td><strong>{month.label}</strong></td>
                  <td className={styles.positive}>
                    {formatCurrency(month.baseIncome)}
                  </td>
                  <td className={styles.negative}>
                    {formatCurrency(month.baseExpense)}
                  </td>
                  <td>
                    {formatCurrency(
                      month.scenarioIncome - month.scenarioExpense,
                    )}
                  </td>
                  <td
                    className={
                      month.projectedResult >= 0
                        ? styles.positive
                        : styles.negative
                    }
                  >
                    {formatCurrency(month.projectedResult)}
                  </td>
                  <td
                    className={
                      month.accumulatedBalance >= 0
                        ? styles.positive
                        : styles.negative
                    }
                  >
                    {formatCurrency(month.accumulatedBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        title={editingScenario ? "Editar cenário" : "Novo cenário"}
        description="Este cenário afeta apenas a projeção, não suas movimentações reais."
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <form className={styles.form} onSubmit={submitScenario}>
          {formError ? (
            <div className={styles.formError} role="alert">
              {formError}
            </div>
          ) : null}

          <Input
            label="Descrição"
            placeholder="Ex.: Financiamento do carro"
            value={form.description}
            onChange={(event) => setForm((current) => ({
              ...current,
              description: event.target.value,
            }))}
            required
          />

          <div className={styles.twoColumns}>
            <label className={styles.field}>
              <span>Tipo</span>
              <select
                value={form.transactionType}
                onChange={(event) => setForm((current) => ({
                  ...current,
                  transactionType: event.target.value as TransactionType,
                }))}
              >
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Formato</span>
              <select
                value={form.groupType}
                onChange={(event) => changeGroupType(
                  event.target.value as GroupType,
                )}
              >
                <option value="single">Avulso</option>
                <option value="installment">Parcelado</option>
                <option value="recurring">Recorrente</option>
              </select>
            </label>
          </div>

          <div className={styles.twoColumns}>
            <Input
              label={
                form.groupType === "installment"
                  ? "Valor total"
                  : "Valor por mês"
              }
              inputMode="numeric"
              value={
                form.amountInput
                  ? formatCurrency(
                      parseCurrencyInput(form.amountInput),
                    )
                  : ""
              }
              onChange={(event) => setForm((current) => ({
                ...current,
                amountInput: event.target.value,
              }))}
              required
            />

            <Input
              label="Início"
              type="date"
              value={form.startDate}
              onChange={(event) => setForm((current) => ({
                ...current,
                startDate: event.target.value,
              }))}
              required
            />
          </div>

          {form.groupType !== "single" ? (
            <Input
              label={
                form.groupType === "installment"
                  ? "Número de parcelas"
                  : "Quantidade de meses"
              }
              type="number"
              min={form.groupType === "installment" ? 2 : 1}
              placeholder={
                form.groupType === "recurring"
                  ? "Vazio para continuar durante toda a projeção"
                  : undefined
              }
              value={form.occurrenceCount}
              onChange={(event) => setForm((current) => ({
                ...current,
                occurrenceCount: event.target.value,
              }))}
              required={form.groupType === "installment"}
            />
          ) : null}

          <label className={styles.field}>
            <span>Observações</span>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(event) => setForm((current) => ({
                ...current,
                notes: event.target.value,
              }))}
            />
          </label>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm((current) => ({
                ...current,
                isActive: event.target.checked,
              }))}
            />
            <span>Incluir imediatamente na projeção</span>
          </label>

          <div className={styles.formActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Salvar cenário
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
