import type {
  Transaction,
  TransactionGroup,
  TransactionGroupCreateInput,
  TransactionStatus,
} from "../types/transactions";
import { apiRequest } from "./api";

export const transactionService = {
  listGroups(): Promise<TransactionGroup[]> {
    return apiRequest<TransactionGroup[]>("/transaction-groups");
  },

  createGroup(
    data: TransactionGroupCreateInput,
  ): Promise<TransactionGroup> {
    return apiRequest<TransactionGroup>("/transaction-groups", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  deleteGroup(groupId: string): Promise<void> {
    return apiRequest<void>(`/transaction-groups/${groupId}`, {
      method: "DELETE",
    });
  },

  listTransactions(params?: {
    status?: TransactionStatus;
    limit?: number;
    offset?: number;
  }): Promise<Transaction[]> {
    const searchParams = new URLSearchParams();

    if (params?.status) {
      searchParams.set("status", params.status);
    }

    if (params?.limit) {
      searchParams.set("limit", String(params.limit));
    }

    if (params?.offset) {
      searchParams.set("offset", String(params.offset));
    }

    const query = searchParams.toString();

    return apiRequest<Transaction[]>(
      `/transactions${query ? `?${query}` : ""}`,
    );
  },

  updateStatus(
    transactionId: string,
    status: TransactionStatus,
  ): Promise<Transaction> {
    return apiRequest<Transaction>(
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
