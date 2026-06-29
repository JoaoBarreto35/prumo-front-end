import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
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
  TransactionGroupCreateInput,
  TransactionType,
} from "../../types/transactions";
import {
  formatCurrency,
  parseCurrencyInput,
} from "../../utils/currency";

import styles from "./styles.module.css";

type FormState = {
  transactionType: TransactionType;
  groupType: GroupType;
  description: string;
  notes: string;
  accountId: string;
  categoryId: string;
  amountInput: string;
  occurrenceCount: string;
  startDate: string;
  endDate: string;
  isIndefinite: boolean;
};

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

const initialForm: FormState = {
  transactionType: "expense",
  groupType: "single",
  description: "",
  notes: "",
  accountId: "",
  categoryId: "",
  amountInput: "",
  occurrenceCount: "",
  startDate: getToday(),
  endDate: "",
  isIndefinite: false,
};

const groupTypeLabels: Record<GroupType, string> = {
  single: "Avulsa",
  installment: "Parcelada",
  recurring: "Recorrente",
};

export function NewTransactionPage() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const amount = useMemo(
    () => parseCurrencyInput(form.amountInput),
    [form.amountInput],
  );

  const activeAccounts = useMemo(
    () => accounts.filter((account) => account.is_active),
    [accounts],
  );

  const visibleCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.is_active &&
          (category.application === form.transactionType ||
            category.application === "both"),
      ),
    [categories, form.transactionType],
  );

  const selectedAccount = useMemo(
    () =>
      activeAccounts.find(
        (account) => account.id === form.accountId,
      ) ?? null,
    [activeAccounts, form.accountId],
  );

  const installments = Number(form.occurrenceCount) || 0;

  const perInstallmentAmount =
    form.groupType === "installment" && installments > 0
      ? amount / installments
      : amount;

  const loadDependencies = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const [accountsData, categoriesData] = await Promise.all([
        accountService.list(),
        categoryService.list(),
      ]);

      const active = accountsData.filter(
        (account) => account.is_active,
      );

      setAccounts(accountsData);
      setCategories(categoriesData);

      const defaultAccount =
        active.find((account) => account.is_default) ?? active[0];

      setForm((current) => ({
        ...current,
        accountId: current.accountId || defaultAccount?.id || "",
      }));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível carregar os dados do formulário.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDependencies();
  }, [loadDependencies]);

  useEffect(() => {
    const categoryStillValid = visibleCategories.some(
      (category) => category.id === form.categoryId,
    );

    if (!categoryStillValid) {
      setForm((current) => ({
        ...current,
        categoryId: "",
      }));
    }
  }, [form.categoryId, visibleCategories]);

  function updateField<Key extends keyof FormState>(
    key: Key,
    value: FormState[Key],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function changeGroupType(groupType: GroupType) {
    setForm((current) => ({
      ...current,
      groupType,
      occurrenceCount:
        groupType === "single"
          ? ""
          : current.occurrenceCount,
      endDate:
        groupType === "single"
          ? ""
          : current.endDate,
      isIndefinite:
        groupType === "recurring"
          ? current.isIndefinite
          : false,
    }));
  }

  function validate(): string | null {
    if (!form.description.trim()) {
      return "Informe uma descrição.";
    }

    if (!form.accountId) {
      return "Selecione uma conta.";
    }

    if (amount <= 0) {
      return "Informe um valor maior que zero.";
    }

    if (!form.startDate) {
      return "Informe a data inicial.";
    }

    if (
      form.groupType === "installment" &&
      installments < 2
    ) {
      return "Informe pelo menos 2 parcelas.";
    }

    if (
      form.groupType === "recurring" &&
      !form.isIndefinite &&
      installments < 1 &&
      !form.endDate
    ) {
      return "Informe uma quantidade, uma data final ou marque como recorrência sem fim.";
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const validationError = validate();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload: TransactionGroupCreateInput = {
      group_type: form.groupType,
      transaction_type: form.transactionType,
      description: form.description.trim(),
      notes: form.notes.trim() || null,
      account_id: form.accountId,
      category_id: form.categoryId || null,
      amount,
      occurrence_count:
        form.groupType === "single"
          ? null
          : installments > 0
            ? installments
            : null,
      start_date: form.startDate,
      end_date: form.endDate || null,
      is_indefinite:
        form.groupType === "recurring" &&
        form.isIndefinite,
      origin: "manual",
    };

    setIsSaving(true);

    try {
      await transactionService.createGroup(payload);
      navigate("/transactions", {
        replace: true,
        state: {
          successMessage: "Movimentação criada com sucesso.",
        },
      });
    } catch (caughtError) {
      setFormError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível criar a movimentação.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <PageState
          title="Preparando o lançamento"
          description="Carregando contas e categorias."
        />
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <PageState
          title="Não foi possível abrir o formulário"
          description={error}
          actionLabel="Tentar novamente"
          onAction={() => void loadDependencies()}
        />
      </Card>
    );
  }

  if (activeAccounts.length === 0) {
    return (
      <Card>
        <PageState
          title="Você precisa de uma conta"
          description="Cadastre uma conta antes de registrar movimentações."
          actionLabel="Ir para Contas"
          onAction={() => navigate("/accounts")}
        />
      </Card>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>Movimentações</span>
          <h1>Nova movimentação</h1>
          <p>
            Registre uma receita ou despesa de forma simples.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => navigate("/transactions")}
        >
          Cancelar
        </Button>
      </header>

      <form className={styles.layout} onSubmit={handleSubmit}>
        <div className={styles.mainColumn}>
          <Card
            title="Tipo da movimentação"
            description="Escolha se o valor entra ou sai da sua vida financeira."
          >
            <div className={styles.segmentedControl}>
              <button
                type="button"
                className={
                  form.transactionType === "expense"
                    ? styles.segmentActive
                    : ""
                }
                onClick={() =>
                  updateField("transactionType", "expense")
                }
              >
                Despesa
              </button>

              <button
                type="button"
                className={
                  form.transactionType === "income"
                    ? styles.segmentActive
                    : ""
                }
                onClick={() =>
                  updateField("transactionType", "income")
                }
              >
                Receita
              </button>
            </div>
          </Card>

          <Card
            title="Repetição"
            description="Defina como essa movimentação se repete."
          >
            <div className={styles.typeGrid}>
              {(
                Object.entries(groupTypeLabels) as Array<
                  [GroupType, string]
                >
              ).map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={[
                    styles.typeCard,
                    form.groupType === value
                      ? styles.typeCardActive
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => changeGroupType(value)}
                >
                  <strong>{label}</strong>
                  <span>
                    {value === "single"
                      ? "Acontece apenas uma vez."
                      : value === "installment"
                        ? "Um valor total dividido em parcelas mensais."
                        : "O mesmo valor se repete mensalmente."}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          <Card
            title="Informações"
            description="Preencha os dados principais."
          >
            <div className={styles.formGrid}>
              <div className={styles.fullWidth}>
                <Input
                  label="Descrição"
                  placeholder="Ex.: Mercado, salário, motor do carro"
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value,
                    )
                  }
                  required
                />
              </div>

              <label className={styles.field}>
                <span>Conta</span>
                <select
                  value={form.accountId}
                  onChange={(event) =>
                    updateField(
                      "accountId",
                      event.target.value,
                    )
                  }
                  required
                >
                  <option value="">Selecione</option>
                  {activeAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                      {account.is_default ? " — padrão" : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.field}>
                <span>Categoria</span>
                <select
                  value={form.categoryId}
                  onChange={(event) =>
                    updateField(
                      "categoryId",
                      event.target.value,
                    )
                  }
                >
                  <option value="">Sem categoria</option>
                  {visibleCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <Input
                label={
                  form.groupType === "installment"
                    ? "Valor total"
                    : "Valor"
                }
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={
                  form.amountInput
                    ? formatCurrency(amount)
                    : ""
                }
                onChange={(event) =>
                  updateField(
                    "amountInput",
                    event.target.value,
                  )
                }
                required
              />

              <Input
                label="Data inicial"
                type="date"
                value={form.startDate}
                onChange={(event) =>
                  updateField(
                    "startDate",
                    event.target.value,
                  )
                }
                required
              />

              {form.groupType !== "single" ? (
                <Input
                  label={
                    form.groupType === "installment"
                      ? "Número de parcelas"
                      : "Quantidade de meses"
                  }
                  type="number"
                  min={
                    form.groupType === "installment" ? 2 : 1
                  }
                  placeholder={
                    form.groupType === "recurring"
                      ? "Opcional"
                      : undefined
                  }
                  value={form.occurrenceCount}
                  onChange={(event) =>
                    updateField(
                      "occurrenceCount",
                      event.target.value,
                    )
                  }
                  disabled={
                    form.groupType === "recurring" &&
                    form.isIndefinite
                  }
                  required={
                    form.groupType === "installment"
                  }
                />
              ) : null}

              {form.groupType === "recurring" ? (
                <Input
                  label="Data final"
                  type="date"
                  value={form.endDate}
                  onChange={(event) =>
                    updateField(
                      "endDate",
                      event.target.value,
                    )
                  }
                  disabled={form.isIndefinite}
                  hint="Opcional quando a quantidade de meses for informada."
                />
              ) : null}

              {form.groupType === "recurring" ? (
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={form.isIndefinite}
                    onChange={(event) =>
                      updateField(
                        "isIndefinite",
                        event.target.checked,
                      )
                    }
                  />
                  <span>
                    Manter recorrência ativa sem data final
                  </span>
                </label>
              ) : null}

              <label
                className={[
                  styles.field,
                  styles.fullWidth,
                ].join(" ")}
              >
                <span>Observações</span>
                <textarea
                  rows={4}
                  placeholder="Informações adicionais, se necessário"
                  value={form.notes}
                  onChange={(event) =>
                    updateField("notes", event.target.value)
                  }
                />
              </label>
            </div>
          </Card>
        </div>

        <aside className={styles.sideColumn}>
          <Card
            title="Resumo"
            description="Confira antes de salvar."
          >
            <dl className={styles.summary}>
              <div>
                <dt>Tipo</dt>
                <dd>
                  {form.transactionType === "expense"
                    ? "Despesa"
                    : "Receita"}
                </dd>
              </div>

              <div>
                <dt>Repetição</dt>
                <dd>{groupTypeLabels[form.groupType]}</dd>
              </div>

              <div>
                <dt>Conta</dt>
                <dd>{selectedAccount?.name ?? "Não selecionada"}</dd>
              </div>

              <div>
                <dt>
                  {form.groupType === "installment"
                    ? "Valor total"
                    : "Valor mensal"}
                </dt>
                <dd>{formatCurrency(amount)}</dd>
              </div>

              {form.groupType === "installment" ? (
                <>
                  <div>
                    <dt>Parcelas</dt>
                    <dd>{installments || "—"}</dd>
                  </div>

                  <div>
                    <dt>Valor aproximado</dt>
                    <dd>
                      {formatCurrency(perInstallmentAmount)}
                    </dd>
                  </div>
                </>
              ) : null}

              {form.groupType === "recurring" ? (
                <div>
                  <dt>Duração</dt>
                  <dd>
                    {form.isIndefinite
                      ? "Sem data final"
                      : installments > 0
                        ? `${installments} meses`
                        : form.endDate || "Não definida"}
                  </dd>
                </div>
              ) : null}
            </dl>
          </Card>

          {formError ? (
            <div className={styles.formError} role="alert">
              {formError}
            </div>
          ) : null}

          <Button
            type="submit"
            size="large"
            fullWidth
            isLoading={isSaving}
          >
            Salvar movimentação
          </Button>
        </aside>
      </form>
    </div>
  );
}
