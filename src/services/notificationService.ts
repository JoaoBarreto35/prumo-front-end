import type {
  AppNotification,
  NotificationCount,
  NotificationList,
  NotificationPreferences,
  NotificationSync,
} from "../types/notifications";
import { apiRequest } from "./api";


type ListParams = {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
};


export const notificationService = {
  list(
    params: ListParams = {},
  ): Promise<NotificationList> {
    const searchParams =
      new URLSearchParams();

    if (params.unreadOnly) {
      searchParams.set(
        "unread_only",
        "true",
      );
    }

    if (params.limit) {
      searchParams.set(
        "limit",
        String(params.limit),
      );
    }

    if (params.offset) {
      searchParams.set(
        "offset",
        String(params.offset),
      );
    }

    const query =
      searchParams.toString();

    return apiRequest<NotificationList>(
      `/notifications${
        query ? `?${query}` : ""
      }`,
    );
  },

  unreadCount():
    Promise<NotificationCount> {
    return apiRequest<NotificationCount>(
      "/notifications/unread-count",
    );
  },

  sync():
    Promise<NotificationSync> {
    return apiRequest<NotificationSync>(
      "/notifications/sync",
      {
        method: "POST",
      },
    );
  },

  markRead(
    notificationId: string,
  ): Promise<AppNotification> {
    return apiRequest<AppNotification>(
      `/notifications/${notificationId}/read`,
      {
        method: "PATCH",
      },
    );
  },

  markAllRead():
    Promise<NotificationCount> {
    return apiRequest<NotificationCount>(
      "/notifications/read-all",
      {
        method: "POST",
      },
    );
  },

  snooze(
    notificationId: string,
    days = 1,
  ): Promise<AppNotification> {
    return apiRequest<AppNotification>(
      `/notifications/${notificationId}/snooze`,
      {
        method: "POST",
        body: JSON.stringify({
          days,
        }),
      },
    );
  },

  dismiss(
    notificationId: string,
  ): Promise<void> {
    return apiRequest<void>(
      `/notifications/${notificationId}`,
      {
        method: "DELETE",
      },
    );
  },

  getPreferences():
    Promise<NotificationPreferences> {
    return apiRequest<
      NotificationPreferences
    >(
      "/notifications/preferences/me",
    );
  },

  updatePreferences(
    payload: NotificationPreferences,
  ): Promise<NotificationPreferences> {
    return apiRequest<
      NotificationPreferences
    >(
      "/notifications/preferences/me",
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    );
  },
};


export function dispatchNotificationRefresh() {
  window.dispatchEvent(
    new CustomEvent(
      "prumo:notifications-refresh",
    ),
  );
}
