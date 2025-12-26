/**
 * API Client for Generative Designer Workshop System
 * Uses fetch API with proper error handling and TypeScript types
 */

import type {
  ApiResponse,
  CreateWorkshopRequest,
  Workshop,
  WorkshopDetail,
  WorkshopResponse,
  Agent,
  Message,
  Idea,
  Vote,
  PhaseTransitionResponse,
} from '../types';

// =============================================================================
// Configuration
// =============================================================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_GENERATIVE_DESIGNER_API_URL ||
  '/api/generative-designer';

// =============================================================================
// Base Fetch Wrapper
// =============================================================================

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: {
          code: data.detail?.code || 'API_ERROR',
          message: data.detail?.message || data.detail || 'An error occurred',
          details: data.detail,
        },
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    return {
      error: {
        code: 'NETWORK_ERROR',
        message:
          error instanceof Error ? error.message : 'Network request failed',
      },
      status: 0,
    };
  }
}

// =============================================================================
// Workshop CRUD
// =============================================================================

export const workshopApi = {
  /**
   * Create a new workshop
   */
  create: async (
    data: CreateWorkshopRequest,
  ): Promise<ApiResponse<WorkshopResponse>> => {
    return fetchAPI<WorkshopResponse>('/workshops', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get workshop by ID
   */
  getById: async (id: string): Promise<ApiResponse<WorkshopDetail>> => {
    return fetchAPI<WorkshopDetail>(`/workshops/${id}`);
  },

  /**
   * List user's workshops
   */
  list: async (params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<WorkshopResponse[]>> => {
    const queryParams = new URLSearchParams();

    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    const endpoint = query ? `/workshops?${query}` : '/workshops';

    return fetchAPI<WorkshopResponse[]>(endpoint);
  },

  /**
   * Delete workshop
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return fetchAPI<void>(`/workshops/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get workshop statistics
   */
  getStats: async (id: string): Promise<ApiResponse<any>> => {
    return fetchAPI<any>(`/workshops/${id}/stats`);
  },
};

// =============================================================================
// Agents
// =============================================================================

export const agentApi = {
  /**
   * Get workshop agents
   */
  list: async (workshopId: string): Promise<ApiResponse<Agent[]>> => {
    return fetchAPI<Agent[]>(`/workshops/${workshopId}/agents`);
  },

  /**
   * Get agent statistics
   */
  getStats: async (workshopId: string): Promise<ApiResponse<any>> => {
    return fetchAPI<any>(`/workshops/${workshopId}/agents/stats`);
  },
};

// =============================================================================
// Phase Management
// =============================================================================

export const phaseApi = {
  /**
   * Advance to next phase
   */
  advance: async (
    workshopId: string,
    targetPhase: number,
  ): Promise<ApiResponse<PhaseTransitionResponse>> => {
    return fetchAPI<PhaseTransitionResponse>(
      `/workshops/${workshopId}/phases/advance?target_phase=${targetPhase}`,
      {
        method: 'POST',
      },
    );
  },

  /**
   * Get phase status
   */
  getStatus: async (workshopId: string): Promise<ApiResponse<any>> => {
    return fetchAPI<any>(`/workshops/${workshopId}/phases/status`);
  },
};

// =============================================================================
// Messages
// =============================================================================

export const messageApi = {
  /**
   * Get workshop messages
   */
  list: async (
    workshopId: string,
    params?: {
      phase?: number;
      limit?: number;
    },
  ): Promise<ApiResponse<Message[]>> => {
    const queryParams = new URLSearchParams();

    if (params?.phase !== undefined)
      queryParams.append('phase', params.phase.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    const endpoint = query
      ? `/workshops/${workshopId}/messages?${query}`
      : `/workshops/${workshopId}/messages`;

    return fetchAPI<Message[]>(endpoint);
  },
};

// =============================================================================
// Ideas (Phase 2)
// =============================================================================

export const ideaApi = {
  /**
   * Generate ideas
   */
  generate: async (
    workshopId: string,
    params: {
      technique: 'scamper' | 'random_word' | 'worst_idea';
      mode?: 'parallel' | 'sequence' | 'discussion';
    },
  ): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams({
      technique: params.technique,
      mode: params.mode || 'parallel',
    });

    return fetchAPI<any>(
      `/workshops/${workshopId}/phase2/generate?${queryParams.toString()}`,
      {
        method: 'POST',
      },
    );
  },

  /**
   * Get workshop ideas
   */
  list: async (
    workshopId: string,
    params?: {
      technique?: string;
      limit?: number;
    },
  ): Promise<ApiResponse<Idea[]>> => {
    const queryParams = new URLSearchParams();

    if (params?.technique) queryParams.append('technique', params.technique);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    const endpoint = query
      ? `/workshops/${workshopId}/phase2/ideas?${query}`
      : `/workshops/${workshopId}/phase2/ideas`;

    return fetchAPI<Idea[]>(endpoint);
  },

  /**
   * Get idea details
   */
  getById: async (
    workshopId: string,
    ideaId: string,
  ): Promise<ApiResponse<Idea>> => {
    return fetchAPI<Idea>(`/workshops/${workshopId}/phase2/ideas/${ideaId}`);
  },

  /**
   * Update idea
   */
  update: async (
    workshopId: string,
    ideaId: string,
    data: {
      title?: string;
      description?: string;
    },
  ): Promise<ApiResponse<Idea>> => {
    return fetchAPI<Idea>(
      `/workshops/${workshopId}/phase2/ideas/${ideaId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
  },

  /**
   * Delete idea
   */
  delete: async (
    workshopId: string,
    ideaId: string,
  ): Promise<ApiResponse<void>> => {
    return fetchAPI<void>(
      `/workshops/${workshopId}/phase2/ideas/${ideaId}`,
      {
        method: 'DELETE',
      },
    );
  },

  /**
   * Get phase 2 summary
   */
  getSummary: async (workshopId: string): Promise<ApiResponse<any>> => {
    return fetchAPI<any>(`/workshops/${workshopId}/phase2/summary`);
  },
};

// =============================================================================
// Voting (Phase 3)
// =============================================================================

export const voteApi = {
  /**
   * Initiate voting session
   */
  initiate: async (
    workshopId: string,
    voteType: 'dot_voting' | 'now_how_wow' | 'impact_effort',
  ): Promise<ApiResponse<any>> => {
    return fetchAPI<any>(
      `/workshops/${workshopId}/phase3/vote?vote_type=${voteType}`,
      {
        method: 'POST',
      },
    );
  },

  /**
   * Get voting results
   */
  getResults: async (
    workshopId: string,
    voteType: string,
  ): Promise<ApiResponse<any>> => {
    return fetchAPI<any>(
      `/workshops/${workshopId}/phase3/results?vote_type=${voteType}`,
    );
  },

  /**
   * Get votes summary
   */
  getSummary: async (workshopId: string): Promise<ApiResponse<any>> => {
    return fetchAPI<any>(`/workshops/${workshopId}/phase3/summary`);
  },
};

// =============================================================================
// Phase 1 - Empathy
// =============================================================================

export const empathyApi = {
  /**
   * Run empathy map
   */
  runEmpathyMap: async (
    workshopId: string,
    userPersona: any,
  ): Promise<ApiResponse<any>> => {
    return fetchAPI<any>(`/workshops/${workshopId}/phase1/empathy-map`, {
      method: 'POST',
      body: JSON.stringify({ user_persona: userPersona }),
    });
  },

  /**
   * Run customer journey
   */
  runCustomerJourney: async (workshopId: string): Promise<ApiResponse<any>> => {
    return fetchAPI<any>(`/workshops/${workshopId}/phase1/customer-journey`, {
      method: 'POST',
    });
  },

  /**
   * Generate HMW questions
   */
  generateHMW: async (workshopId: string): Promise<ApiResponse<any>> => {
    return fetchAPI<any>(`/workshops/${workshopId}/phase1/hmw`, {
      method: 'POST',
    });
  },

  /**
   * Get phase 1 summary
   */
  getSummary: async (workshopId: string): Promise<ApiResponse<any>> => {
    return fetchAPI<any>(`/workshops/${workshopId}/phase1/summary`);
  },

  /**
   * Complete phase 1
   */
  complete: async (workshopId: string): Promise<ApiResponse<any>> => {
    return fetchAPI<any>(`/workshops/${workshopId}/phase1/complete`, {
      method: 'POST',
    });
  },
};

// =============================================================================
// Phase 4 - TRIZ
// =============================================================================

export const trizApi = {
  /**
   * Analyze ideas with TRIZ
   */
  analyze: async (workshopId: string): Promise<ApiResponse<any>> => {
    return fetchAPI<any>(`/workshops/${workshopId}/phase4/analyze`, {
      method: 'POST',
    });
  },

  /**
   * Get TRIZ results
   */
  getResults: async (
    workshopId: string,
    ideaId?: string,
  ): Promise<ApiResponse<any>> => {
    const endpoint = ideaId
      ? `/workshops/${workshopId}/phase4/results/${ideaId}`
      : `/workshops/${workshopId}/phase4/results`;

    return fetchAPI<any>(endpoint);
  },
};

// =============================================================================
// Phase 5 - Selection
// =============================================================================

export const selectionApi = {
  /**
   * Review enriched ideas
   */
  review: async (workshopId: string): Promise<ApiResponse<any>> => {
    return fetchAPI<any>(`/workshops/${workshopId}/phase5/review`);
  },

  /**
   * Select final concept
   */
  selectFinal: async (
    workshopId: string,
    ideaId: string,
    justification?: string,
  ): Promise<ApiResponse<any>> => {
    return fetchAPI<any>(`/workshops/${workshopId}/phase5/select-final`, {
      method: 'POST',
      body: JSON.stringify({
        idea_id: ideaId,
        user_justification: justification,
      }),
    });
  },

  /**
   * Generate Cahier de Charge
   */
  generateCahier: async (workshopId: string): Promise<ApiResponse<any>> => {
    return fetchAPI<any>(`/workshops/${workshopId}/phase5/generate-cahier`, {
      method: 'POST',
    });
  },
};