// =============================================================================
// packages/features/generative-designer/src/hooks/use-triz.ts
// Hook pour gérer la conversation TRIZ
// =============================================================================

import { useState, useCallback } from 'react';
import { apiClient } from '../lib/api-client';
import type { TRIZMessage, TRIZChatResponse } from '../types';

export function useTRIZ(ideationId: string) {
  const [messages, setMessages] = useState<TRIZMessage[]>([]);
  const [state, setState] = useState<TRIZChatResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeTRIZ = useCallback(async () => {
    try {
      const welcome = await apiClient.getTRIZWelcome(ideationId);
      const welcomeMessage: TRIZMessage = {
        role: 'assistant',
        content: welcome.message,
      };
      setMessages([welcomeMessage]);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message);
    }
  }, [ideationId]);

  const sendTRIZMessage = useCallback(async (content: string) => {
    const userMessage: TRIZMessage = {
      role: 'user',
      content,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.sendTRIZMessage({
        ideation_id: ideationId,
        message: content,
        triz_history: messages,
      });

      const botMessage: TRIZMessage = {
        role: 'assistant',
        content: response.bot_message,
      };

      setMessages(prev => [...prev, botMessage]);
      setState(response);

      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [ideationId, messages]);

  return {
    messages,
    state,
    loading,
    error,
    initializeTRIZ,
    sendTRIZMessage,
  };
}
