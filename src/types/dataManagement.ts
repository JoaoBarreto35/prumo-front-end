export type DataImportFormat =
  | "prumo_backup"
  | "csv";


export type DataImportMode =
  | "merge"
  | "replace";


export type DataSummary = {
  accounts: number;
  categories: number;
  groups: number;
  transactions: number;
  closings: number;
  planning_scenarios: number;
  lume_conversations: number;
  first_transaction_date:
    string | null;
  last_transaction_date:
    string | null;
};


export type DataExportFile = {
  filename: string;
  mime_type: string;
  content: string;
};


export type DataImportCounts = {
  accounts: number;
  categories: number;
  groups: number;
  transactions: number;
  closings: number;
  planning_scenarios: number;
  lume_conversations: number;
  lume_messages: number;
  preferences: number;
};


export type DataImportPreview = {
  data_format:
    DataImportFormat;
  mode: DataImportMode;
  valid: boolean;
  source_version:
    number | null;
  counts: DataImportCounts;
  duplicates:
    DataImportCounts;
  will_create:
    DataImportCounts;
  warnings: string[];
  errors: string[];
  sample:
    Array<
      Record<
        string,
        unknown
      >
    >;
};


export type DataImportRequest = {
  data_format:
    DataImportFormat;
  content: string;
  filename: string | null;
  mode: DataImportMode;
  skip_duplicates: boolean;
  create_missing_structure:
    boolean;
  confirm_replace: boolean;
  current_password:
    string | null;
};


export type DataImportResult = {
  message: string;
  created: DataImportCounts;
  skipped: DataImportCounts;
  warnings: string[];
};


export type DataOperationLog = {
  id: string;
  action: string;
  data_format: string;
  status: string;
  summary:
    Record<
      string,
      unknown
    >;
  created_at: string;
};


export type DataMessage = {
  message: string;
};
