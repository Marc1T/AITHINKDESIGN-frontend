// =============================================================================
// packages/features/generative-designer/src/hooks/use-chat.ts
// =============================================================================

import { useState, useCallback } from "react";
import { apiClient } from "../lib/api-client";
import type { ChatMessage, ConversationState, ChatResponse } from "../types";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationState, setConversationState] = useState<ConversationState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeChat = useCallback(async () => {
    try {
      const welcome = await apiClient.getChatWelcome();
      const welcomeMessage: ChatMessage = {
        role: "assistant",
        content: welcome.message,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      role: "user",
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.sendChatMessage({
        message: content,
        conversation_history: messages,
        conversation_state: conversationState || undefined,
      });

      const botMessage: ChatMessage = {
        role: "assistant",
        content: response.bot_message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setConversationState(response.conversation_state);

      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [messages, conversationState]);

  const reset = useCallback(() => {
    setMessages([]);
    setConversationState(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    messages,
    conversationState,
    loading,
    error,
    initializeChat,
    sendMessage,
    reset,
  };
}
