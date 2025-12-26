// =============================================================================
// packages/features/generative-designer/src/hooks/use-cahier-de-charge.ts
// Hook pour gérer la génération du Cahier de Charge
// =============================================================================

import { useState } from 'react';
import { apiClient } from '../lib/api-client';

export function useCahierDeCharge() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const generateCahier = async (ideationId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await apiClient.generateCahierDeCharge(ideationId);
      setSuccess(true);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateCahier,
    loading,
    error,
    success,
  };
}