import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { Modal } from "../../components/Modal";
import { PageSkeleton } from "../../components/PageSkeleton";
import { PageState } from "../../components/PageState";
import { ApiError } from "../../services/api";
import { categoryService } from "../../services/categoryService";
import type {
  Category,
  CategoryApplication,
  CategoryCreateInput,
  StructureImpact,
} from "../../types/finance";

import styles from "./styles.module.css";


type DataAction =
  | "transfer"
  | "delete";


const applicationLabels:
  Record<
    CategoryApplication,
    string
  > = {
    income: "Receitas",
    expense: "Despesas",
    both: "Receitas e despesas",
  };


const initialForm:
  CategoryCreateInput = {
    name: "",
    application: "expense",
  };


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


export function CategoriesPage() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [form, setForm] =
    useState(initialForm);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [formError, setFormError] =
    useState("");

  const [actionId, setActionId] =
    useState<string | null>(null);

  const [managedCategory, setManagedCategory] =
    useState<Category | null>(null);

  const [impact, setImpact] =
    useState<StructureImpact | null>(null);

  const [isImpactLoading, setIsImpactLoading] =
    useState(false);

  const [dataAction, setDataAction] =
    useState<DataAction>("transfer");

  const [targetCategoryId, setTargetCategoryId] =
    useState("");

  const [clearCategory, setClearCategory] =
    useState(false);

  const [confirmClosedMonths, setConfirmClosedMonths] =
    useState(false);

  const [deleteConfirmation, setDeleteConfirmation] =
    useState("");

  const [operationError, setOperationError] =
    useState("");


  const activeCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.is_active,
      ),
    [categories],
  );

  const inactiveCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          !category.is_active,
      ),
    [categories],
  );

  const groupedActive = useMemo(
    () => ({
      expense:
        activeCategories.filter(
          (category) =>
            category.application
            === "expense",
        ),
      income:
        activeCategories.filter(
          (category) =>
            category.application
            === "income",
        ),
      both:
        activeCategories.filter(
          (category) =>
            category.application
            === "both",
        ),
    }),
    [activeCategories],
  );


  const loadCategories = useCallback(
    async () => {
      setError("");
      setIsLoading(true);

      try {
        const result =
          await categoryService.list();

        setCategories(result);
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Não foi possível carregar as categorias.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );


  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);


  function openCreate() {
    setEditingCategory(null);
    setForm(initialForm);
    setFormError("");
    setIsFormOpen(true);
  }


  function openEdit(
    category: Category,
  ) {
    setEditingCategory(category);
    setForm({
      name: category.name,
      application:
        category.application,
    });
    setFormError("");
    setIsFormOpen(true);
  }


  async function submitForm(
    event: FormEvent,
  ) {
    event.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError(
        "Informe o nome da categoria.",
      );
      return;
    }

    setIsSaving(true);

    try {
      if (editingCategory) {
        await categoryService.update(
          editingCategory.id,
          {
            name: form.name.trim(),
            application:
              form.application,
          },
        );
      } else {
        await categoryService.create({
          name: form.name.trim(),
          application:
            form.application,
        });
      }

      setIsFormOpen(false);
      await loadCategories();
      window.alert(
        editingCategory
          ? "Categoria atualizada com sucesso."
          : "Categoria criada com sucesso.",
      );
    } catch (caughtError) {
      setFormError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível salvar a categoria.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  async function archive(
    category: Category,
  ) {
    const confirmed =
      window.confirm(
        `Arquivar a categoria "${category.name}"? Ela não aparecerá em novos lançamentos.`,
      );

    if (!confirmed) {
      return;
    }

    setActionId(category.id);

    try {
      await categoryService.archive(
        category.id,
      );
      await loadCategories();
      window.alert(
        "Categoria arquivada com sucesso.",
      );
    } catch (caughtError) {
      window.alert(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível arquivar a categoria.",
      );
    } finally {
      setActionId(null);
    }
  }


  async function activate(
    category: Category,
  ) {
    setActionId(category.id);

    try {
      await categoryService.activate(
        category.id,
      );
      await loadCategories();
      window.alert(
        "Categoria reativada com sucesso.",
      );
    } catch (caughtError) {
      window.alert(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível reativar a categoria.",
      );
    } finally {
      setActionId(null);
    }
  }


  async function openDataManagement(
    category: Category,
  ) {
    setManagedCategory(category);
    setImpact(null);
    setOperationError("");
    setDataAction("transfer");
    setTargetCategoryId("");
    setClearCategory(false);
    setConfirmClosedMonths(false);
    setDeleteConfirmation("");
    setIsImpactLoading(true);

    try {
      const result =
        await categoryService.impact(
          category.id,
        );

      setImpact(result);

      if (
        result.can_delete_without_transfer
      ) {
        setDataAction("delete");
      }
    } catch (caughtError) {
      setOperationError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível calcular o impacto.",
      );
    } finally {
      setIsImpactLoading(false);
    }
  }


  async function executeDataAction() {
    if (!managedCategory || !impact) {
      return;
    }

    if (
      !impact
        .can_delete_without_transfer
      && !clearCategory
      && !targetCategoryId
    ) {
      setOperationError(
        "Escolha uma categoria de destino ou remova a classificação.",
      );
      return;
    }

    if (
      dataAction === "transfer"
      && !clearCategory
      && !targetCategoryId
    ) {
      setOperationError(
        "Escolha uma categoria de destino ou remova a classificação.",
      );
      return;
    }

    if (
      dataAction === "delete"
      && deleteConfirmation
        !== managedCategory.name
    ) {
      setOperationError(
        "Digite exatamente o nome da categoria para confirmar a exclusão.",
      );
      return;
    }

    if (
      impact.closed_months.length
      > 0
      && !confirmClosedMonths
    ) {
      setOperationError(
        "Confirme que está ciente dos meses fechados afetados.",
      );
      return;
    }

    setActionId(managedCategory.id);
    setOperationError("");

    try {
      const result =
        dataAction === "transfer"
          ? await categoryService.transfer(
              managedCategory.id,
              clearCategory
                ? null
                : targetCategoryId,
              clearCategory,
              confirmClosedMonths,
            )
          : await categoryService.remove(
              managedCategory.id,
              clearCategory
                ? null
                : targetCategoryId || null,
              clearCategory,
              confirmClosedMonths,
            );

      setManagedCategory(null);
      await loadCategories();
      window.alert(result.message);
    } catch (caughtError) {
      setOperationError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível concluir a operação.",
      );
    } finally {
      setActionId(null);
    }
  }


  function renderCategory(
    category: Category,
  ) {
    return (
      <article
        key={category.id}
        className={[
          styles.categoryRow,
          !category.is_active
            ? styles.inactiveRow
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          className={
            styles.categoryIdentity
          }
        >
          <span
            className={styles.categoryDot}
          />

          <div>
            <div
              className={styles.titleLine}
            >
              <strong>
                {category.name}
              </strong>

              {category
                .is_system_default ? (
                <Badge variant="info">
                  Inicial
                </Badge>
              ) : null}

              {!category.is_active ? (
                <Badge variant="neutral">
                  Arquivada
                </Badge>
              ) : null}
            </div>

            <span>
              {
                applicationLabels[
                  category.application
                ]
              }
            </span>
          </div>
        </div>

        <div className={styles.usage}>
          <span>
            <strong>
              {category.transaction_count}
            </strong>
            movimentações
          </span>

          <span>
            <strong>
              {category.income_count}
            </strong>
            receitas
          </span>

          <span>
            <strong>
              {category.expense_count}
            </strong>
            despesas
          </span>
        </div>

        <div className={styles.rowActions}>
          <Button
            size="small"
            variant="tertiary"
            onClick={() =>
              openEdit(category)
            }
          >
            Editar
          </Button>

          <Button
            size="small"
            variant="secondary"
            onClick={() =>
              void openDataManagement(
                category,
              )
            }
          >
            Dados
          </Button>

          {category.is_active ? (
            <Button
              size="small"
              variant="danger"
              disabled={actionId !== null}
              onClick={() =>
                void archive(category)
              }
            >
              Arquivar
            </Button>
          ) : (
            <Button
              size="small"
              isLoading={
                actionId === category.id
              }
              onClick={() =>
                void activate(category)
              }
            >
              Reativar
            </Button>
          )}
        </div>
      </article>
    );
  }


  return (
    <div className={styles.page}>
      <header
        className={styles.pageHeader}
      >
        <div>
          <span
            className={styles.eyebrow}
          >
            Organização financeira
          </span>

          <h1>Categorias</h1>

          <p>
            Renomeie, arquive, transfira
            ou mescle categorias sem
            perder o histórico.
          </p>
        </div>

        <Button onClick={openCreate}>
          Nova categoria
        </Button>
      </header>

      <section className={styles.summaryGrid}>
        <Card>
          <div className={styles.summary}>
            <span>Despesas</span>
            <strong>
              {groupedActive.expense.length}
            </strong>
          </div>
        </Card>

        <Card>
          <div className={styles.summary}>
            <span>Receitas</span>
            <strong>
              {groupedActive.income.length}
            </strong>
          </div>
        </Card>

        <Card>
          <div className={styles.summary}>
            <span>Uso geral</span>
            <strong>
              {groupedActive.both.length}
            </strong>
          </div>
        </Card>

        <Card>
          <div className={styles.summary}>
            <span>Arquivadas</span>
            <strong>
              {inactiveCategories.length}
            </strong>
          </div>
        </Card>
      </section>

      {isLoading ? (
        <PageSkeleton
          cards={0}
          rows={6}
        />
      ) : error ? (
        <Card>
          <PageState
            title="Não foi possível carregar"
            description={error}
            actionLabel="Tentar novamente"
            onAction={() =>
              void loadCategories()
            }
          />
        </Card>
      ) : categories.length === 0 ? (
        <Card>
          <PageState
            title="Nenhuma categoria"
            description="Crie uma categoria para organizar seus lançamentos."
            actionLabel="Criar categoria"
            onAction={openCreate}
          />
        </Card>
      ) : (
        <div className={styles.categoryGrid}>
          {(
            [
              [
                "expense",
                "Categorias de despesas",
              ],
              [
                "income",
                "Categorias de receitas",
              ],
              [
                "both",
                "Categorias gerais",
              ],
            ] as const
          ).map(
            ([application, title]) => (
              <Card
                key={application}
                title={title}
              >
                {groupedActive[
                  application
                ].length === 0 ? (
                  <p
                    className={styles.emptyGroup}
                  >
                    Nenhuma categoria neste grupo.
                  </p>
                ) : (
                  <div
                    className={
                      styles.categoryList
                    }
                  >
                    {groupedActive[
                      application
                    ].map(renderCategory)}
                  </div>
                )}
              </Card>
            ),
          )}

          {inactiveCategories.length
          > 0 ? (
            <Card
              title="Categorias arquivadas"
              description="Continuam no histórico, mas não aparecem em novos lançamentos."
            >
              <div
                className={
                  styles.categoryList
                }
              >
                {inactiveCategories.map(
                  renderCategory,
                )}
              </div>
            </Card>
          ) : null}
        </div>
      )}

      <Modal
        title={
          editingCategory
            ? "Editar categoria"
            : "Nova categoria"
        }
        description={
          editingCategory
            ? "A aplicação só pode ser reduzida quando não houver vínculos incompatíveis."
            : "Defina onde esta categoria poderá ser usada."
        }
        isOpen={isFormOpen}
        onClose={() =>
          setIsFormOpen(false)
        }
      >
        <form
          className={styles.form}
          onSubmit={(event) =>
            void submitForm(event)
          }
        >
          {formError ? (
            <div
              className={styles.formError}
              role="alert"
            >
              {formError}
            </div>
          ) : null}

          <Input
            label="Nome"
            value={form.name}
            maxLength={80}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            required
          />

          <label
            className={styles.selectField}
          >
            <span>Aplicação</span>

            <select
              value={form.application}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  application:
                    event.target.value as CategoryApplication,
                }))
              }
            >
              <option value="expense">
                Despesas
              </option>
              <option value="income">
                Receitas
              </option>
              <option value="both">
                Receitas e despesas
              </option>
            </select>
          </label>

          <div
            className={styles.formActions}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setIsFormOpen(false)
              }
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              isLoading={isSaving}
            >
              {editingCategory
                ? "Salvar alterações"
                : "Criar categoria"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        title={
          managedCategory
            ? `Dados de ${managedCategory.name}`
            : "Gerenciar dados"
        }
        description="Transfira ou remova a classificação antes da exclusão."
        isOpen={managedCategory !== null}
        onClose={() =>
          setManagedCategory(null)
        }
      >
        {managedCategory ? (
          <div
            className={styles.dataModal}
          >
            {operationError ? (
              <div
                className={styles.formError}
                role="alert"
              >
                {operationError}
              </div>
            ) : null}

            {isImpactLoading ? (
              <PageSkeleton
                cards={4}
                rows={0}
              />
            ) : impact ? (
              <>
                <section
                  className={styles.impactGrid}
                >
                  <article>
                    <span>Movimentações</span>
                    <strong>
                      {impact.transaction_count}
                    </strong>
                  </article>

                  <article>
                    <span>Grupos</span>
                    <strong>
                      {impact.group_count}
                    </strong>
                  </article>

                  <article>
                    <span>Receitas</span>
                    <strong>
                      {impact.income_count}
                    </strong>
                  </article>

                  <article>
                    <span>Despesas</span>
                    <strong>
                      {impact.expense_count}
                    </strong>
                  </article>
                </section>

                <p className={styles.periodText}>
                  Período vinculado: {formatDate(
                    impact.first_due_date,
                  )} até {formatDate(
                    impact.last_due_date,
                  )}.
                </p>

                <div
                  className={styles.actionSwitch}
                >
                  <button
                    type="button"
                    className={
                      dataAction === "transfer"
                        ? styles.activeAction
                        : ""
                    }
                    disabled={
                      impact.transaction_count
                      === 0
                      && impact.group_count === 0
                    }
                    onClick={() => {
                      setDataAction("transfer");
                      setOperationError("");
                    }}
                  >
                    Transferir dados
                  </button>

                  <button
                    type="button"
                    className={
                      dataAction === "delete"
                        ? styles.activeDanger
                        : ""
                    }
                    onClick={() => {
                      setDataAction("delete");
                      setOperationError("");
                    }}
                  >
                    Mesclar e excluir
                  </button>
                </div>

                <label
                  className={styles.checkbox}
                >
                  <input
                    type="checkbox"
                    checked={clearCategory}
                    onChange={(event) => {
                      setClearCategory(
                        event.target.checked,
                      );

                      if (
                        event.target.checked
                      ) {
                        setTargetCategoryId("");
                      }
                    }}
                  />

                  <span>
                    Remover a categoria dos
                    vínculos e deixar como
                    “Sem categoria”
                  </span>
                </label>

                {!clearCategory ? (
                  <label
                    className={styles.selectField}
                  >
                    <span>
                      Categoria de destino
                    </span>

                    <select
                      value={targetCategoryId}
                      onChange={(event) =>
                        setTargetCategoryId(
                          event.target.value,
                        )
                      }
                    >
                      <option value="">
                        Selecione
                      </option>

                      {activeCategories
                        .filter(
                          (category) =>
                            category.id
                            !== managedCategory.id,
                        )
                        .map((category) => (
                          <option
                            key={category.id}
                            value={category.id}
                          >
                            {category.name} — {
                              applicationLabels[
                                category.application
                              ]
                            }
                          </option>
                        ))}
                    </select>
                  </label>
                ) : null}

                <aside className={styles.infoBox}>
                  O Prumo altera os grupos e
                  movimentações vinculados. Valores,
                  datas, status e histórico continuam
                  iguais. O destino precisa aceitar os
                  tipos de lançamento existentes.
                </aside>

                {impact.closed_months.length
                > 0 ? (
                  <label
                    className={styles.closedWarning}
                  >
                    <input
                      type="checkbox"
                      checked={confirmClosedMonths}
                      onChange={(event) =>
                        setConfirmClosedMonths(
                          event.target.checked,
                        )
                      }
                    />

                    <span>
                      <strong>
                        Meses fechados afetados
                      </strong>
                      <small>
                        {impact.closed_months
                          .map(formatMonth)
                          .join(", ")}. As
                        fotografias oficiais serão
                        preservadas.
                      </small>
                    </span>
                  </label>
                ) : null}

                {dataAction === "delete" ? (
                  <label
                    className={styles.confirmField}
                  >
                    <span>
                      Digite <strong>
                        {managedCategory.name}
                      </strong> para excluir
                    </span>
                    <input
                      value={deleteConfirmation}
                      onChange={(event) =>
                        setDeleteConfirmation(
                          event.target.value,
                        )
                      }
                    />
                  </label>
                ) : null}

                <div
                  className={styles.formActions}
                >
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setManagedCategory(null)
                    }
                  >
                    Cancelar
                  </Button>

                  {dataAction === "delete" ? (
                    <Button
                      variant="danger"
                      isLoading={
                        actionId
                        === managedCategory.id
                      }
                      onClick={() =>
                        void executeDataAction()
                      }
                    >
                      Transferir e excluir
                    </Button>
                  ) : (
                    <Button
                      isLoading={
                        actionId
                        === managedCategory.id
                      }
                      onClick={() =>
                        void executeDataAction()
                      }
                    >
                      Confirmar transferência
                    </Button>
                  )}
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
