// =============================================================================
// packages/features/generative-designer/src/hooks/use-ideation.ts
// =============================================================================

import { useState } from "react";
import { apiClient } from "../lib/api-client";
import type { IdeationResponse, IdeationParameters } from "../types";

export function useIdeation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ideation, setIdeation] = useState<IdeationResponse | null>(null);

  const createIdeation = async (prompt: string, image?: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.createIdeation({ prompt, image });
      setIdeation(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateParameters = async (
    ideationId: string,
    parameters: Partial<IdeationParameters>
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.updateIdeation(ideationId, parameters);
      setIdeation(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setIdeation(null);
    setError(null);
    setLoading(false);
  };

  return {
    ideation,
    loading,
    error,
    createIdeation,
    updateParameters,
    reset,
  };
}
