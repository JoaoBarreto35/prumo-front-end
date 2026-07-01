import type {
  UserRole,
  UserStatus,
} from "../types/auth";
import type {
  AdminAction,
  AdminAuditList,
  AdminMessage,
  AdminSessionList,
  AdminUserList,
  TemporaryPasswordResult,
} from "../types/admin";
import { apiRequest } from "./api";


type UserListParams = {
  search?: string;
  status?: UserStatus | "all";
  role?: UserRole | "all";
  page?: number;
  pageSize?: number;
};


type AuditListParams = {
  action?: AdminAction | "all";
  targetUserId?: string;
  page?: number;
  pageSize?: number;
};


export const adminService = {
  listUsers(
    params: UserListParams = {},
  ): Promise<AdminUserList> {
    const search =
      new URLSearchParams();

    if (params.search?.trim()) {
      search.set(
        "search",
        params.search.trim(),
      );
    }

    if (
      params.status
      && params.status !== "all"
    ) {
      search.set(
        "status",
        params.status,
      );
    }

    if (
      params.role
      && params.role !== "all"
    ) {
      search.set(
        "role",
        params.role,
      );
    }

    search.set(
      "page",
      String(params.page ?? 1),
    );
    search.set(
      "page_size",
      String(params.pageSize ?? 20),
    );

    return apiRequest<AdminUserList>(
      `/admin/users?${search.toString()}`,
    );
  },

  updateStatus(
    userId: string,
    status: UserStatus,
    reason?: string,
  ): Promise<AdminMessage> {
    return apiRequest<AdminMessage>(
      `/admin/users/${userId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status,
          reason:
            reason?.trim()
            || null,
        }),
      },
    );
  },

  updateRole(
    userId: string,
    role: UserRole,
    reason?: string,
  ): Promise<AdminMessage> {
    return apiRequest<AdminMessage>(
      `/admin/users/${userId}/role`,
      {
        method: "PATCH",
        body: JSON.stringify({
          role,
          reason:
            reason?.trim()
            || null,
        }),
      },
    );
  },

  resetTemporaryPassword(
    userId: string,
  ): Promise<TemporaryPasswordResult> {
    return apiRequest<
      TemporaryPasswordResult
    >(
      `/admin/users/${userId}/temporary-password`,
      {
        method: "POST",
      },
    );
  },

  listSessions(
    userId: string,
  ): Promise<AdminSessionList> {
    return apiRequest<
      AdminSessionList
    >(
      `/admin/users/${userId}/sessions`,
    );
  },

  revokeSession(
    userId: string,
    sessionId: string,
  ): Promise<AdminMessage> {
    return apiRequest<AdminMessage>(
      `/admin/users/${userId}/sessions/${sessionId}`,
      {
        method: "DELETE",
      },
    );
  },

  revokeAllSessions(
    userId: string,
  ): Promise<AdminMessage> {
    return apiRequest<AdminMessage>(
      `/admin/users/${userId}/sessions`,
      {
        method: "DELETE",
      },
    );
  },

  listAudit(
    params: AuditListParams = {},
  ): Promise<AdminAuditList> {
    const search =
      new URLSearchParams();

    if (
      params.action
      && params.action !== "all"
    ) {
      search.set(
        "action",
        params.action,
      );
    }

    if (params.targetUserId) {
      search.set(
        "target_user_id",
        params.targetUserId,
      );
    }

    search.set(
      "page",
      String(params.page ?? 1),
    );
    search.set(
      "page_size",
      String(params.pageSize ?? 30),
    );

    return apiRequest<AdminAuditList>(
      `/admin/audit?${search.toString()}`,
    );
  },
};
