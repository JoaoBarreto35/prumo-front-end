import type {
  Account,
  AccountCreateInput,
  AccountUpdateInput,
  StructureImpact,
  StructureOperationResult,
} from "../types/finance";
import { apiRequest } from "./api";


export const accountService = {
  list(): Promise<Account[]> {
    return apiRequest<Account[]>(
      "/accounts",
    );
  },

  create(
    data: AccountCreateInput,
  ): Promise<Account> {
    return apiRequest<Account>(
      "/accounts",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  update(
    accountId: string,
    data: AccountUpdateInput,
  ): Promise<Account> {
    return apiRequest<Account>(
      `/accounts/${accountId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  },

  impact(
    accountId: string,
  ): Promise<StructureImpact> {
    return apiRequest<StructureImpact>(
      `/accounts/${accountId}/impact`,
    );
  },

  setDefault(
    accountId: string,
  ): Promise<Account> {
    return apiRequest<Account>(
      `/accounts/${accountId}/default`,
      {
        method: "POST",
      },
    );
  },

  activate(
    accountId: string,
  ): Promise<Account> {
    return apiRequest<Account>(
      `/accounts/${accountId}/activate`,
      {
        method: "POST",
      },
    );
  },

  archive(
    accountId: string,
    replacementDefaultAccountId:
      string | null,
  ): Promise<Account> {
    return apiRequest<Account>(
      `/accounts/${accountId}/archive`,
      {
        method: "POST",
        body: JSON.stringify({
          replacement_default_account_id:
            replacementDefaultAccountId,
        }),
      },
    );
  },

  transfer(
    accountId: string,
    targetAccountId: string,
    confirmClosedMonths: boolean,
  ): Promise<StructureOperationResult> {
    return apiRequest<
      StructureOperationResult
    >(
      `/accounts/${accountId}/transfer`,
      {
        method: "POST",
        body: JSON.stringify({
          target_account_id:
            targetAccountId,
          confirm_closed_months:
            confirmClosedMonths,
        }),
      },
    );
  },

  remove(
    accountId: string,
    targetAccountId: string | null,
    confirmClosedMonths: boolean,
  ): Promise<StructureOperationResult> {
    return apiRequest<
      StructureOperationResult
    >(
      `/accounts/${accountId}/delete`,
      {
        method: "POST",
        body: JSON.stringify({
          target_account_id:
            targetAccountId,
          confirm_closed_months:
            confirmClosedMonths,
          confirm_delete: true,
        }),
      },
    );
  },

  deactivate(
    accountId: string,
  ): Promise<Account> {
    return apiRequest<Account>(
      `/accounts/${accountId}/deactivate`,
      {
        method: "PATCH",
      },
    );
  },
};
