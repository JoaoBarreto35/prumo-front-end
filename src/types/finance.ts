export type AccountType =
  | "immediate_payment"
  | "credit_card"
  | "third_party_credit"
  | "cash"
  | "other";


export type CategoryApplication =
  | "income"
  | "expense"
  | "both";


export type Account = {
  id: string;
  name: string;
  type: AccountType;
  is_default: boolean;
  is_active: boolean;
  closing_day: number | null;
  due_day: number | null;
  transaction_count: number;
  group_count: number;
  active_recurring_group_count: number;
};


export type AccountCreateInput = {
  name: string;
  type: AccountType;
  is_default: boolean;
  closing_day: number | null;
  due_day: number | null;
};


export type AccountUpdateInput = Omit<
  AccountCreateInput,
  "is_default"
>;


export type Category = {
  id: string;
  name: string;
  application: CategoryApplication;
  is_active: boolean;
  is_system_default: boolean;
  transaction_count: number;
  group_count: number;
  income_count: number;
  expense_count: number;
};


export type CategoryCreateInput = {
  name: string;
  application: CategoryApplication;
};


export type CategoryUpdateInput =
  CategoryCreateInput;


export type StructureImpact = {
  entity_id: string;
  transaction_count: number;
  group_count: number;
  pending_count: number;
  completed_count: number;
  cancelled_count: number;
  income_count: number;
  expense_count: number;
  active_recurring_group_count: number;
  first_due_date: string | null;
  last_due_date: string | null;
  closed_months: string[];
  can_delete_without_transfer: boolean;
};


export type StructureOperationResult = {
  message: string;
  updated_transactions: number;
  updated_groups: number;
  closed_months: string[];
};
