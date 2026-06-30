import type {
  GroupType,
  TransactionType,
} from "./transactions";


export type PlanningScenario = {
  id: string;
  description: string;
  notes: string | null;
  transaction_type: TransactionType;
  group_type: GroupType;
  amount: string;
  occurrence_count: number | null;
  start_date: string;
  is_active: boolean;
};


export type PlanningScenarioInput = {
  description: string;
  notes: string | null;
  transaction_type: TransactionType;
  group_type: GroupType;
  amount: number;
  occurrence_count: number | null;
  start_date: string;
  is_active: boolean;
};


export type ProjectionMonth = {
  key: string;
  label: string;
  baseIncome: number;
  baseExpense: number;
  scenarioIncome: number;
  scenarioExpense: number;
  baseResult: number;
  projectedResult: number;
  accumulatedBalance: number;
};


export type ProjectionSummary = {
  finalBalance: number;
  minimumBalance: number;
  firstNegativeMonth: ProjectionMonth | null;
  averageExpense: number;
  activeScenarioCount: number;
  verdict: "comfortable" | "attention" | "risk";
};
