import type {
  Account,
  Category,
} from "./finance";


export type TransactionType =
  | "income"
  | "expense";

export type GroupType =
  | "single"
  | "installment"
  | "recurring";

export type TransactionOrigin =
  | "manual"
  | "ai";

export type TransactionStatus =
  | "pending"
  | "completed"
  | "cancelled";


export type TransactionSummary = {
  id: string;
  group_id: string;
  account_id: string;
  category_id: string | null;

  transaction_type: TransactionType;
  description: string;
  amount: string;
  status: TransactionStatus;

  occurrence_date: string;
  due_date: string;
  sequence_number: number;
};


export type Transaction =
  TransactionSummary & {
    account_name: string;
    category_name: string | null;

    group_type: GroupType;
    total_occurrences: number;
    is_group_active: boolean;
  };


export type TransactionStatusResult = {
  id: string;
  status: TransactionStatus;
};


export type TransactionGroup = {
  id: string;
  group_type: GroupType;
  transaction_type: TransactionType;
  description: string;
  base_amount: string;
  total_amount: string | null;
  occurrence_count: number | null;
  start_date: string;
  is_active: boolean;
  transactions: TransactionSummary[];
};


export type TransactionGroupCreateInput = {
  group_type: GroupType;
  transaction_type: TransactionType;
  description: string;
  notes: string | null;
  account_id: string;
  category_id: string | null;
  amount: number;
  occurrence_count: number | null;
  start_date: string;
  end_date: string | null;
  is_indefinite: boolean;
  origin: TransactionOrigin;
};


export type TransactionFormDependencies = {
  accounts: Account[];
  categories: Category[];
};
