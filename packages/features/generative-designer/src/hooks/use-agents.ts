/**
 * React Query hooks for Agent management
 */

import { useQuery } from '@tanstack/react-query';
import { agentApi } from '../lib/api-client';
import type { Agent } from '../types';

// =============================================================================
// Query Keys
// =============================================================================

export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  list: (workshopId: string) => [...agentKeys.lists(), workshopId] as const,
  stats: (workshopId: string) => [...agentKeys.list(workshopId), 'stats'] as const,
};

// =============================================================================
// List Agents
// =============================================================================

export function useAgents(workshopId: string | undefined) {
  return useQuery({
    queryKey: workshopId ? agentKeys.list(workshopId) : [],
    queryFn: async () => {
      if (!workshopId) throw new Error('Workshop ID required');

      const response = await agentApi.list(workshopId);

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data!;
    },
    enabled: !!workshopId,
    staleTime: 1000 * 60 * 5, // 5 minutes (agents don't change often)
  });
}

// =============================================================================
// Get Agent Stats
// =============================================================================

export function useAgentStats(workshopId: string | undefined) {
  return useQuery({
    queryKey: workshopId ? agentKeys.stats(workshopId) : [],
    queryFn: async () => {
      if (!workshopId) throw new Error('Workshop ID required');

      const response = await agentApi.getStats(workshopId);

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data!;
    },
    enabled: !!workshopId,
    refetchInterval: 10000, // Auto-refresh every 10s during activities
  });
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get total tokens used across all agents
 */
export function useTotalTokensUsed(agents: Agent[] | undefined): number {
  if (!agents) return 0;
  return agents.reduce((sum, agent) => sum + agent.total_tokens_used, 0);
}

/**
 * Get most active agent (highest contributions)
 */
export function useMostActiveAgent(agents: Agent[] | undefined): Agent | null {
  if (!agents || agents.length === 0) return null;
  
  return agents.reduce((prev, current) => 
    current.contributions_count > prev.contributions_count ? current : prev
  );
}