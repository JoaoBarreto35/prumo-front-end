export type TransactionEditScope =
  | "single"
  | "this_and_following"
  | "entire_group";

export type TransactionDetail = {
  id: string;
  group_id: string;
  account_id: string;
  category_id: string | null;

  transaction_type: "income" | "expense";
  description: string;
  amount: string;
  status: "pending" | "completed" | "cancelled";

  occurrence_date: string;
  due_date: string;
  sequence_number: number;

  group_type: "single" | "installment" | "recurring";
  notes: string | null;
  total_occurrences: number;
  is_group_active: boolean;
};

export type TransactionEditInput = {
  scope: TransactionEditScope;
  description: string;
  notes: string | null;
  account_id: string;
  category_id: string | null;
  amount: number;
  due_date: string;
};

export type TransactionEditResult = {
  updated_transactions: number;
  group_id: string;
  message: string;
};

export type TransactionDeleteResult = {
  deleted_transactions: number;
  deleted_group: boolean;
  message: string;
};
