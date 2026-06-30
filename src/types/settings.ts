import type {
  UserRole,
  UserStatus,
} from "./auth";


export type ThemePreference =
  | "light"
  | "dark"
  | "system";


export type DensityPreference =
  | "comfortable"
  | "compact";


export type DefaultPagePreference =
  | "/home"
  | "/calendar"
  | "/transactions"
  | "/planning"
  | "/reports";


export type Profile = {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  role: UserRole;
  must_change_password: boolean;
  created_at: string;
  last_login_at: string | null;
};


export type ProfileUpdate = {
  name: string;
  email: string;
};


export type UserPreferences = {
  theme: ThemePreference;
  density: DensityPreference;
  reduce_motion: boolean;
  default_page: DefaultPagePreference;
};


export type ChangePasswordInput = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};


export type UserSession = {
  id: string;
  device_name: string | null;
  created_at: string;
  expires_at: string;
  is_current: boolean;
};


export type SecurityOverview = {
  sessions: UserSession[];
  active_session_count: number;
};


export type MessageResult = {
  message: string;
};
