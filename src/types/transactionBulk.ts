export type BulkTransactionScope =
  | "selected"
  | "month"
  | "past_due"
  | "until_date";


export type BulkTransactionAction =
  | "complete"
  | "reopen";


export type BulkTransactionRequest = {
  action: BulkTransactionAction;
  scope: BulkTransactionScope;
  transaction_ids: string[];
  reference_month: string | null;
  until_date: string | null;
  completion_date: string | null;
};


export type BulkTransactionSample = {
  id: string;
  description: string;
  transaction_type:
    | "income"
    | "expense";
  status:
    | "pending"
    | "completed"
    | "cancelled";
  amount: number;
  due_date: string;
};


export type BulkTransactionPreview = {
  action: BulkTransactionAction;
  scope: BulkTransactionScope;

  candidate_count: number;
  skipped_count: number;

  income_count: number;
  expense_count: number;
  income_total: number;
  expense_total: number;
  net_total: number;

  first_due_date: string | null;
  last_due_date: string | null;

  closed_months: string[];
  requires_closed_month_confirmation:
    boolean;

  sample: BulkTransactionSample[];
};


export type BulkTransactionApplyInput =
  BulkTransactionRequest & {
    confirm_closed_months: boolean;
  };


export type BulkTransactionResult = {
  action: BulkTransactionAction;
  updated_count: number;
  skipped_count: number;
  closed_months: string[];
  message: string;
};
