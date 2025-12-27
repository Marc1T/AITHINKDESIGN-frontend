// packages/features/generative-designer/src/hooks/use-phases.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workshopApi } from '../lib/api-client';
import { workshopKeys } from './use-workshops';

export const phaseKeys = {
  all: ['phases'] as const,
  status: (workshopId: string) => [...phaseKeys.all, workshopId, 'status'] as const,
};

/**
 * Advance to next phase
 */
export function useAdvancePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workshopId,
      targetPhase,
    }: {
      workshopId: string;
      targetPhase: number;
    }) => {
      const response = await workshopApi.advancePhase(workshopId, targetPhase);
      if (response.error) throw new Error(response.error.message);
      return response.data!;
    },
    onSuccess: (_, { workshopId }) => {
      queryClient.invalidateQueries({ queryKey: phaseKeys.status(workshopId) });
      // Also refresh workshop lists/details so UI updates current_phase/status
      queryClient.invalidateQueries({ queryKey: workshopKeys.all });
      queryClient.invalidateQueries({ queryKey: workshopKeys.detail(workshopId) });
    },
  });
}

/**
 * Get phase status
 */
export function usePhaseStatus(workshopId: string | undefined) {
  return useQuery({
    queryKey: workshopId ? phaseKeys.status(workshopId) : [],
    queryFn: async () => {
      if (!workshopId) throw new Error('Workshop ID required');
      const response = await workshopApi.getPhaseStatus(workshopId);
      if (response.error) throw new Error(response.error.message);
      return response.data!;
    },
    enabled: !!workshopId,
    refetchInterval: 5000, // Auto-refresh every 5s
  });
}
