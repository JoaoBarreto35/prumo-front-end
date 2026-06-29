import type { TokenPair } from "../types/auth";
import { tokenStorage } from "./tokenStorage";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL não foi configurada.");
}

type ApiErrorPayload = {
  detail?: string | Array<{ msg?: string }>;
};

export class ApiError extends Error {
  status: number;
  payload: ApiErrorPayload | null;

  constructor(
    message: string,
    status: number,
    payload: ApiErrorPayload | null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

let refreshPromise: Promise<TokenPair> | null = null;

function getErrorMessage(payload: ApiErrorPayload | null): string {
  if (!payload?.detail) {
    return "Não foi possível concluir a solicitação.";
  }

  if (typeof payload.detail === "string") {
    return payload.detail;
  }

  return payload.detail
    .map((item) => item.msg)
    .filter(Boolean)
    .join(" ");
}

async function parseError(response: Response): Promise<ApiError> {
  let payload: ApiErrorPayload | null = null;

  try {
    payload = (await response.json()) as ApiErrorPayload;
  } catch {
    payload = null;
  }

  return new ApiError(
    getErrorMessage(payload),
    response.status,
    payload,
  );
}

async function refreshTokens(): Promise<TokenPair> {
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) {
    throw new ApiError("Sessão expirada.", 401, null);
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    tokenStorage.clear();
    throw await parseError(response);
  }

  const tokens = (await response.json()) as TokenPair;
  tokenStorage.save(tokens);

  return tokens;
}

async function getRefreshedTokens(): Promise<TokenPair> {
  if (!refreshPromise) {
    refreshPromise = refreshTokens().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

type ApiOptions = RequestInit & {
  authenticated?: boolean;
  retryOnUnauthorized?: boolean;
};

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const {
    authenticated = true,
    retryOnUnauthorized = true,
    headers: customHeaders,
    ...requestOptions
  } = options;

  const headers = new Headers(customHeaders);

  if (!headers.has("Content-Type") && requestOptions.body) {
    headers.set("Content-Type", "application/json");
  }

  if (authenticated) {
    const accessToken = tokenStorage.getAccessToken();

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...requestOptions,
      headers,
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor.",
      0,
      null,
    );
  }

  if (
    response.status === 401 &&
    authenticated &&
    retryOnUnauthorized &&
    tokenStorage.getRefreshToken()
  ) {
    await getRefreshedTokens();

    return apiRequest<T>(path, {
      ...options,
      retryOnUnauthorized: false,
    });
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
