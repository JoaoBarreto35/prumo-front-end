export type NotificationType =
  | "due_soon"
  | "due_today"
  | "overdue"
  | "system";


export type NotificationSeverity =
  | "info"
  | "warning"
  | "danger"
  | "success";


export type AppNotification = {
  id: string;
  transaction_id: string | null;
  notification_type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  action_path: string | null;
  due_date: string | null;
  read_at: string | null;
  snoozed_until: string | null;
  created_at: string;
};


export type NotificationList = {
  items: AppNotification[];
  unread_count: number;
};


export type NotificationCount = {
  unread_count: number;
};


export type NotificationPreferences = {
  due_soon_enabled: boolean;
  due_today_enabled: boolean;
  overdue_enabled: boolean;
  browser_notifications_enabled: boolean;
  reminder_days: number[];
};


export type NotificationSync = {
  synchronized: number;
  unread_count: number;
};
