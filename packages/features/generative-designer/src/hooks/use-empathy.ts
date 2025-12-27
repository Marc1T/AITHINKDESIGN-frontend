// packages/features/generative-designer/src/hooks/use-empathy.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export const empathyKeys = {
  all: ['empathy'] as const,
  map: (workshopId: string) => [...empathyKeys.all, workshopId, 'map'] as const,
  journey: (workshopId: string) => [...empathyKeys.all, workshopId, 'journey'] as const,
  hmw: (workshopId: string) => [...empathyKeys.all, workshopId, 'hmw'] as const,
  summary: (workshopId: string) => [...empathyKeys.all, workshopId, 'summary'] as const,
};

/**
 * Run empathy map analysis
 */
export function useRunEmpathyMap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workshopId,
      userPersona,
    }: {
      workshopId: string;
      userPersona: any;
    }) => {
      const response = await apiClient.post(
        `/workshops/${workshopId}/phase1/empathy-map`,
        { user_persona: userPersona }
      );
      if (response.error) throw new Error(response.error.message);
      return response.data!;
    },
    onSuccess: (_, { workshopId }) => {
      queryClient.invalidateQueries({ queryKey: empathyKeys.map(workshopId) });
      queryClient.invalidateQueries({ queryKey: empathyKeys.summary(workshopId) });
    },
  });
}

/**
 * Run customer journey analysis
 */
export function useRunCustomerJourney() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workshopId: string) => {
      const response = await apiClient.post(
        `/workshops/${workshopId}/phase1/customer-journey`,
        {}
      );
      if (response.error) throw new Error(response.error.message);
      return response.data!;
    },
    onSuccess: (_, workshopId) => {
      queryClient.invalidateQueries({ queryKey: empathyKeys.journey(workshopId) });
      queryClient.invalidateQueries({ queryKey: empathyKeys.summary(workshopId) });
    },
  });
}

/**
 * Generate HMW (How Might We) questions
 */
export function useGenerateHMW() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workshopId: string) => {
      const response = await apiClient.post(
        `/workshops/${workshopId}/phase1/hmw`,
        {}
      );
      if (response.error) throw new Error(response.error.message);
      return response.data!;
    },
    onSuccess: (_, workshopId) => {
      queryClient.invalidateQueries({ queryKey: empathyKeys.hmw(workshopId) });
      queryClient.invalidateQueries({ queryKey: empathyKeys.summary(workshopId) });
    },
  });
}

/**
 * Get phase 1 summary
 */
export function usePhase1Summary(workshopId: string | undefined) {
  return useQuery({
    queryKey: workshopId ? empathyKeys.summary(workshopId) : [],
    queryFn: async () => {
      if (!workshopId) throw new Error('Workshop ID required');
      const response = await apiClient.get(`/workshops/${workshopId}/phase1/summary`);
      if (response.error) throw new Error(response.error.message);
      return response.data!;
    },
    enabled: !!workshopId,
    refetchInterval: 10000,
  });
}

/**
 * Complete phase 1
 */
export function useCompletePhase1() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workshopId: string) => {
      const response = await apiClient.post(
        `/workshops/${workshopId}/phase1/complete`,
        {}
      );
      if (response.error) throw new Error(response.error.message);
      return response.data!;
    },
    onSuccess: (_, workshopId) => {
      queryClient.invalidateQueries({ queryKey: empathyKeys.all });
    },
  });
}
