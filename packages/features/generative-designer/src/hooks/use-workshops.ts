/**
 * React Query hooks for Workshop management
 * Handles fetching, creating, updating, and deleting workshops
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workshopApi } from '../lib/api-client';
import type {
  CreateWorkshopRequest,
  WorkshopResponse,
  WorkshopDetail,
} from '../types';

// =============================================================================
// Query Keys
// =============================================================================

export const workshopKeys = {
  all: ['workshops'] as const,
  lists: () => [...workshopKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) =>
    [...workshopKeys.lists(), filters] as const,
  details: () => [...workshopKeys.all, 'detail'] as const,
  detail: (id: string) => [...workshopKeys.details(), id] as const,
  stats: (id: string) => [...workshopKeys.detail(id), 'stats'] as const,
};

// =============================================================================
// List Workshops
// =============================================================================

export interface UseWorkshopsOptions {
  status?: string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

export function useWorkshops(options: UseWorkshopsOptions = {}) {
  return useQuery({
    queryKey: workshopKeys.list({
      status: options.status,
      limit: options.limit,
      offset: options.offset,
    }),
    queryFn: async () => {
      const response = await workshopApi.list({
        status: options.status,
        limit: options.limit,
        offset: options.offset,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data!;
    },
    enabled: options.enabled !== false,
    staleTime: 1000 * 60, // 1 minute
  });
}

// =============================================================================
// Get Workshop Details
// =============================================================================

export function useWorkshop(workshopId: string | undefined) {
  return useQuery({
    queryKey: workshopId ? workshopKeys.detail(workshopId) : [],
    queryFn: async () => {
      if (!workshopId) throw new Error('Workshop ID required');

      const response = await workshopApi.getById(workshopId);

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data!;
    },
    enabled: !!workshopId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

// =============================================================================
// Get Workshop Stats
// =============================================================================

export function useWorkshopStats(workshopId: string | undefined) {
  return useQuery({
    queryKey: workshopId ? workshopKeys.stats(workshopId) : [],
    queryFn: async () => {
      if (!workshopId) throw new Error('Workshop ID required');

      const response = await workshopApi.getStats(workshopId);

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data!;
    },
    enabled: !!workshopId,
    refetchInterval: 5000, // Auto-refresh every 5s
  });
}

// =============================================================================
// Create Workshop
// =============================================================================

export function useCreateWorkshop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWorkshopRequest) => {
      const response = await workshopApi.create(data);

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data!;
    },
    onSuccess: () => {
      // Invalidate workshop lists to refetch
      queryClient.invalidateQueries({ queryKey: workshopKeys.lists() });
    },
  });
}

// =============================================================================
// Delete Workshop
// =============================================================================

export function useDeleteWorkshop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workshopId: string) => {
      const response = await workshopApi.delete(workshopId);

      if (response.error) {
        throw new Error(response.error.message);
      }

      return workshopId;
    },
    onSuccess: (workshopId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: workshopKeys.detail(workshopId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: workshopKeys.lists() });
    },
  });
}

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Get active workshop (highest phase, most recent)
 */
export function useActiveWorkshop() {
  const { data: workshops, ...query } = useWorkshops({
    status: 'active',
    limit: 1,
  });

  return {
    ...query,
    workshop: workshops?.[0],
  };
}

/**
 * Get completed workshops count
 */
export function useCompletedWorkshopsCount() {
  const { data: workshops } = useWorkshops({
    status: 'completed',
  });

  return workshops?.length ?? 0;
}