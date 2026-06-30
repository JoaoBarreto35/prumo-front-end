import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { PageState } from "../../components/PageState";
import { accountService } from "../../services/accountService";
import { ApiError } from "../../services/api";
import { categoryService } from "../../services/categoryService";
import { transactionCrudService } from "../../services/transactionCrudService";
import type {
  Account,
  Category,
} from "../../types/finance";
import type {
  TransactionDetail,
  TransactionEditScope,
} from "../../types/transactionCrud";
import {
  formatCurrency,
  parseCurrencyInput,
} from "../../utils/currency";
import { ClosedMonthWarning } from "../../components/ClosedMonthWarning";

import styles from "./styles.module.css";

export function EditTransactionPage() {
  const navigate = useNavigate();
  const { transactionId } = useParams();

  const [transaction, setTransaction] =
    useState<TransactionDetail | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [scope, setScope] =
    useState<TransactionEditScope>("single");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const amount = useMemo(
    () => parseCurrencyInput(amountInput),
    [amountInput],
  );

  const visibleCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.is_active &&
          transaction &&
          (category.application === transaction.transaction_type ||
            category.application === "both"),
      ),
    [categories, transaction],
  );

  const loadData = useCallback(async () => {
    if (!transactionId) {
      setError("Movimentação inválida.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [detail, accountsData, categoriesData] =
        await Promise.all([
          transactionCrudService.getDetail(transactionId),
          accountService.list(),
          categoryService.list(),
        ]);

      setTransaction(detail);
      setAccounts(
        accountsData.filter((account) => account.is_active),
      );
      setCategories(categoriesData);

      setDescription(detail.description);
      setNotes(detail.notes ?? "");
      setAccountId(detail.account_id);
      setCategoryId(detail.category_id ?? "");
      setAmountInput(
        String(Math.round(Number(detail.amount) * 100)),
      );
      setDueDate(detail.due_date);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível carregar a edição.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setFormError("");

    if (!transactionId || !description.trim()) {
      setFormError("Informe uma descrição.");
      return;
    }

    if (!accountId || amount <= 0 || !dueDate) {
      setFormError(
        "Preencha conta, valor e data prevista.",
      );
      return;
    }

    setIsSaving(true);

    try {
      await transactionCrudService.update(transactionId, {
        scope,
        description: description.trim(),
        notes: notes.trim() || null,
        account_id: accountId,
        category_id: categoryId || null,
        amount,
        due_date: dueDate,
      });

      navigate(`/transactions/${transactionId}`, {
        replace: true,
      });
    } catch (caughtError) {
      setFormError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível atualizar a movimentação.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!transactionId) {
      return;
    }

    const confirmed = window.confirm(
      scope === "single"
        ? "Excluir somente esta movimentação?"
        : scope === "this_and_following"
          ? "Excluir esta movimentação e todas as próximas?"
          : "Excluir todo o grupo definitivamente?",
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await transactionCrudService.remove(transactionId, scope);
      navigate("/transactions", {
        replace: true,
      });
    } catch (caughtError) {
      setFormError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível excluir.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <PageState
          title="Carregando edição"
          description="Preparando os dados da movimentação."
        />
      </Card>
    );
  }

  if (error || !transaction) {
    return (
      <Card>
        <PageState
          title="Não foi possível editar"
          description={error || "Movimentação não encontrada."}
          actionLabel="Voltar"
          onAction={() => navigate("/transactions")}
        />
      </Card>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Movimentações</span>
          <h1>Editar movimentação</h1>
          <p>
            Escolha o alcance da alteração antes de salvar.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() =>
            navigate(`/transactions/${transaction.id}`)
          }
        >
          Cancelar
        </Button>
      </header>
      <ClosedMonthWarning
        referenceDate={form.dueDate}
      />
      <form className={styles.layout} onSubmit={handleSubmit}>
        <div className={styles.main}>
          {transaction.group_type !== "single" ? (
            <Card
              title="Alcance da alteração"
              description="Defina quais ocorrências serão alteradas."
            >
              <div className={styles.scopeGrid}>
                <button
                  type="button"
                  className={
                    scope === "single"
                      ? styles.scopeActive
                      : ""
                  }
                  onClick={() => setScope("single")}
                >
                  <strong>Somente esta</strong>
                  <span>
                    Altera apenas a ocorrência selecionada.
                  </span>
                </button>

                <button
                  type="button"
                  className={
                    scope === "this_and_following"
                      ? styles.scopeActive
                      : ""
                  }
                  onClick={() =>
                    setScope("this_and_following")
                  }
                >
                  <strong>Esta e próximas</strong>
                  <span>
                    Mantém as anteriores sem alteração.
                  </span>
                </button>

                <button
                  type="button"
                  className={
                    scope === "entire_group"
                      ? styles.scopeActive
                      : ""
                  }
                  onClick={() => setScope("entire_group")}
                >
                  <strong>Grupo inteiro</strong>
                  <span>
                    Recalcula toda a série ou parcelamento.
                  </span>
                </button>
              </div>
            </Card>
          ) : null}

          <Card title="Dados">
            <div className={styles.formGrid}>
              <div className={styles.fullWidth}>
                <Input
                  label="Descrição"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  required
                />
              </div>

              <label className={styles.field}>
                <span>Conta</span>
                <select
                  value={accountId}
                  onChange={(event) =>
                    setAccountId(event.target.value)
                  }
                  required
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.field}>
                <span>Categoria</span>
                <select
                  value={categoryId}
                  onChange={(event) =>
                    setCategoryId(event.target.value)
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
                  transaction.group_type === "installment" &&
                    scope === "entire_group"
                    ? "Novo valor total"
                    : "Valor"
                }
                value={formatCurrency(amount)}
                onChange={(event) =>
                  setAmountInput(event.target.value)
                }
                inputMode="numeric"
                required
              />

              <Input
                label="Nova data prevista"
                type="date"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(event.target.value)
                }
                required
              />

              <label
                className={[
                  styles.field,
                  styles.fullWidth,
                ].join(" ")}
              >
                <span>Observações</span>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </label>
            </div>
          </Card>
        </div>

        <aside className={styles.aside}>
          <Card title="Resumo da alteração">
            <dl className={styles.summary}>
              <div>
                <dt>Ocorrência</dt>
                <dd>
                  {transaction.sequence_number} de{" "}
                  {transaction.total_occurrences}
                </dd>
              </div>

              <div>
                <dt>Alcance</dt>
                <dd>
                  {scope === "single"
                    ? "Somente esta"
                    : scope === "this_and_following"
                      ? "Esta e próximas"
                      : "Grupo inteiro"}
                </dd>
              </div>

              <div>
                <dt>Novo valor</dt>
                <dd>{formatCurrency(amount)}</dd>
              </div>
            </dl>
          </Card>

          {formError ? (
            <div className={styles.error} role="alert">
              {formError}
            </div>
          ) : null}

          <Button
            type="submit"
            fullWidth
            isLoading={isSaving}
          >
            Salvar alterações
          </Button>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            isLoading={isDeleting}
            onClick={() => void handleDelete()}
          >
            Excluir
          </Button>
        </aside>
      </form>
    </div>
  );
}
