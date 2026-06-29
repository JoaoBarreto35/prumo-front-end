import type {
  Account,
  AccountCreateInput,
} from "../types/finance";
import { apiRequest } from "./api";

export const accountService = {
  list(): Promise<Account[]> {
    return apiRequest<Account[]>("/accounts");
  },

  create(data: AccountCreateInput): Promise<Account> {
    return apiRequest<Account>("/accounts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  deactivate(accountId: string): Promise<Account> {
    return apiRequest<Account>(
      `/accounts/${accountId}/deactivate`,
      {
        method: "PATCH",
      },
    );
  },
};
