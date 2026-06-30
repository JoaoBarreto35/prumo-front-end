import type {
  LumeActionResult,
  LumeConversation,
  LumeMessage,
  LumeSendResponse,
  LumeSummary,
} from "../types/lume";
import { apiRequest } from "./api";


export const lumeService = {
  listConversations():
    Promise<LumeConversation[]> {
    return apiRequest<
      LumeConversation[]
    >("/lume/conversations");
  },

  listMessages(
    conversationId: string,
  ): Promise<LumeMessage[]> {
    return apiRequest<LumeMessage[]>(
      `/lume/conversations/${conversationId}/messages`,
    );
  },

  sendMessage(
    message: string,
    conversationId?: string | null,
  ): Promise<LumeSendResponse> {
    return apiRequest<LumeSendResponse>(
      "/lume/message",
      {
        method: "POST",
        body: JSON.stringify({
          message,
          conversation_id:
            conversationId ?? null,
        }),
      },
    );
  },

  confirmAction(
    messageId: string,
  ): Promise<LumeActionResult> {
    return apiRequest<LumeActionResult>(
      `/lume/actions/${messageId}/confirm`,
      {
        method: "POST",
      },
    );
  },

  cancelAction(
    messageId: string,
  ): Promise<LumeActionResult> {
    return apiRequest<LumeActionResult>(
      `/lume/actions/${messageId}/cancel`,
      {
        method: "POST",
      },
    );
  },

  deleteConversation(
    conversationId: string,
  ): Promise<void> {
    return apiRequest<void>(
      `/lume/conversations/${conversationId}`,
      {
        method: "DELETE",
      },
    );
  },

  getSummary():
    Promise<LumeSummary> {
    return apiRequest<LumeSummary>(
      "/lume/summary",
    );
  },
};
