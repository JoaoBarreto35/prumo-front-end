import type {
  GroupType,
  Transaction,
  TransactionGroup,
  TransactionGroupCreateInput,
  TransactionStatus,
  TransactionStatusResult,
} from "../types/transactions";
import { apiRequest } from "./api";


type ListTransactionsParams = {
  status?: TransactionStatus;
  accountId?: string;
  groupType?: GroupType;
  search?: string;
  limit?: number;
  offset?: number;
};


export const transactionService = {
  listGroups(): Promise<TransactionGroup[]> {
    return apiRequest<TransactionGroup[]>(
      "/transaction-groups",
    );
  },

  createGroup(
    data: TransactionGroupCreateInput,
  ): Promise<TransactionGroup> {
    return apiRequest<TransactionGroup>(
      "/transaction-groups",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  deleteGroup(
    groupId: string,
  ): Promise<void> {
    return apiRequest<void>(
      `/transaction-groups/${groupId}`,
      {
        method: "DELETE",
      },
    );
  },

  listTransactions(
    params?: ListTransactionsParams,
  ): Promise<Transaction[]> {
    const searchParams =
      new URLSearchParams();

    if (params?.status) {
      searchParams.set(
        "status",
        params.status,
      );
    }

    if (params?.accountId) {
      searchParams.set(
        "account_id",
        params.accountId,
      );
    }

    if (params?.groupType) {
      searchParams.set(
        "group_type",
        params.groupType,
      );
    }

    if (params?.search?.trim()) {
      searchParams.set(
        "search",
        params.search.trim(),
      );
    }

    if (params?.limit) {
      searchParams.set(
        "limit",
        String(params.limit),
      );
    }

    if (params?.offset) {
      searchParams.set(
        "offset",
        String(params.offset),
      );
    }

    const query =
      searchParams.toString();

    return apiRequest<Transaction[]>(
      `/transactions${
        query ? `?${query}` : ""
      }`,
    );
  },

  updateStatus(
    transactionId: string,
    status: TransactionStatus,
  ): Promise<TransactionStatusResult> {
    return apiRequest<TransactionStatusResult>(
      `/transactions/${transactionId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status,
          completed_at: null,
        }),
      },
    );
  },
};
