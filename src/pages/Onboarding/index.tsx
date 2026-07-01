import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
} from "react-router";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { useAuth } from "../../contexts/AuthContext";
import {
  accountService,
} from "../../services/accountService";
import { ApiError } from "../../services/api";
import {
  categoryService,
} from "../../services/categoryService";
import {
  onboardingService,
} from "../../services/onboardingService";
import {
  transactionService,
} from "../../services/transactionService";
import type {
  Account,
  AccountType,
  Category,
  CategoryApplication,
} from "../../types/finance";
import type {
  OnboardingCustomCategory,
  OnboardingDraft,
  OnboardingExpenseDraft,
  OnboardingState,
  OnboardingStepKey,
} from "../../types/onboarding";
import {
  formatCurrency,
  parseCurrencyInput,
} from "../../utils/currency";

import styles from "./styles.module.css";


type StepDefinition = {
  key: OnboardingStepKey;
  title: string;
  shortTitle: string;
  description: string;
};


const steps: StepDefinition[] = [
  {
    key: "welcome",
    title:
      "Vamos preparar o seu Prumo",
    shortTitle: "Início",
    description:
      "Uma configuração rápida para o sistema já começar útil.",
  },
  {
    key: "account",
    title:
      "Qual será sua conta principal?",
    shortTitle: "Conta",
    description:
      "Você poderá criar e editar outras contas depois.",
  },
  {
    key: "categories",
    title:
      "Escolha suas categorias",
    shortTitle: "Categorias",
    description:
      "Mantenha apenas o que combina com sua rotina.",
  },
  {
    key: "income",
    title:
      "Cadastre sua renda principal",
    shortTitle: "Renda",
    description:
      "O Prumo usará essa recorrência nas projeções.",
  },
  {
    key: "expenses",
    title:
      "Quais despesas se repetem?",
    shortTitle: "Fixas",
    description:
      "Adicione aluguel, internet, academia e outros compromissos.",
  },
  {
    key: "tour",
    title:
      "Tudo pronto para começar",
    shortTitle: "Final",
    description:
      "Veja onde cada parte do Prumo ajuda você.",
  },
];


const categoryPresets: Array<{
  name: string;
  application:
    CategoryApplication;
}> = [
  {
    name: "Salário",
    application: "income",
  },
  {
    name: "Renda extra",
    application: "income",
  },
  {
    name: "Venda",
    application: "income",
  },
  {
    name: "Reembolso",
    application: "income",
  },
  {
    name: "Presente",
    application: "income",
  },
  {
    name: "Alimentação",
    application: "expense",
  },
  {
    name: "Transporte",
    application: "expense",
  },
  {
    name: "Carro",
    application: "expense",
  },
  {
    name: "Moradia",
    application: "expense",
  },
  {
    name: "Saúde",
    application: "expense",
  },
  {
    name: "Educação",
    application: "expense",
  },
  {
    name: "Lazer",
    application: "expense",
  },
  {
    name: "Assinaturas",
    application: "expense",
  },
  {
    name: "Compras",
    application: "expense",
  },
  {
    name: "Dívidas",
    application: "expense",
  },
  {
    name: "Outros",
    application: "both",
  },
];


const accountTypeLabels:
  Record<AccountType, string> = {
    immediate_payment:
      "Conta, PIX ou débito",
    credit_card:
      "Cartão de crédito",
    third_party_credit:
      "Cartão de outra pessoa",
    cash: "Dinheiro",
    other: "Outro",
  };


const tourItems = [
  {
    title: "Home",
    description:
      "Resumo do mês e próximos compromissos.",
    symbol: "⌂",
  },
  {
    title: "Calendário",
    description:
      "Datas de pagamento e recebimento organizadas.",
    symbol: "▦",
  },
  {
    title: "Planejamento",
    description:
      "Simule decisões antes de assumir uma dívida.",
    symbol: "↗",
  },
  {
    title: "Fechamentos",
    description:
      "Preserve a fotografia oficial de cada mês.",
    symbol: "✓",
  },
  {
    title: "Lume",
    description:
      "Converse com seus próprios dados financeiros.",
    symbol: "✦",
  },
  {
    title: "Relatórios",
    description:
      "Entenda para onde o dinheiro está indo.",
    symbol: "▥",
  },
];


