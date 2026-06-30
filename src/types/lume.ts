export type LumeRole =
  | "user"
  | "assistant";


export type LumeActionKind =
  | "create_transaction"
  | "create_planning_scenario";


export type LumeActionStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "failed";


export type LumeAction = {
  message_id: string;
  kind: LumeActionKind;
  payload: Record<string, unknown>;
  status: LumeActionStatus;
  result_id: string | null;
};


export type LumeMessage = {
  id: string;
  conversation_id: string;
  role: LumeRole;
  content: string;
  created_at: string;
  suggestions: string[];
  action: LumeAction | null;
};


export type LumeConversation = {
  id: string;
  title: string;
  last_message_at: string;
  message_count: number;
};


export type LumeSendResponse = {
  conversation_id: string;
  user_message: LumeMessage;
  assistant_message: LumeMessage;
};


export type LumeActionResult = {
  success: boolean;
  message: string;
  result_type: string | null;
  result_id: string | null;
  assistant_message: LumeMessage | null;
};


export type LumeSummary = {
  reference_month: string;
  income: number;
  expense: number;
  result: number;
  pending_count: number;
  overdue_count: number;
  upcoming_7_days: number;
  insight: string;
  suggestions: string[];
};
