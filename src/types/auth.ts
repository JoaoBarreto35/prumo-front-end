export type UserStatus = "pending" | "active" | "rejected" | "suspended";
export type UserRole = "user" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  role: UserRole;
  must_change_password: boolean;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
};

export type LoginInput = {
  email: string;
  password: string;
  device_name?: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};