function todayInput(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function createLocalId(): string {
  return (
    globalThis.crypto
      ?.randomUUID?.()
    ?? `local-${Date.now()}-${Math.random()}`
  );
}


function normalizeName(
  value: string,
): string {
  return value
    .trim()
    .toLocaleLowerCase("pt-BR");
}


function buildInitialDraft(
  state: OnboardingState,
  accounts: Account[],
  categories: Category[],
): OnboardingDraft {
  const defaultAccount =
    accounts.find(
      (account) =>
        account.is_default
        && account.is_active,
    )
    ?? accounts.find(
      (account) =>
        account.is_active,
    )
    ?? null;

  const activeCategories =
    categories.filter(
      (category) =>
        category.is_active,
    );

  const incomeCategory =
    activeCategories.find(
      (category) =>
        category.application
        === "income"
        && normalizeName(
          category.name,
        )
        === normalizeName(
          "Salário",
        ),
    )
    ?? activeCategories.find(
      (category) =>
        category.application
        === "income"
        || category.application
        === "both",
    );

  const expenseCategory =
    activeCategories.find(
      (category) =>
        category.application
        === "expense"
        || category.application
        === "both",
    );

  const saved = state.draft;

  return {
    account: {
      account_id:
        saved.account
          ?.account_id
        ?? defaultAccount?.id
        ?? null,
      name:
        saved.account?.name
        ?? defaultAccount?.name
        ?? "Conta principal",
      type:
        saved.account?.type
        ?? defaultAccount?.type
        ?? "immediate_payment",
      closing_day:
        saved.account
          ?.closing_day
        ?? defaultAccount
          ?.closing_day
        ?? null,
      due_day:
        saved.account?.due_day
        ?? defaultAccount?.due_day
        ?? null,
    },
    selected_categories:
      saved.selected_categories
      ?? activeCategories
        .filter(
          (category) =>
            category
              .is_system_default,
        )
        .map(
          (category) =>
            category.name,
        ),
    custom_categories:
      saved.custom_categories
      ?? activeCategories
        .filter(
          (category) =>
            !category
              .is_system_default,
        )
        .map(
          (category) => ({
            local_id:
              createLocalId(),
            name: category.name,
            application:
              category.application,
            created_id:
              category.id,
          }),
        ),
    archive_unselected_defaults:
      saved
        .archive_unselected_defaults
      ?? true,
    income: {
      enabled:
        saved.income?.enabled
        ?? true,
      description:
        saved.income
          ?.description
        ?? "Salário",
      amount_input:
        saved.income
          ?.amount_input
        ?? "",
      start_date:
        saved.income
          ?.start_date
        ?? todayInput(),
      account_id:
        saved.income
          ?.account_id
        ?? defaultAccount?.id
        ?? "",
      category_id:
        saved.income
          ?.category_id
        ?? incomeCategory?.id
        ?? "",
      created_group_id:
        saved.income
          ?.created_group_id
        ?? null,
    },
    expenses:
      saved.expenses
      ?? (
        defaultAccount
        && expenseCategory
          ? [
              {
                local_id:
                  createLocalId(),
                description: "",
                amount_input: "",
                start_date:
                  todayInput(),
                account_id:
                  defaultAccount.id,
                category_id:
                  expenseCategory.id,
                created_group_id:
                  null,
              },
            ]
          : []
      ),
  };
}


function nextCompletedSteps(
  current:
    OnboardingStepKey[],
  step: OnboardingStepKey,
): OnboardingStepKey[] {
  if (current.includes(step)) {
    return current;
  }

  return [
    ...current,
    step,
  ];
}


export function OnboardingPage() {
  const navigate =
    useNavigate();
  const { user } = useAuth();

  const [state, setState] =
    useState<
      OnboardingState | null
    >(null);

  const [accounts, setAccounts] =
    useState<Account[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [draft, setDraft] =
    useState<
      OnboardingDraft | null
    >(null);

  const [currentStep, setCurrentStep] =
    useState(1);

  const [
    completedSteps,
    setCompletedSteps,
  ] = useState<
    OnboardingStepKey[]
  >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  const loadData =
    useCallback(async () => {
      setIsLoading(true);
      setError("");

      try {
        const [
          onboardingState,
          accountData,
          categoryData,
        ] = await Promise.all([
          onboardingService.get(),
          accountService.list(),
          categoryService.list(),
        ]);

        setState(
          onboardingState,
        );
        setAccounts(accountData);
        setCategories(
          categoryData,
        );
        setCurrentStep(
          onboardingState
            .current_step,
        );
        setCompletedSteps(
          onboardingState
            .completed_steps,
        );
        setDraft(
          buildInitialDraft(
            onboardingState,
            accountData,
            categoryData,
          ),
        );
      } catch (caughtError) {
        setError(
          caughtError
          instanceof ApiError
            ? caughtError.message
            : "Não foi possível abrir a configuração inicial.",
        );
      } finally {
        setIsLoading(false);
      }
    }, []);


  useEffect(() => {
    void loadData();
  }, [loadData]);


  const activeAccounts =
    useMemo(
      () =>
        accounts.filter(
          (account) =>
            account.is_active,
        ),
      [accounts],
    );

  const activeCategories =
    useMemo(
      () =>
        categories.filter(
          (category) =>
            category.is_active,
        ),
      [categories],
    );

  const incomeCategories =
    useMemo(
      () =>
        activeCategories.filter(
          (category) =>
            category.application
            === "income"
            || category.application
            === "both",
        ),
      [activeCategories],
    );

  const expenseCategories =
    useMemo(
      () =>
        activeCategories.filter(
          (category) =>
            category.application
            === "expense"
            || category.application
            === "both",
        ),
      [activeCategories],
    );


  async function persist(
    nextStep: number,
    nextCompleted:
      OnboardingStepKey[],
    nextDraft: OnboardingDraft,
  ) {
    const updated =
      await onboardingService
        .saveProgress(
          nextStep,
          nextCompleted,
          nextDraft,
        );

    setState(updated);
    setCurrentStep(
      updated.current_step,
    );
    setCompletedSteps(
      updated.completed_steps,
    );
    setDraft(nextDraft);
  }


  async function moveForward(
    stepKey:
      OnboardingStepKey,
    nextDraft:
      OnboardingDraft,
  ) {
    const nextStep =
      Math.min(
        6,
        currentStep + 1,
      );

    const nextCompleted =
      nextCompletedSteps(
        completedSteps,
        stepKey,
      );

    await persist(
      nextStep,
      nextCompleted,
      nextDraft,
    );
  }


  async function handleAccountStep() {
    if (!draft) {
      return;
    }

    const name =
      draft.account.name.trim();

    if (!name) {
      setError(
        "Informe o nome da conta.",
      );
      return;
    }

    if (
      draft.account.type
      === "credit_card"
      || draft.account.type
      === "third_party_credit"
    ) {
      if (
        !draft.account
          .closing_day
        || !draft.account
          .due_day
      ) {
        setError(
          "Informe fechamento e vencimento do cartão.",
        );
        return;
      }
    }

    setIsSaving(true);
    setError("");

    try {
      let account: Account;

      if (
        draft.account
          .account_id
      ) {
        account =
          await accountService
            .update(
              draft.account
                .account_id,
              {
                name,
                type:
                  draft.account
                    .type,
                closing_day:
                  draft.account
                    .type
                  === "credit_card"
                  || draft.account
                    .type
                  === "third_party_credit"
                    ? draft.account
                        .closing_day
                    : null,
                due_day:
                  draft.account
                    .type
                  === "credit_card"
                  || draft.account
                    .type
                  === "third_party_credit"
                    ? draft.account
                        .due_day
                    : null,
              },
            );
      } else {
        account =
          await accountService
            .create({
              name,
              type:
                draft.account
                  .type,
              is_default: true,
              closing_day:
                draft.account
                  .closing_day,
              due_day:
                draft.account
                  .due_day,
            });
      }

      if (!account.is_default) {
        account =
          await accountService
            .setDefault(account.id);
      }

      const refreshed =
        await accountService
          .list();

      setAccounts(refreshed);

      const nextDraft = {
        ...draft,
        account: {
          ...draft.account,
          account_id:
            account.id,
          name: account.name,
        },
        income: {
          ...draft.income,
          account_id:
            draft.income
              .account_id
            || account.id,
        },
        expenses:
          draft.expenses.map(
            (expense) => ({
              ...expense,
              account_id:
                expense
                  .account_id
                || account.id,
            }),
          ),
      };

      await moveForward(
        "account",
        nextDraft,
      );
    } catch (caughtError) {
      setError(
        caughtError
        instanceof ApiError
          ? caughtError.message
          : "Não foi possível salvar a conta.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  async function handleCategoriesStep() {
    if (!draft) {
      return;
    }

    if (
      draft
        .selected_categories
        .length === 0
      && draft.custom_categories
        .every(
          (category) =>
            !category.name.trim(),
        )
    ) {
      setError(
        "Mantenha pelo menos uma categoria.",
      );
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      let current =
        await categoryService
          .list();

      const selectedNames =
        new Set(
          draft
            .selected_categories
            .map(normalizeName),
        );

      for (
        const preset
        of categoryPresets
      ) {
        if (
          !selectedNames.has(
            normalizeName(
              preset.name,
            ),
          )
        ) {
          continue;
        }

        const existing =
          current.find(
            (category) =>
              normalizeName(
                category.name,
              )
              === normalizeName(
                preset.name,
              ),
          );

        if (existing) {
          if (
            !existing.is_active
          ) {
            await categoryService
              .activate(
                existing.id,
              );
          }
        } else {
          await categoryService
            .create({
              name: preset.name,
              application:
                preset.application,
            });
        }
      }

      current =
        await categoryService
          .list();

      const nextCustom:
        OnboardingCustomCategory[] = [];

      for (
        const custom
        of draft.custom_categories
      ) {
        const customName =
          custom.name.trim();

        if (!customName) {
          continue;
        }

        const existing =
          current.find(
            (category) =>
              normalizeName(
                category.name,
              )
              === normalizeName(
                customName,
              ),
          );

        if (existing) {
          if (
            !existing.is_active
          ) {
            await categoryService
              .activate(
                existing.id,
              );
          }

          nextCustom.push({
            ...custom,
            created_id:
              existing.id,
          });
          continue;
        }

        const created =
          await categoryService
            .create({
              name: customName,
              application:
                custom.application,
            });

        nextCustom.push({
          ...custom,
          name: created.name,
          created_id:
            created.id,
        });
      }

      current =
        await categoryService
          .list();

      if (
        draft
          .archive_unselected_defaults
      ) {
        for (
          const category
          of current
        ) {
          if (
            category
              .is_system_default
            && category.is_active
            && !selectedNames.has(
              normalizeName(
                category.name,
              ),
            )
          ) {
            await categoryService
              .archive(
                category.id,
              );
          }
        }
      }

      const refreshed =
        await categoryService
          .list();

      setCategories(refreshed);

      const incomeCategory =
        refreshed.find(
          (category) =>
            category.is_active
            && (
              category.application
              === "income"
              || category.application
              === "both"
            )
            && normalizeName(
              category.name,
            )
            === normalizeName(
              "Salário",
            ),
        )
        ?? refreshed.find(
          (category) =>
            category.is_active
            && (
              category.application
              === "income"
              || category.application
              === "both"
            ),
        );

      const expenseCategory =
        refreshed.find(
          (category) =>
            category.is_active
            && (
              category.application
              === "expense"
              || category.application
              === "both"
            ),
        );

      const nextDraft = {
        ...draft,
        custom_categories:
          nextCustom,
        income: {
          ...draft.income,
          category_id:
            draft.income
              .category_id
            || incomeCategory?.id
            || "",
        },
        expenses:
          draft.expenses.map(
            (expense) => ({
              ...expense,
              category_id:
                expense
                  .category_id
                || expenseCategory
                  ?.id
                || "",
            }),
          ),
      };

      await moveForward(
        "categories",
        nextDraft,
      );
    } catch (caughtError) {
      setError(
        caughtError
        instanceof ApiError
          ? caughtError.message
          : "Não foi possível preparar as categorias.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  async function handleIncomeStep() {
    if (!draft) {
      return;
    }

    if (
      !draft.income.enabled
    ) {
      await moveForward(
        "income",
        draft,
      );
      return;
    }

    const amount =
      parseCurrencyInput(
        draft.income
          .amount_input,
      );

    if (
      !draft.income
        .description.trim()
      || amount <= 0
      || !draft.income
        .account_id
      || !draft.income
        .category_id
    ) {
      setError(
        "Preencha descrição, valor, conta e categoria da renda.",
      );
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      let nextDraft = draft;

      if (
        !draft.income
          .created_group_id
      ) {
        const group =
          await transactionService
            .createGroup({
              group_type:
                "recurring",
              transaction_type:
                "income",
              description:
                draft.income
                  .description
                  .trim(),
              notes:
                "Criada durante o onboarding do Prumo.",
              account_id:
                draft.income
                  .account_id,
              category_id:
                draft.income
                  .category_id,
              amount,
              occurrence_count:
                null,
              start_date:
                draft.income
                  .start_date,
              end_date: null,
              is_indefinite:
                true,
              origin: "manual",
            });

        nextDraft = {
          ...draft,
          income: {
            ...draft.income,
            created_group_id:
              group.id,
          },
        };

        await persist(
          currentStep,
          completedSteps,
          nextDraft,
        );
      }

      await moveForward(
        "income",
        nextDraft,
      );
    } catch (caughtError) {
      setError(
        caughtError
        instanceof ApiError
          ? caughtError.message
          : "Não foi possível cadastrar a renda.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  async function handleExpensesStep() {
    if (!draft) {
      return;
    }

    const filled =
      draft.expenses.filter(
        (expense) =>
          expense.description
            .trim()
          || parseCurrencyInput(
            expense
              .amount_input,
          ) > 0,
      );

    for (
      const expense
      of filled
    ) {
      if (
        !expense
          .description.trim()
        || parseCurrencyInput(
          expense.amount_input,
        ) <= 0
        || !expense.account_id
        || !expense.category_id
      ) {
        setError(
          "Complete todos os campos das despesas preenchidas.",
        );
        return;
      }
    }

    setIsSaving(true);
    setError("");

    try {
      let nextDraft = {
        ...draft,
        expenses: [
          ...draft.expenses,
        ],
      };

      for (
        let index = 0;
        index
        < nextDraft
          .expenses.length;
        index += 1
      ) {
        const expense =
          nextDraft
            .expenses[index];

        const amount =
          parseCurrencyInput(
            expense.amount_input,
          );

        if (
          !expense
            .description.trim()
          || amount <= 0
          || expense
            .created_group_id
        ) {
          continue;
        }

        const group =
          await transactionService
            .createGroup({
              group_type:
                "recurring",
              transaction_type:
                "expense",
              description:
                expense
                  .description
                  .trim(),
              notes:
                "Criada durante o onboarding do Prumo.",
              account_id:
                expense
                  .account_id,
              category_id:
                expense
                  .category_id,
              amount,
              occurrence_count:
                null,
              start_date:
                expense
                  .start_date,
              end_date: null,
              is_indefinite:
                true,
              origin: "manual",
            });

        nextDraft = {
          ...nextDraft,
          expenses:
            nextDraft
              .expenses.map(
                (
                  current,
                  currentIndex,
                ) =>
                  currentIndex
                  === index
                    ? {
                        ...current,
                        created_group_id:
                          group.id,
                      }
                    : current,
              ),
        };

        await persist(
          currentStep,
          completedSteps,
          nextDraft,
        );
      }

      await moveForward(
        "expenses",
        nextDraft,
      );
    } catch (caughtError) {
      setError(
        caughtError
        instanceof ApiError
          ? caughtError.message
          : "Não foi possível cadastrar as despesas fixas.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  async function handleComplete() {
    setIsSaving(true);
    setError("");

    try {
      await onboardingService
        .complete();

      navigate(
        "/home",
        {
          replace: true,
          state: {
            successMessage:
              "Seu Prumo está configurado.",
          },
        },
      );
    } catch (caughtError) {
      setError(
        caughtError
        instanceof ApiError
          ? caughtError.message
          : "Não foi possível concluir o onboarding.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  async function handleSkip() {
    const accepted =
      window.confirm(
        "Pular a configuração inicial? Você poderá retomá-la em Configurações.",
      );

    if (!accepted) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await onboardingService
        .skip();

      navigate(
        "/home",
        {
          replace: true,
        },
      );
    } catch (caughtError) {
      setError(
        caughtError
        instanceof ApiError
          ? caughtError.message
          : "Não foi possível pular o onboarding.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  async function handleRestart() {
    setIsSaving(true);
    setError("");

    try {
      const result =
        await onboardingService
          .restart();

      setState(
        result.onboarding,
      );
      setCurrentStep(1);
      setCompletedSteps([]);
      setDraft(
        buildInitialDraft(
          result.onboarding,
          accounts,
          categories,
        ),
      );
    } catch (caughtError) {
      setError(
        caughtError
        instanceof ApiError
          ? caughtError.message
          : "Não foi possível reiniciar o onboarding.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  function addCustomCategory() {
    if (!draft) {
      return;
    }

    setDraft({
      ...draft,
      custom_categories: [
        ...draft
          .custom_categories,
        {
          local_id:
            createLocalId(),
          name: "",
          application:
            "expense",
          created_id: null,
        },
      ],
    });
  }


  function addExpense() {
    if (!draft) {
      return;
    }

    if (
      draft.expenses.length
      >= 6
    ) {
      setError(
        "Adicione no máximo 6 despesas agora. Outras podem ser cadastradas depois.",
      );
      return;
    }

    const defaultAccount =
      activeAccounts.find(
        (account) =>
          account.is_default,
      )
      ?? activeAccounts[0];

    const defaultCategory =
      expenseCategories[0];

    setDraft({
      ...draft,
      expenses: [
        ...draft.expenses,
        {
          local_id:
            createLocalId(),
          description: "",
          amount_input: "",
          start_date:
            todayInput(),
          account_id:
            defaultAccount?.id
            ?? "",
          category_id:
            defaultCategory?.id
            ?? "",
          created_group_id:
            null,
        },
      ],
    });
  }


  function removeExpense(
    localId: string,
  ) {
    if (!draft) {
      return;
    }

    const expense =
      draft.expenses.find(
        (item) =>
          item.local_id
          === localId,
      );

    if (
      expense
        ?.created_group_id
    ) {
      setError(
        "Esta despesa já foi criada. Exclua-a depois pela tela de Movimentações.",
      );
      return;
    }

    setDraft({
      ...draft,
      expenses:
        draft.expenses.filter(
          (item) =>
            item.local_id
            !== localId,
        ),
    });
  }


  function updateExpense(
    localId: string,
    patch:
      Partial<
        OnboardingExpenseDraft
      >,
  ) {
    if (!draft) {
      return;
    }

    setDraft({
      ...draft,
      expenses:
        draft.expenses.map(
          (expense) =>
            expense.local_id
            === localId
              ? {
                  ...expense,
                  ...patch,
                }
              : expense,
        ),
    });
  }


  if (isLoading) {
    return (
      <main
        className={styles.loading}
      >
        <div
          className={styles.logo}
        >
          P
        </div>

        <strong>
          Preparando seu Prumo...
        </strong>
      </main>
    );
  }


  if (error && !draft) {
    return (
      <main
        className={styles.loading}
      >
        <strong>
          Não conseguimos abrir o onboarding
        </strong>

        <p>{error}</p>

        <Button
          onClick={() =>
            void loadData()
          }
        >
          Tentar novamente
        </Button>
      </main>
    );
  }


  if (
    !draft
    || !state
  ) {
    return null;
  }


  if (
    !state.needs_onboarding
  ) {
    return (
      <main
        className={
          styles.completedPage
        }
      >
        <section>
          <div
            className={styles.logo}
          >
            P
          </div>

          <span
            className={
              styles.eyebrow
            }
          >
            Configuração inicial
          </span>

          <h1>
            Seu Prumo já está configurado
          </h1>

          <p>
            Você pode voltar para a
            Home ou refazer o passo a
            passo sem apagar os dados
            existentes.
          </p>

          <div
            className={
              styles.completedActions
            }
          >
            <Button
              variant="secondary"
              onClick={() =>
                navigate("/home")
              }
            >
              Voltar para a Home
            </Button>

            <Button
              isLoading={isSaving}
              onClick={() =>
                void handleRestart()
              }
            >
              Refazer onboarding
            </Button>
          </div>
        </section>
      </main>
    );
  }


  const current =
    steps[currentStep - 1];

  const progress =
    (currentStep / steps.length)
    * 100;


  return (
    <main className={styles.page}>
      <aside
        className={styles.sidebar}
      >
        <div
          className={styles.brand}
        >
          <span>P</span>

          <div>
            <strong>Prumo</strong>
            <small>
              Configuração inicial
            </small>
          </div>
        </div>

        <div
          className={
            styles.progressSummary
          }
        >
          <span>
            Etapa {currentStep} de{" "}
            {steps.length}
          </span>

          <div>
            <span
              style={{
                width:
                  `${progress}%`,
              }}
            />
          </div>
        </div>

        <nav>
          {steps.map(
            (step, index) => {
              const stepNumber =
                index + 1;

              const isActive =
                stepNumber
                === currentStep;

              const isComplete =
                completedSteps
                  .includes(
                    step.key,
                  );

              return (
                <button
                  type="button"
                  key={step.key}
                  className={[
                    styles.step,
                    isActive
                      ? styles
                          .stepActive
                      : "",
                    isComplete
                      ? styles
                          .stepComplete
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={
                    stepNumber
                    > currentStep
                  }
                  onClick={() =>
                    setCurrentStep(
                      stepNumber,
                    )
                  }
                >
                  <span>
                    {isComplete
                      ? "✓"
                      : stepNumber}
                  </span>

                  <div>
                    <strong>
                      {
                        step
                          .shortTitle
                      }
                    </strong>
                    <small>
                      {step.title}
                    </small>
                  </div>
                </button>
              );
            },
          )}
        </nav>

        <button
          type="button"
          className={
            styles.skipButton
          }
          disabled={isSaving}
          onClick={() =>
            void handleSkip()
          }
        >
          Configurar depois
        </button>
      </aside>

      <section
        className={styles.content}
      >
        <header
          className={
            styles.mobileHeader
          }
        >
          <div
            className={styles.brand}
          >
            <span>P</span>
            <strong>Prumo</strong>
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={() =>
              void handleSkip()
            }
          >
            Pular
          </button>
        </header>

        <div
          className={
            styles.mobileProgress
          }
        >
          <span>
            {currentStep}/
            {steps.length}
          </span>

          <div>
            <span
              style={{
                width:
                  `${progress}%`,
              }}
            />
          </div>
        </div>

        <article
          className={
            styles.stepContent
          }
        >
          <header
            className={
              styles.stepHeader
            }
          >
            <span
              className={
                styles.eyebrow
              }
            >
              {current.shortTitle}
            </span>

            <h1>{current.title}</h1>

            <p>
              {current.description}
            </p>
          </header>

          {error ? (
            <div
              className={
                styles.error
              }
              role="alert"
            >
              {error}
            </div>
          ) : null}

          {currentStep === 1 ? (
            <section
              className={
                styles.welcome
              }
            >
              <div
                className={
                  styles.heroSymbol
                }
              >
                P
              </div>

              <div>
                <h2>
                  Olá
                  {user?.name
                    ? `, ${user.name.split(" ")[0]}`
                    : ""}
                  !
                </h2>

                <p>
                  Em poucos passos, o
                  Prumo entenderá como
                  você recebe, paga e
                  organiza seu dinheiro.
                </p>
              </div>

              <div
                className={
                  styles.benefits
                }
              >
                <article>
                  <span>1</span>
                  <div>
                    <strong>
                      Sem planilha vazia
                    </strong>
                    <p>
                      A Home já abrirá
                      com informações
                      úteis.
                    </p>
                  </div>
                </article>

                <article>
                  <span>2</span>
                  <div>
                    <strong>
                      Tudo editável
                    </strong>
                    <p>
                      Contas, categorias
                      e recorrências
                      podem ser mudadas.
                    </p>
                  </div>
                </article>

                <article>
                  <span>3</span>
                  <div>
                    <strong>
                      Salvo a cada etapa
                    </strong>
                    <p>
                      Você pode fechar e
                      continuar depois.
                    </p>
                  </div>
                </article>
              </div>
            </section>
          ) : null}

          {currentStep === 2 ? (
            <section
              className={styles.form}
            >
              <Input
                label="Nome da conta"
                placeholder="Ex.: Nubank, PIX, Dinheiro"
                value={
                  draft.account.name
                }
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    account: {
                      ...draft.account,
                      name:
                        event.target
                          .value,
                    },
                  })
                }
              />

              <label
                className={
                  styles.field
                }
              >
                <span>
                  Tipo da conta
                </span>

                <select
                  value={
                    draft.account.type
                  }
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      account: {
                        ...draft.account,
                        type:
                          event.target.value as AccountType,
                      },
                    })
                  }
                >
                  {(
                    Object.entries(
                      accountTypeLabels,
                    ) as Array<
                      [
                        AccountType,
                        string,
                      ]
                    >
                  ).map(
                    ([
                      value,
                      label,
                    ]) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </label>

              {draft.account.type
              === "credit_card"
              || draft.account.type
              === "third_party_credit" ? (
                <div
                  className={
                    styles.twoColumns
                  }
                >
                  <Input
                    label="Dia do fechamento"
                    type="number"
                    min={1}
                    max={31}
                    value={
                      draft.account
                        .closing_day
                      ?? ""
                    }
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        account: {
                          ...draft.account,
                          closing_day:
                            Number(
                              event.target
                                .value,
                            )
                            || null,
                        },
                      })
                    }
                  />

                  <Input
                    label="Dia do vencimento"
                    type="number"
                    min={1}
                    max={31}
                    value={
                      draft.account
                        .due_day
                      ?? ""
                    }
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        account: {
                          ...draft.account,
                          due_day:
                            Number(
                              event.target
                                .value,
                            )
                            || null,
                        },
                      })
                    }
                  />
                </div>
              ) : null}

              <aside
                className={
                  styles.infoBox
                }
              >
                Essa será a conta padrão
                nos novos lançamentos.
                Você poderá criar cartões
                e outras contas depois.
              </aside>
            </section>
          ) : null}

          {currentStep === 3 ? (
            <section
              className={
                styles.categoriesStep
              }
            >
              <div
                className={
                  styles.categoryGroups
                }
              >
                {[
                  [
                    "income",
                    "Receitas",
                  ],
                  [
                    "expense",
                    "Despesas",
                  ],
                  [
                    "both",
                    "Gerais",
                  ],
                ].map(
                  ([
                    application,
                    title,
                  ]) => (
                    <section
                      key={
                        application
                      }
                    >
                      <h2>{title}</h2>

                      <div
                        className={
                          styles.categoryGrid
                        }
                      >
                        {categoryPresets
                          .filter(
                            (preset) =>
                              preset.application
                              === application,
                          )
                          .map(
                            (preset) => {
                              const selected =
                                draft
                                  .selected_categories
                                  .some(
                                    (name) =>
                                      normalizeName(
                                        name,
                                      )
                                      === normalizeName(
                                        preset.name,
                                      ),
                                  );

                              return (
                                <button
                                  type="button"
                                  key={
                                    preset.name
                                  }
                                  className={
                                    selected
                                      ? styles
                                          .categorySelected
                                      : styles
                                          .categoryOption
                                  }
                                  onClick={() => {
                                    const next =
                                      selected
                                        ? draft
                                            .selected_categories
                                            .filter(
                                              (name) =>
                                                normalizeName(
                                                  name,
                                                )
                                                !== normalizeName(
                                                  preset.name,
                                                ),
                                            )
                                        : [
                                            ...draft
                                              .selected_categories,
                                            preset.name,
                                          ];

                                    setDraft({
                                      ...draft,
                                      selected_categories:
                                        next,
                                    });
                                  }}
                                >
                                  <span>
                                    {selected
                                      ? "✓"
                                      : "+"}
                                  </span>
                                  {
                                    preset.name
                                  }
                                </button>
                              );
                            },
                          )}
                      </div>
                    </section>
                  ),
                )}
              </div>

              <Card
                title="Categorias personalizadas"
                description="Opcional. Você pode adicionar até cinco agora."
              >
                <div
                  className={
                    styles.customCategories
                  }
                >
                  {draft
                    .custom_categories
                    .map(
                      (
                        category,
                        index,
                      ) => (
                        <div
                          key={
                            category
                              .local_id
                          }
                        >
                          <input
                            type="text"
                            placeholder="Nome"
                            value={
                              category.name
                            }
                            disabled={
                              Boolean(
                                category
                                  .created_id,
                              )
                            }
                            onChange={(event) =>
                              setDraft({
                                ...draft,
                                custom_categories:
                                  draft
                                    .custom_categories
                                    .map(
                                      (
                                        current,
                                        currentIndex,
                                      ) =>
                                        currentIndex
                                        === index
                                          ? {
                                              ...current,
                                              name:
                                                event
                                                  .target
                                                  .value,
                                            }
                                          : current,
                                    ),
                              })
                            }
                          />

                          <select
                            value={
                              category
                                .application
                            }
                            disabled={
                              Boolean(
                                category
                                  .created_id,
                              )
                            }
                            onChange={(event) =>
                              setDraft({
                                ...draft,
                                custom_categories:
                                  draft
                                    .custom_categories
                                    .map(
                                      (
                                        current,
                                        currentIndex,
                                      ) =>
                                        currentIndex
                                        === index
                                          ? {
                                              ...current,
                                              application:
                                                event.target.value as CategoryApplication,
                                            }
                                          : current,
                                    ),
                              })
                            }
                          >
                            <option value="expense">
                              Despesa
                            </option>
                            <option value="income">
                              Receita
                            </option>
                            <option value="both">
                              Ambos
                            </option>
                          </select>

                          {!category
                            .created_id ? (
                            <button
                              type="button"
                              aria-label="Remover categoria"
                              onClick={() =>
                                setDraft({
                                  ...draft,
                                  custom_categories:
                                    draft
                                      .custom_categories
                                      .filter(
                                        (item) =>
                                          item
                                            .local_id
                                          !== category
                                            .local_id,
                                      ),
                                })
                              }
                            >
                              ×
                            </button>
                          ) : (
                            <span>
                              Criada
                            </span>
                          )}
                        </div>
                      ),
                    )}

                  {draft
                    .custom_categories
                    .length < 5 ? (
                    <button
                      type="button"
                      className={
                        styles.addRow
                      }
                      onClick={
                        addCustomCategory
                      }
                    >
                      + Adicionar categoria
                    </button>
                  ) : null}
                </div>
              </Card>

              <label
                className={
                  styles.checkbox
                }
              >
                <input
                  type="checkbox"
                  checked={
                    draft
                      .archive_unselected_defaults
                  }
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      archive_unselected_defaults:
                        event.target
                          .checked,
                    })
                  }
                />

                <span>
                  Arquivar categorias
                  padrão desmarcadas
                </span>
              </label>
            </section>
          ) : null}

          {currentStep === 4 ? (
            <section
              className={styles.form}
            >
              <label
                className={
                  styles.toggle
                }
              >
                <input
                  type="checkbox"
                  checked={
                    draft.income.enabled
                  }
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      income: {
                        ...draft.income,
                        enabled:
                          event.target
                            .checked,
                      },
                    })
                  }
                />

                <span>
                  <strong>
                    Cadastrar renda agora
                  </strong>
                  <small>
                    Pode ser pulado caso
                    sua renda varie muito.
                  </small>
                </span>
              </label>

              {draft.income.enabled ? (
                <>
                  {draft.income
                    .created_group_id ? (
                    <aside
                      className={
                        styles.successBox
                      }
                    >
                      Renda recorrente já
                      cadastrada.
                    </aside>
                  ) : null}

                  <Input
                    label="Descrição"
                    placeholder="Ex.: Salário"
                    value={
                      draft.income
                        .description
                    }
                    disabled={
                      Boolean(
                        draft.income
                          .created_group_id,
                      )
                    }
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        income: {
                          ...draft.income,
                          description:
                            event.target
                              .value,
                        },
                      })
                    }
                  />

                  <Input
                    label="Valor mensal"
                    inputMode="numeric"
                    placeholder="R$ 0,00"
                    value={
                      draft.income
                        .amount_input
                        ? formatCurrency(
                            parseCurrencyInput(
                              draft.income
                                .amount_input,
                            ),
                          )
                        : ""
                    }
                    disabled={
                      Boolean(
                        draft.income
                          .created_group_id,
                      )
                    }
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        income: {
                          ...draft.income,
                          amount_input:
                            event.target
                              .value,
                        },
                      })
                    }
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
                      <span>Conta</span>

                      <select
                        value={
                          draft.income
                            .account_id
                        }
                        disabled={
                          Boolean(
                            draft.income
                              .created_group_id,
                          )
                        }
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            income: {
                              ...draft.income,
                              account_id:
                                event.target
                                  .value,
                            },
                          })
                        }
                      >
                        <option value="">
                          Selecione
                        </option>
                        {activeAccounts
                          .map(
                            (account) => (
                              <option
                                key={
                                  account.id
                                }
                                value={
                                  account.id
                                }
                              >
                                {
                                  account.name
                                }
                              </option>
                            ),
                          )}
                      </select>
                    </label>

                    <label
                      className={
                        styles.field
                      }
                    >
                      <span>
                        Categoria
                      </span>

                      <select
                        value={
                          draft.income
                            .category_id
                        }
                        disabled={
                          Boolean(
                            draft.income
                              .created_group_id,
                          )
                        }
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            income: {
                              ...draft.income,
                              category_id:
                                event.target
                                  .value,
                            },
                          })
                        }
                      >
                        <option value="">
                          Selecione
                        </option>
                        {incomeCategories
                          .map(
                            (category) => (
                              <option
                                key={
                                  category.id
                                }
                                value={
                                  category.id
                                }
                              >
                                {
                                  category.name
                                }
                              </option>
                            ),
                          )}
                      </select>
                    </label>
                  </div>

                  <Input
                    label="Primeiro recebimento"
                    type="date"
                    value={
                      draft.income
                        .start_date
                    }
                    disabled={
                      Boolean(
                        draft.income
                          .created_group_id,
                      )
                    }
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        income: {
                          ...draft.income,
                          start_date:
                            event.target
                              .value,
                        },
                      })
                    }
                  />

                  <aside
                    className={
                      styles.infoBox
                    }
                  >
                    Será criada uma
                    receita recorrente
                    sem data final. Ela
                    poderá ser editada ou
                    encerrada depois.
                  </aside>
                </>
              ) : (
                <aside
                  className={
                    styles.infoBox
                  }
                >
                  Tudo bem. Você poderá
                  cadastrar receitas pela
                  tela Movimentações.
                </aside>
              )}
            </section>
          ) : null}

          {currentStep === 5 ? (
            <section
              className={
                styles.expensesStep
              }
            >
              <div
                className={
                  styles.expenseList
                }
              >
                {draft.expenses.map(
                  (
                    expense,
                    index,
                  ) => (
                    <Card
                      key={
                        expense.local_id
                      }
                      title={
                        expense.description
                          .trim()
                        || `Despesa ${index + 1}`
                      }
                      description={
                        expense
                          .created_group_id
                          ? "Recorrência criada"
                          : "Compromisso mensal"
                      }
                    >
                      {expense
                        .created_group_id ? (
                        <aside
                          className={
                            styles.successBox
                          }
                        >
                          Esta despesa já
                          foi cadastrada.
                        </aside>
                      ) : null}

                      <div
                        className={
                          styles.expenseForm
                        }
                      >
                        <Input
                          label="Descrição"
                          placeholder="Ex.: Internet"
                          value={
                            expense
                              .description
                          }
                          disabled={
                            Boolean(
                              expense
                                .created_group_id,
                            )
                          }
                          onChange={(event) =>
                            updateExpense(
                              expense
                                .local_id,
                              {
                                description:
                                  event
                                    .target
                                    .value,
                              },
                            )
                          }
                        />

                        <Input
                          label="Valor mensal"
                          inputMode="numeric"
                          placeholder="R$ 0,00"
                          value={
                            expense
                              .amount_input
                              ? formatCurrency(
                                  parseCurrencyInput(
                                    expense
                                      .amount_input,
                                  ),
                                )
                              : ""
                          }
                          disabled={
                            Boolean(
                              expense
                                .created_group_id,
                            )
                          }
                          onChange={(event) =>
                            updateExpense(
                              expense
                                .local_id,
                              {
                                amount_input:
                                  event
                                    .target
                                    .value,
                              },
                            )
                          }
                        />

                        <label
                          className={
                            styles.field
                          }
                        >
                          <span>Conta</span>

                          <select
                            value={
                              expense
                                .account_id
                            }
                            disabled={
                              Boolean(
                                expense
                                  .created_group_id,
                              )
                            }
                            onChange={(event) =>
                              updateExpense(
                                expense
                                  .local_id,
                                {
                                  account_id:
                                    event
                                      .target
                                      .value,
                                },
                              )
                            }
                          >
                            <option value="">
                              Selecione
                            </option>
                            {activeAccounts
                              .map(
                                (
                                  account,
                                ) => (
                                  <option
                                    key={
                                      account.id
                                    }
                                    value={
                                      account.id
                                    }
                                  >
                                    {
                                      account.name
                                    }
                                  </option>
                                ),
                              )}
                          </select>
                        </label>

                        <label
                          className={
                            styles.field
                          }
                        >
                          <span>
                            Categoria
                          </span>

                          <select
                            value={
                              expense
                                .category_id
                            }
                            disabled={
                              Boolean(
                                expense
                                  .created_group_id,
                              )
                            }
                            onChange={(event) =>
                              updateExpense(
                                expense
                                  .local_id,
                                {
                                  category_id:
                                    event
                                      .target
                                      .value,
                                },
                              )
                            }
                          >
                            <option value="">
                              Selecione
                            </option>
                            {expenseCategories
                              .map(
                                (
                                  category,
                                ) => (
                                  <option
                                    key={
                                      category.id
                                    }
                                    value={
                                      category.id
                                    }
                                  >
                                    {
                                      category.name
                                    }
                                  </option>
                                ),
                              )}
                          </select>
                        </label>

                        <Input
                          label="Primeiro vencimento"
                          type="date"
                          value={
                            expense
                              .start_date
                          }
                          disabled={
                            Boolean(
                              expense
                                .created_group_id,
                            )
                          }
                          onChange={(event) =>
                            updateExpense(
                              expense
                                .local_id,
                              {
                                start_date:
                                  event
                                    .target
                                    .value,
                              },
                            )
                          }
                        />
                      </div>

                      <button
                        type="button"
                        className={
                          styles.removeRow
                        }
                        disabled={
                          Boolean(
                            expense
                              .created_group_id,
                          )
                        }
                        onClick={() =>
                          removeExpense(
                            expense.local_id,
                          )
                        }
                      >
                        Remover
                      </button>
                    </Card>
                  ),
                )}
              </div>

              {draft.expenses
                .length < 6 ? (
                <button
                  type="button"
                  className={
                    styles.addExpense
                  }
                  onClick={addExpense}
                >
                  <span>+</span>
                  Adicionar despesa fixa
                </button>
              ) : null}

              {draft.expenses
                .length === 0 ? (
                <aside
                  className={
                    styles.infoBox
                  }
                >
                  Você pode continuar sem
                  despesas fixas e
                  cadastrá-las depois.
                </aside>
              ) : null}
            </section>
          ) : null}

          {currentStep === 6 ? (
            <section
              className={
                styles.tourGrid
              }
            >
              {tourItems.map(
                (item) => (
                  <article
                    key={item.title}
                  >
                    <span>
                      {item.symbol}
                    </span>

                    <div>
                      <strong>
                        {item.title}
                      </strong>
                      <p>
                        {
                          item.description
                        }
                      </p>
                    </div>
                  </article>
                ),
              )}

              <aside
                className={
                  styles.readyBox
                }
              >
                <strong>
                  Sua estrutura inicial
                  está pronta
                </strong>

                <p>
                  Contas, categorias,
                  renda e despesas podem
                  ser ajustadas a qualquer
                  momento sem perder o
                  histórico.
                </p>
              </aside>
            </section>
          ) : null}

          <footer
            className={
              styles.actions
            }
          >
            {currentStep > 1 ? (
              <Button
                variant="secondary"
                disabled={isSaving}
                onClick={() => {
                  setError("");
                  setCurrentStep(
                    (currentStepValue) =>
                      Math.max(
                        1,
                        currentStepValue
                        - 1,
                      ),
                  );
                }}
              >
                Voltar
              </Button>
            ) : (
              <span />
            )}

            {currentStep === 1 ? (
              <Button
                isLoading={isSaving}
                onClick={() =>
                  void moveForward(
                    "welcome",
                    draft,
                  )
                }
              >
                Começar
              </Button>
            ) : null}

            {currentStep === 2 ? (
              <Button
                isLoading={isSaving}
                onClick={() =>
                  void handleAccountStep()
                }
              >
                Salvar conta
              </Button>
            ) : null}

            {currentStep === 3 ? (
              <Button
                isLoading={isSaving}
                onClick={() =>
                  void handleCategoriesStep()
                }
              >
                Salvar categorias
              </Button>
            ) : null}

            {currentStep === 4 ? (
              <Button
                isLoading={isSaving}
                onClick={() =>
                  void handleIncomeStep()
                }
              >
                {draft.income.enabled
                  ? "Cadastrar renda"
                  : "Continuar sem renda"}
              </Button>
            ) : null}

            {currentStep === 5 ? (
              <Button
                isLoading={isSaving}
                onClick={() =>
                  void handleExpensesStep()
                }
              >
                Continuar
              </Button>
            ) : null}

            {currentStep === 6 ? (
              <Button
                isLoading={isSaving}
                onClick={() =>
                  void handleComplete()
                }
              >
                Abrir meu Prumo
              </Button>
            ) : null}
          </footer>
        </article>
      </section>
    </main>
  );
}
