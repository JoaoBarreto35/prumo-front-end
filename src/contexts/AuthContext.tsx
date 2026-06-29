import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ApiError } from "../services/api";
import { authService } from "../services/authService";
import { tokenStorage } from "../services/tokenStorage";
import type {
  AuthUser,
  LoginInput,
  RegisterInput,
} from "../types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<AuthUser>;
  register: (data: RegisterInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    const hasSession =
      Boolean(tokenStorage.getAccessToken()) ||
      Boolean(tokenStorage.getRefreshToken());

    if (!hasSession) {
      setUser(null);
      return null;
    }

    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
        return null;
      }

      throw error;
    }
  }, [clearSession]);

  useEffect(() => {
    async function restoreSession() {
      try {
        await refreshUser();
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    }

    void restoreSession();
  }, [clearSession, refreshUser]);

  const login = useCallback(
    async (data: LoginInput): Promise<AuthUser> => {
      const tokens = await authService.login(data);
      tokenStorage.save(tokens);

      try {
        const currentUser = await authService.getMe();
        setUser(currentUser);
        return currentUser;
      } catch (error) {
        clearSession();
        throw error;
      }
    },
    [clearSession],
  );

  const register = useCallback(
    async (data: RegisterInput): Promise<AuthUser> => {
      return authService.register(data);
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    const refreshToken = tokenStorage.getRefreshToken();

    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
