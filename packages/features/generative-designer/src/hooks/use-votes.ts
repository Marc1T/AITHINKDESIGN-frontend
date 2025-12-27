// packages/features/generative-designer/src/hooks/use-votes.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export const voteKeys = {
  all: ['votes'] as const,
  results: (workshopId: string, voteType: string) => 
    [...voteKeys.all, workshopId, voteType, 'results'] as const,
  summary: (workshopId: string) => 
    [...voteKeys.all, workshopId, 'summary'] as const,
};

/**
 * Initiate voting session
 */
export function useInitiateVoting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workshopId,
      voteType,
    }: {
      workshopId: string;
      voteType: 'dot_voting' | 'now_how_wow' | 'impact_effort';
    }) => {
      const response = await apiClient.post(
        `/workshops/${workshopId}/phase3/vote?vote_type=${voteType}`,
        {}
      );
      if (response.error) throw new Error(response.error.message);
      return response.data!;
    },
    onSuccess: (_, { workshopId, voteType }) => {
      queryClient.invalidateQueries({ queryKey: voteKeys.results(workshopId, voteType) });
      queryClient.invalidateQueries({ queryKey: voteKeys.summary(workshopId) });
    },
  });
}

/**
 * Cast a vote
 */
export function useVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workshopId,
      voteType,
      ideaId,
      value,
    }: {
      workshopId: string;
      voteType: string;
      ideaId: string;
      value: any;
    }) => {
      const response = await apiClient.post(
        `/workshops/${workshopId}/phase3/vote/user?vote_type=${voteType}`,
        { idea_id: ideaId, value }
      );
      if (response.error) throw new Error(response.error.message);
      return response.data!;
    },
    onSuccess: (_, { workshopId, voteType }) => {
      queryClient.invalidateQueries({ queryKey: voteKeys.results(workshopId, voteType) });
      queryClient.invalidateQueries({ queryKey: voteKeys.summary(workshopId) });
    },
  });
}

/**
 * Get voting results
 */
export function useVoteResults(workshopId: string | undefined, voteType: string) {
  return useQuery({
    queryKey: workshopId ? voteKeys.results(workshopId, voteType) : [],
    queryFn: async () => {
      if (!workshopId) throw new Error('Workshop ID required');
      const response = await apiClient.get(
        `/workshops/${workshopId}/phase3/results?vote_type=${voteType}`
      );
      if (response.error) throw new Error(response.error.message);
      return response.data!;
    },
    enabled: !!workshopId,
    refetchInterval: 5000,
  });
}

/**
 * Get voting summary
 */
export function useVoteSummary(workshopId: string | undefined) {
  return useQuery({
    queryKey: workshopId ? voteKeys.summary(workshopId) : [],
    queryFn: async () => {
      if (!workshopId) throw new Error('Workshop ID required');
      const response = await apiClient.get(`/workshops/${workshopId}/phase3/summary`);
      if (response.error) throw new Error(response.error.message);
      return response.data!;
    },
    enabled: !!workshopId,
    refetchInterval: 10000,
  });
}

/**
 * Select top ideas
 */
export function useSelectTop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workshopId,
      ideaIds,
    }: {
      workshopId: string;
      ideaIds: string[];
    }) => {
      const response = await apiClient.post(
        `/workshops/${workshopId}/phase3/select-top`,
        { idea_ids: ideaIds }
      );
      if (response.error) throw new Error(response.error.message);
      return response.data!;
    },
    onSuccess: (_, { workshopId }) => {
      queryClient.invalidateQueries({ queryKey: voteKeys.summary(workshopId) });
    },
  });
}
