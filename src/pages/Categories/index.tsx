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
import { PageState } from "../../components/PageState";
import { ApiError } from "../../services/api";
import { categoryService } from "../../services/categoryService";
import type {
  Category,
  CategoryApplication,
  CategoryCreateInput,
} from "../../types/finance";

import styles from "./styles.module.css";

const applicationLabels: Record<CategoryApplication, string> = {
  income: "Receitas",
  expense: "Despesas",
  both: "Ambos",
};

const initialForm: CategoryCreateInput = {
  name: "",
  application: "expense",
};

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] =
    useState<CategoryCreateInput>(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const groupedCategories = useMemo(
    () => ({
      expense: categories.filter(
        (category) => category.application === "expense",
      ),
      income: categories.filter(
        (category) => category.application === "income",
      ),
      both: categories.filter(
        (category) => category.application === "both",
      ),
    }),
    [categories],
  );

  const loadCategories = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const data = await categoryService.list();
      setCategories(data);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível carregar as categorias.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  function openModal() {
    setForm(initialForm);
    setFormError("");
    setIsModalOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setIsSaving(true);

    try {
      const created = await categoryService.create(form);

      setCategories((current) =>
        [...current, created].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );

      setIsModalOpen(false);
      setForm(initialForm);
    } catch (caughtError) {
      setFormError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível criar a categoria.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>Organização</span>
          <h1>Categorias</h1>
          <p>
            Classifique suas receitas e despesas sem complicação.
          </p>
        </div>

        <Button onClick={openModal}>
          Nova categoria
        </Button>
      </header>

      <section className={styles.summaryGrid}>
        <Card>
          <div className={styles.summary}>
            <span>Despesas</span>
            <strong>{groupedCategories.expense.length}</strong>
          </div>
        </Card>

        <Card>
          <div className={styles.summary}>
            <span>Receitas</span>
            <strong>{groupedCategories.income.length}</strong>
          </div>
        </Card>

        <Card>
          <div className={styles.summary}>
            <span>Ambos</span>
            <strong>{groupedCategories.both.length}</strong>
          </div>
        </Card>
      </section>

      {isLoading ? (
        <Card>
          <PageState
            title="Carregando categorias"
            description="Buscando suas classificações financeiras."
          />
        </Card>
      ) : error ? (
        <Card>
          <PageState
            title="Não foi possível carregar"
            description={error}
            actionLabel="Tentar novamente"
            onAction={() => void loadCategories()}
          />
        </Card>
      ) : categories.length === 0 ? (
        <Card>
          <PageState
            title="Nenhuma categoria cadastrada"
            description="Crie sua primeira categoria para organizar as movimentações."
            actionLabel="Criar categoria"
            onAction={openModal}
          />
        </Card>
      ) : (
        <div className={styles.categoryGrid}>
          {(
            [
              ["expense", "Categorias de despesas"],
              ["income", "Categorias de receitas"],
              ["both", "Categorias gerais"],
            ] as const
          ).map(([application, title]) => (
            <Card key={application} title={title}>
              <div className={styles.categoryList}>
                {groupedCategories[application].length === 0 ? (
                  <p className={styles.emptyGroup}>
                    Nenhuma categoria neste grupo.
                  </p>
                ) : (
                  groupedCategories[application].map((category) => (
                    <article
                      className={styles.categoryRow}
                      key={category.id}
                    >
                      <div className={styles.categoryIdentity}>
                        <div
                          className={styles.categoryDot}
                          aria-hidden="true"
                        />

                        <div>
                          <strong>{category.name}</strong>
                          <span>
                            {applicationLabels[category.application]}
                          </span>
                        </div>
                      </div>

                      <div className={styles.categoryBadges}>
                        {category.is_system_default ? (
                          <Badge variant="info">Inicial</Badge>
                        ) : (
                          <Badge>Personalizada</Badge>
                        )}

                        {!category.is_active ? (
                          <Badge variant="negative">Inativa</Badge>
                        ) : null}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        title="Nova categoria"
        description="Crie uma classificação personalizada."
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          {formError ? (
            <div className={styles.formError} role="alert">
              {formError}
            </div>
          ) : null}

          <Input
            label="Nome"
            placeholder="Ex.: Pets, Academia, Freelance"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            required
          />

          <label className={styles.selectField}>
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
              <option value="expense">Despesas</option>
              <option value="income">Receitas</option>
              <option value="both">Receitas e despesas</option>
            </select>
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
              Criar categoria
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
