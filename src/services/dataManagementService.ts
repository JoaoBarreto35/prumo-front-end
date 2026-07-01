import type {
  DataExportFile,
  DataImportPreview,
  DataImportRequest,
  DataImportResult,
  DataMessage,
  DataOperationLog,
  DataSummary,
} from "../types/dataManagement";
import { apiRequest } from "./api";


function downloadTextFile(
  file: DataExportFile,
) {
  const blob = new Blob(
    [file.content],
    {
      type: file.mime_type,
    },
  );

  const url =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

  anchor.href = url;
  anchor.download =
    file.filename;

  document.body.appendChild(
    anchor,
  );
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}


export const dataManagementService = {
  getSummary():
    Promise<DataSummary> {
    return apiRequest<DataSummary>(
      "/data/summary",
    );
  },

  async exportBackup():
    Promise<void> {
    const file =
      await apiRequest<
        DataExportFile
      >(
        "/data/export/backup",
      );

    downloadTextFile(file);
  },

  async exportCsv():
    Promise<void> {
    const file =
      await apiRequest<
        DataExportFile
      >(
        "/data/export/csv",
      );

    downloadTextFile(file);
  },

  previewImport(
    payload:
      DataImportRequest,
  ): Promise<DataImportPreview> {
    return apiRequest<
      DataImportPreview
    >(
      "/data/import/preview",
      {
        method: "POST",
        body: JSON.stringify(
          payload,
        ),
      },
    );
  },

  applyImport(
    payload:
      DataImportRequest,
  ): Promise<DataImportResult> {
    return apiRequest<
      DataImportResult
    >(
      "/data/import/apply",
      {
        method: "POST",
        body: JSON.stringify(
          payload,
        ),
      },
    );
  },

  clearFinancialData(
    currentPassword: string,
    confirmation: string,
  ): Promise<DataMessage> {
    return apiRequest<
      DataMessage
    >(
      "/data/clear-financial",
      {
        method: "POST",
        body: JSON.stringify({
          current_password:
            currentPassword,
          confirmation,
        }),
      },
    );
  },

  deleteAccount(
    currentPassword: string,
    email: string,
    confirmation: string,
  ): Promise<DataMessage> {
    return apiRequest<
      DataMessage
    >(
      "/data/account",
      {
        method: "DELETE",
        body: JSON.stringify({
          current_password:
            currentPassword,
          email,
          confirmation,
        }),
      },
    );
  },

  listHistory():
    Promise<
      DataOperationLog[]
    > {
    return apiRequest<
      DataOperationLog[]
    >(
      "/data/history?page=1&page_size=20",
    );
  },
};
