import type {
  ClosingHistoryItem,
  ClosingMonthStatus,
  ClosingSummary,
} from "../types/closings";
import { apiRequest } from "./api";


export const closingService = {
  listHistory():
    Promise<ClosingHistoryItem[]> {
    return apiRequest<
      ClosingHistoryItem[]
    >("/closings");
  },

  getSummary(
    referenceMonth: string,
  ): Promise<ClosingSummary> {
    const search =
      new URLSearchParams({
        reference_month:
          referenceMonth,
      });

    return apiRequest<ClosingSummary>(
      `/closings/summary?${search.toString()}`,
    );
  },

  closeMonth(
    referenceMonth: string,
    notes: string | null,
  ): Promise<ClosingSummary> {
    return apiRequest<ClosingSummary>(
      `/closings/${referenceMonth}/close`,
      {
        method: "POST",
        body: JSON.stringify({
          notes,
        }),
      },
    );
  },

  reopenMonth(
    referenceMonth: string,
  ): Promise<ClosingSummary> {
    return apiRequest<ClosingSummary>(
      `/closings/${referenceMonth}/reopen`,
      {
        method: "POST",
      },
    );
  },

  updateNotes(
    referenceMonth: string,
    notes: string | null,
  ): Promise<ClosingSummary> {
    return apiRequest<ClosingSummary>(
      `/closings/${referenceMonth}/notes`,
      {
        method: "PUT",
        body: JSON.stringify({
          notes,
        }),
      },
    );
  },

  getMonthStatus(
    referenceDate: string,
  ): Promise<ClosingMonthStatus> {
    const search =
      new URLSearchParams({
        reference_date:
          referenceDate,
      });

    return apiRequest<
      ClosingMonthStatus
    >(
      `/closings/month-status?${search.toString()}`,
    );
  },
};
