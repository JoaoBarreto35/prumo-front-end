import type {
  UserRole,
  UserStatus,
} from "./auth";


export type AdminUser = {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  role: UserRole;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;

  account_count: number;
  category_count: number;
  transaction_count: number;
  active_session_count: number;

  is_current_admin: boolean;
};


export type AdminUserSummary = {
  total: number;
  pending: number;
  active: number;
  rejected: number;
  suspended: number;
  admins: number;
  active_sessions: number;
};


export type AdminUserList = {
  items: AdminUser[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  summary: AdminUserSummary;
};


export type AdminSession = {
  id: string;
  device_name: string | null;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  is_active: boolean;
};


export type AdminSessionList = {
  items: AdminSession[];
  active_count: number;
};


export type AdminAction =
  | "status_changed"
  | "role_changed"
  | "temporary_password_reset"
  | "session_revoked"
  | "all_sessions_revoked";


export type AdminAuditItem = {
  id: string;
  admin_user_id: string;
  admin_name: string;
  target_user_id: string | null;
  target_name: string | null;
  action: AdminAction;
  metadata: Record<
    string,
    unknown
  >;
  created_at: string;
};


export type AdminAuditList = {
  items: AdminAuditItem[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};


export type TemporaryPasswordResult = {
  user_id: string;
  temporary_password: string;
  must_change_password: boolean;
  sessions_revoked: number;
};


export type AdminMessage = {
  message: string;
};
