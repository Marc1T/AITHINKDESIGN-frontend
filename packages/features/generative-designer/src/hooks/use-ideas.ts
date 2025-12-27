// packages/features/generative-designer/src/hooks/use-ideas.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export const ideaKeys = {
  all: ['ideas'] as const,
  lists: () => [...ideaKeys.all, 'list'] as const,
  list: (workshopId: string) => [...ideaKeys.lists(), workshopId] as const,
  detail: (workshopId: string, ideaId: string) => 
    [...ideaKeys.list(workshopId), ideaId] as const,
  summary: (workshopId: string) => 
    [...ideaKeys.list(workshopId), 'summary'] as const,
};

/**
 * Generate ideas with specified technique
 */
export function useGenerateIdeas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workshopId,
      technique,
      mode,
    }: {
      workshopId: string;
      technique: 'scamper' | 'random_word' | 'worst_idea';
      mode?: 'parallel' | 'sequence' | 'discussion';
    }) => {
      const response = await apiClient.post(
        `/workshops/${workshopId}/phase2/generate?technique=${technique}&mode=${mode || 'parallel'}`,
        {}
      );
      if (response.error) throw new Error(response.error.message);
      return response.data!;
    },
    onSuccess: (_, { workshopId }) => {
      queryClient.invalidateQueries({ queryKey: ideaKeys.list(workshopId) });
      queryClient.invalidateQueries({ queryKey: ideaKeys.summary(workshopId) });
    },
  });
}

/**
 * List ideas for a workshop
 */
export function useIdeas(workshopId: string | undefined) {
  return useQuery({
    queryKey: workshopId ? ideaKeys.list(workshopId) : [],
    queryFn: async () => {
      if (!workshopId) throw new Error('Workshop ID required');
      const response = await apiClient.get(`/workshops/${workshopId}/phase2/ideas`);
      if (response.error) throw new Error(response.error.message);
      return response.data!;
    },
    enabled: !!workshopId,
    staleTime: 1000 * 30,
  });
}

/**
 * Get idea details
 */
export function useIdea(workshopId: string | undefined, ideaId: string | undefined) {
  return useQuery({
    queryKey: workshopId && ideaId ? ideaKeys.detail(workshopId, ideaId) : [],
    queryFn: async () => {
      if (!workshopId || !ideaId) throw new Error('IDs required');
      const response = await apiClient.get(`/workshops/${workshopId}/phase2/ideas/${ideaId}`);
      if (response.error) throw new Error(response.error.message);
      return response.data!;
    },
    enabled: !!workshopId && !!ideaId,
  });
}

/**
 * Update idea
 */
export function useUpdateIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workshopId,
      ideaId,
      data,
    }: {
      workshopId: string;
      ideaId: string;
      data: { title?: string; description?: string };
    }) => {
      const response = await apiClient.patch(
        `/workshops/${workshopId}/phase2/ideas/${ideaId}`,
        data
      );
      if (response.error) throw new Error(response.error.message);
      return response.data!;
    },
    onSuccess: (_, { workshopId, ideaId }) => {
      queryClient.invalidateQueries({ queryKey: ideaKeys.detail(workshopId, ideaId) });
      queryClient.invalidateQueries({ queryKey: ideaKeys.list(workshopId) });
    },
  });
}

/**
 * Delete idea
 */
export function useDeleteIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workshopId,
      ideaId,
    }: {
      workshopId: string;
      ideaId: string;
    }) => {
      const response = await apiClient.delete(`/workshops/${workshopId}/phase2/ideas/${ideaId}`);
      if (response.error) throw new Error(response.error.message);
      return ideaId;
    },
    onSuccess: (ideaId, { workshopId }) => {
      queryClient.removeQueries({ queryKey: ideaKeys.detail(workshopId, ideaId) });
      queryClient.invalidateQueries({ queryKey: ideaKeys.list(workshopId) });
    },
  });
}

/**
 * Get phase 2 summary
 */
export function useIdeaSummary(workshopId: string | undefined) {
  return useQuery({
    queryKey: workshopId ? ideaKeys.summary(workshopId) : [],
    queryFn: async () => {
      if (!workshopId) throw new Error('Workshop ID required');
      const response = await apiClient.get(`/workshops/${workshopId}/phase2/summary`);
      if (response.error) throw new Error(response.error.message);
      return response.data!;
    },
    enabled: !!workshopId,
    refetchInterval: 10000,
  });
}
