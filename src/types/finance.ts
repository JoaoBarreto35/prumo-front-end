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
};

export type AccountCreateInput = {
  name: string;
  type: AccountType;
  is_default: boolean;
  closing_day: number | null;
  due_day: number | null;
};

export type Category = {
  id: string;
  name: string;
  application: CategoryApplication;
  is_active: boolean;
  is_system_default: boolean;
};

export type CategoryCreateInput = {
  name: string;
  application: CategoryApplication;
};
