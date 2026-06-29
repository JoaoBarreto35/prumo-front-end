import { apiRequest } from "./api";
import type {
  TransactionDeleteResult,
  TransactionDetail,
  TransactionEditInput,
  TransactionEditResult,
  TransactionEditScope,
} from "../types/transactionCrud";

export const transactionCrudService = {
  getDetail(transactionId: string): Promise<TransactionDetail> {
    return apiRequest<TransactionDetail>(
      `/transactions/${transactionId}`,
    );
  },

  update(
    transactionId: string,
    data: TransactionEditInput,
  ): Promise<TransactionEditResult> {
    return apiRequest<TransactionEditResult>(
      `/transactions/${transactionId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
  },

  remove(
    transactionId: string,
    scope: TransactionEditScope,
  ): Promise<TransactionDeleteResult> {
    return apiRequest<TransactionDeleteResult>(
      `/transactions/${transactionId}?scope=${scope}`,
      {
        method: "DELETE",
      },
    );
  },

  activateGroup(groupId: string): Promise<void> {
    return apiRequest<void>(
      `/transaction-groups/${groupId}/activate`,
      {
        method: "PATCH",
      },
    );
  },

  deactivateGroup(groupId: string): Promise<void> {
    return apiRequest<void>(
      `/transaction-groups/${groupId}/deactivate`,
      {
        method: "PATCH",
      },
    );
  },
};
