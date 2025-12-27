// packages/features/generative-designer/src/hooks/use-selection.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export const selectionKeys = {
  all: ['selection'] as const,
  review: (workshopId: string) => [...selectionKeys.all, workshopId, 'review'] as const,
  summary: (workshopId: string) => [...selectionKeys.all, workshopId, 'summary'] as const,
};

/**
 * Review enriched ideas before final selection
 */
export function useReviewIdeas(workshopId: string | undefined) {
  return useQuery({
    queryKey: workshopId ? selectionKeys.review(workshopId) : [],
    queryFn: async () => {
      if (!workshopId) throw new Error('Workshop ID required');
      const response = await apiClient.get(`/workshops/${workshopId}/phase5/review`);
      if (response.error) throw new Error(response.error.message);
      return response.data!;
    },
    enabled: !!workshopId,
    refetchInterval: 5000,
  });
}

/**
 * Select final concept
 */
export function useSelectFinal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workshopId,
      ideaId,
      justification,
    }: {
      workshopId: string;
      ideaId: string;
      justification?: string;
    }) => {
      const response = await apiClient.post(
        `/workshops/${workshopId}/phase5/select-final`,
        {
          idea_id: ideaId,
          user_justification: justification,
        }
      );
      if (response.error) throw new Error(response.error.message);
      return response.data!;
    },
    onSuccess: (_, { workshopId }) => {
      queryClient.invalidateQueries({ queryKey: selectionKeys.summary(workshopId) });
    },
  });
}

/**
 * Generate Cahier de Charge
 */
export function useGenerateCahier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workshopId: string) => {
      const response = await apiClient.post(
        `/workshops/${workshopId}/phase5/generate-cahier`,
        {}
      );
      if (response.error) throw new Error(response.error.message);
      return response.data!;
    },
    onSuccess: (_, workshopId) => {
      queryClient.invalidateQueries({ queryKey: selectionKeys.summary(workshopId) });
    },
  });
}

/**
 * Get phase 5 summary
 */
export function usePhaseSummary(workshopId: string | undefined) {
  return useQuery({
    queryKey: workshopId ? selectionKeys.summary(workshopId) : [],
    queryFn: async () => {
      if (!workshopId) throw new Error('Workshop ID required');
      const response = await apiClient.get(`/workshops/${workshopId}/phase5/summary`);
      if (response.error) throw new Error(response.error.message);
      return response.data!;
    },
    enabled: !!workshopId,
    refetchInterval: 10000,
  });
}
