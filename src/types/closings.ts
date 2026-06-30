export type ClosingStatus =
  | "open"
  | "closed"
  | "reopened";


export type ClosingBreakdownItem = {
  id: string;
  label: string;
  amount: number;
  count: number;
  percentage: number;
};


export type ClosingTransactionItem = {
  id: string;
  description: string;
  transaction_type:
    | "income"
    | "expense";
  group_type:
    | "single"
    | "installment"
    | "recurring";
  status:
    | "pending"
    | "completed";
  amount: number;
  due_date: string;
  account_name: string;
  category_name: string;
  sequence_number: number;
  total_occurrences: number;
};


export type ClosingMetrics = {
  planned_income: number;
  planned_expense: number;
  projected_result: number;

  actual_income: number;
  actual_expense: number;
  actual_result: number;

  pending_income: number;
  pending_expense: number;
  pending_count: number;
  completed_count: number;
  overdue_count: number;
  transaction_count: number;

  income_realization_rate: number;
  expense_realization_rate: number;
};


export type ClosingSnapshot = {
  generated_at: string;
  metrics: ClosingMetrics;
  category_breakdown:
    ClosingBreakdownItem[];
  account_breakdown:
    ClosingBreakdownItem[];
  pending_transactions:
    ClosingTransactionItem[];
  transactions:
    ClosingTransactionItem[];
};


export type ClosingSummary = {
  id: string | null;
  reference_month: string;
  status: ClosingStatus;
  notes: string | null;

  first_closed_at:
    string | null;
  last_updated_at:
    string | null;
  closed_at: string | null;
  reopened_at: string | null;
  update_count: number;
  snapshot_version: number;

  live: ClosingSnapshot;
  closed_snapshot:
    ClosingSnapshot | null;
};


export type ClosingHistoryItem = {
  id: string;
  reference_month: string;
  status: ClosingStatus;
  notes: string | null;
  closed_at: string | null;
  reopened_at: string | null;
  snapshot_version: number;
  planned_income: number;
  planned_expense: number;
  projected_result: number;
  actual_result: number;
  pending_count: number;
  overdue_count: number;
};


export type ClosingMonthStatus = {
  reference_month: string;
  status: ClosingStatus;
  is_closed: boolean;
  warning: string | null;
};
