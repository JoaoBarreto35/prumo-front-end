import type {
  ChangePasswordInput,
  MessageResult,
  Profile,
  ProfileUpdate,
  SecurityOverview,
  UserPreferences,
} from "../types/settings";
import { apiRequest } from "./api";


const PREFERENCES_STORAGE_KEY =
  "prumo-user-preferences";


export const settingsService = {
  getProfile(): Promise<Profile> {
    return apiRequest<Profile>(
      "/settings/profile",
    );
  },

  updateProfile(
    payload: ProfileUpdate,
  ): Promise<Profile> {
    return apiRequest<Profile>(
      "/settings/profile",
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    );
  },

  getPreferences():
    Promise<UserPreferences> {
    return apiRequest<UserPreferences>(
      "/settings/preferences",
    );
  },

  updatePreferences(
    payload: UserPreferences,
  ): Promise<UserPreferences> {
    return apiRequest<UserPreferences>(
      "/settings/preferences",
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    );
  },

  getSecurity():
    Promise<SecurityOverview> {
    return apiRequest<SecurityOverview>(
      "/settings/security",
    );
  },

  changePassword(
    payload: ChangePasswordInput,
  ): Promise<MessageResult> {
    return apiRequest<MessageResult>(
      "/settings/password",
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    );
  },

  revokeSession(
    sessionId: string,
  ): Promise<MessageResult> {
    return apiRequest<MessageResult>(
      `/settings/sessions/${sessionId}`,
      {
        method: "DELETE",
      },
    );
  },

  revokeOtherSessions():
    Promise<MessageResult> {
    return apiRequest<MessageResult>(
      "/settings/sessions/others",
      {
        method: "DELETE",
      },
    );
  },
};


export function savePreferencesCache(
  preferences: UserPreferences,
) {
  localStorage.setItem(
    PREFERENCES_STORAGE_KEY,
    JSON.stringify(preferences),
  );
}


export function readPreferencesCache():
  UserPreferences | null {
  try {
    const raw = localStorage.getItem(
      PREFERENCES_STORAGE_KEY,
    );

    if (!raw) {
      return null;
    }

    return JSON.parse(
      raw,
    ) as UserPreferences;
  } catch {
    return null;
  }
}


export function applyVisualPreferences(
  preferences: UserPreferences,
) {
  document.documentElement.dataset
    .density = preferences.density;

  document.documentElement.dataset
    .reduceMotion = String(
      preferences.reduce_motion,
    );

  savePreferencesCache(
    preferences,
  );
}
