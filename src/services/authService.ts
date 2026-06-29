import type {
  AuthUser,
  LoginInput,
  RegisterInput,
  TokenPair,
} from "../types/auth";
import { apiRequest } from "./api";

export const authService = {
  login(data: LoginInput): Promise<TokenPair> {
    return apiRequest<TokenPair>("/auth/login", {
      method: "POST",
      authenticated: false,
      body: JSON.stringify(data),
    });
  },

  register(data: RegisterInput): Promise<AuthUser> {
    return apiRequest<AuthUser>("/auth/register", {
      method: "POST",
      authenticated: false,
      body: JSON.stringify(data),
    });
  },

  getMe(): Promise<AuthUser> {
    return apiRequest<AuthUser>("/auth/me");
  },

  logout(refreshToken: string): Promise<void> {
    return apiRequest<void>("/auth/logout", {
      method: "POST",
      authenticated: false,
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });
  },
};
