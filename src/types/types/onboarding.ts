import type {
  AccountType,
  CategoryApplication,
} from "./finance";


export type OnboardingStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "skipped";


export type OnboardingStepKey =
  | "welcome"
  | "account"
  | "categories"
  | "income"
  | "expenses"
  | "tour";


export type OnboardingAccountDraft = {
  account_id: string | null;
  name: string;
  type: AccountType;
  closing_day: number | null;
  due_day: number | null;
};


export type OnboardingCustomCategory = {
  local_id: string;
  name: string;
  application:
    CategoryApplication;
  created_id: string | null;
};


export type OnboardingIncomeDraft = {
  enabled: boolean;
  description: string;
  amount_input: string;
  start_date: string;
  account_id: string;
  category_id: string;
  created_group_id: string | null;
};


export type OnboardingExpenseDraft = {
  local_id: string;
  description: string;
  amount_input: string;
  start_date: string;
  account_id: string;
  category_id: string;
  created_group_id: string | null;
};


export type OnboardingDraft = {
  account:
    OnboardingAccountDraft;
  selected_categories:
    string[];
  custom_categories:
    OnboardingCustomCategory[];
  archive_unselected_defaults:
    boolean;
  income:
    OnboardingIncomeDraft;
  expenses:
    OnboardingExpenseDraft[];
};


export type OnboardingState = {
  status: OnboardingStatus;
  current_step: number;
  completed_steps:
    OnboardingStepKey[];
  draft:
    Partial<OnboardingDraft>;

  account_count: number;
  category_count: number;
  transaction_count: number;

  auto_completed: boolean;
  needs_onboarding: boolean;

  started_at: string | null;
  completed_at: string | null;
  skipped_at: string | null;
};


export type OnboardingMessage = {
  message: string;
  onboarding:
    OnboardingState;
};
