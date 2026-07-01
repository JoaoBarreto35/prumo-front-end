import type {
  BulkTransactionApplyInput,
  BulkTransactionPreview,
  BulkTransactionRequest,
  BulkTransactionResult,
} from "../types/transactionBulk";
import { apiRequest } from "./api";


export const transactionBulkService = {
  preview(
    payload: BulkTransactionRequest,
  ): Promise<BulkTransactionPreview> {
    return apiRequest<
      BulkTransactionPreview
    >(
      "/transactions-bulk/preview",
      {
        method: "POST",
        body: JSON.stringify(
          payload,
        ),
      },
    );
  },

  apply(
    payload:
      BulkTransactionApplyInput,
  ): Promise<BulkTransactionResult> {
    return apiRequest<
      BulkTransactionResult
    >(
      "/transactions-bulk/apply",
      {
        method: "POST",
        body: JSON.stringify(
          payload,
        ),
      },
    );
  },
};
