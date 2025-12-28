/**
 * Workshop API Client
 * Centralized API calls for workshop pages
 */

const API_BASE = '/api/generative-designer';

interface ApiResponse<T> {
  data?: T;
  error?: { message: string; code?: string };
  status: number;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        error: {
          message: data?.detail || data?.message || 'Request failed',
          code: data?.code,
        },
        status: response.status,
      };
    }

    return { data, status: response.status };
  } catch (err) {
    return {
      error: { message: err instanceof Error ? err.message : 'Network error' },
      status: 500,
    };
  }
}

// =============================================================================
// Workshop API
// =============================================================================

export const workshopApi = {
  // List all workshops
  list: (params?: { status?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    const query = searchParams.toString();
    return request(`/workshops${query ? `?${query}` : ''}`);
  },

  // Get workshop by ID
  get: (id: string) => request(`/workshops/${id}`),

  // Create workshop
  create: (data: {
    title: string;
    initial_problem: string;
    agent_personalities: string[];
    target_ideas_count: number;
  }) =>
    request('/workshops', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update workshop
  update: (id: string, data: Partial<{ title: string; initial_problem: string }>) =>
    request(`/workshops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete workshop
  delete: (id: string) =>
    request(`/workshops/${id}`, {
      method: 'DELETE',
    }),

  // Advance to next phase
  advancePhase: (id: string, targetPhase: number) =>
    request(`/workshops/${id}/phases/advance?target_phase=${targetPhase}`, {
      method: 'POST',
    }),

  // Get phase status
  getPhaseStatus: (id: string) => request(`/workshops/${id}/phases/status`),

  // Get workshop statistics
  getStats: (id: string) => request(`/workshops/${id}/stats`),
};

// =============================================================================
// Phase 1 API
// =============================================================================

export const phase1Api = {
  // Start empathy map analysis
  startEmpathyMap: (workshopId: string, persona: { description: string; context?: string; needs?: string[] }) =>
    request(`/workshops/${workshopId}/phase1/empathy-map`, {
      method: 'POST',
      body: JSON.stringify({ user_persona: persona }),
    }),

  // Get empathy map results
  getEmpathyMap: (workshopId: string) =>
    request(`/workshops/${workshopId}/phase1/empathy-map`),

  // Start customer journey analysis
  startCustomerJourney: (workshopId: string, context?: { product_type?: string; price_range?: string }) =>
    request(`/workshops/${workshopId}/phase1/customer-journey`, {
      method: 'POST',
      body: JSON.stringify({ journey_context: context || null }),
    }),

  // Get customer journey results
  getCustomerJourney: (workshopId: string) =>
    request(`/workshops/${workshopId}/phase1/customer-journey`),

  // Start HMW questions generation
  startHMW: (workshopId: string) =>
    request(`/workshops/${workshopId}/phase1/hmw`, {
      method: 'POST',
    }),

  // Get HMW questions
  getHMW: (workshopId: string) =>
    request(`/workshops/${workshopId}/phase1/hmw`),

  // Complete phase 1
  complete: (workshopId: string) =>
    request(`/workshops/${workshopId}/phase1/complete`, {
      method: 'POST',
    }),
};

// =============================================================================
// Phase 2 API
// =============================================================================

export const phase2Api = {
  // Start ideation
  startIdeation: (
    workshopId: string,
    params: {
      technique: 'scamper' | 'random_word' | 'worst_idea';
      mode: 'parallel' | 'sequence' | 'discussion';
      target_count?: number;
    }
  ) =>
    request(`/workshops/${workshopId}/phase2/generate`, {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  // Get ideas
  getIdeas: (workshopId: string) =>
    request(`/workshops/${workshopId}/phase2/ideas`),

  // Update idea
  updateIdea: (workshopId: string, ideaId: string, data: { title?: string; description?: string }) =>
    request(`/workshops/${workshopId}/phase2/ideas/${ideaId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete idea
  deleteIdea: (workshopId: string, ideaId: string) =>
    request(`/workshops/${workshopId}/phase2/ideas/${ideaId}`, {
      method: 'DELETE',
    }),

  // Complete phase 2
  complete: (workshopId: string) =>
    request(`/workshops/${workshopId}/phase2/complete`, {
      method: 'POST',
    }),
};

// =============================================================================
// Phase 3 API
// =============================================================================

export const phase3Api = {
  // Start voting (agents vote on ideas)
  startVoting: (
    workshopId: string,
    method: 'dot_voting' | 'now_how_wow' | 'impact_effort'
  ) =>
    request(`/workshops/${workshopId}/phase3/vote?vote_type=${method}`, {
      method: 'POST',
    }),

  // User vote
  userVote: (workshopId: string, ideaId: string, dots: number) =>
    request(`/workshops/${workshopId}/phase3/vote/user`, {
      method: 'POST',
      body: JSON.stringify({ idea_id: ideaId, dots }),
    }),

  // Get votes
  getVotes: (workshopId: string) =>
    request(`/workshops/${workshopId}/phase3/votes`),

  // Get voting results
  getResults: (workshopId: string) =>
    request(`/workshops/${workshopId}/phase3/results`),

  // Select top ideas for next phase
  selectTop: (workshopId: string, ideaIds: string[], count?: number) =>
    request(`/workshops/${workshopId}/phase3/select-top`, {
      method: 'POST',
      body: JSON.stringify({ idea_ids: ideaIds, top_count: count || 3 }),
    }),

  // Alias for selectTop (used in components)
  selectIdeas: (workshopId: string, ideaIds: string[]) =>
    request(`/workshops/${workshopId}/phase3/select-top`, {
      method: 'POST',
      body: JSON.stringify({ idea_ids: ideaIds, top_count: ideaIds.length }),
    }),

  // Get phase 3 summary (includes selected ideas)
  getSummary: (workshopId: string) =>
    request(`/workshops/${workshopId}/phase3/summary`),

  // Get selected ideas for next phases
  getSelectedIdeas: async (workshopId: string) => {
    const result = await request(`/workshops/${workshopId}/phase3/summary`);
    // Extract selected_ideas from summary response
    const data = result.data as { selected_ideas?: unknown[] } | undefined;
    if (data?.selected_ideas) {
      return { ...result, data: data.selected_ideas };
    }
    return result;
  },

  // Complete phase 3
  complete: (workshopId: string) =>
    request(`/workshops/${workshopId}/phase3/complete`, {
      method: 'POST',
    }),
};

// =============================================================================
// Phase 4 API
// =============================================================================

export const phase4Api = {
  // Start TRIZ analysis
  startAnalysis: (workshopId: string) =>
    request(`/workshops/${workshopId}/phase4/analyze`, {
      method: 'POST',
    }),

  // Alias for startAnalysis
  analyze: (workshopId: string) =>
    request(`/workshops/${workshopId}/phase4/analyze`, {
      method: 'POST',
    }),

  // Get TRIZ results for specific idea
  getIdeaResults: (workshopId: string, ideaId: string) =>
    request(`/workshops/${workshopId}/phase4/results/${ideaId}`),

  // Get all TRIZ results
  getResults: (workshopId: string) =>
    request(`/workshops/${workshopId}/phase4/results`),

  // Get summary
  getSummary: (workshopId: string) =>
    request(`/workshops/${workshopId}/phase4/summary`),

  // Complete phase 4
  complete: (workshopId: string) =>
    request(`/workshops/${workshopId}/phase4/complete`, {
      method: 'POST',
    }),
};

// =============================================================================
// Phase 5 API
// =============================================================================

export const phase5Api = {
  // Get review data (ideas comparison)
  getReview: (workshopId: string) =>
    request(`/workshops/${workshopId}/phase5/review`),

  // Select final idea
  selectFinal: (workshopId: string, ideaId: string, justification?: string) =>
    request(`/workshops/${workshopId}/phase5/select-final`, {
      method: 'POST',
      body: JSON.stringify({ idea_id: ideaId, justification }),
    }),

  // Generate cahier de charge
  generateCahier: (workshopId: string) =>
    request(`/workshops/${workshopId}/phase5/generate-cahier`, {
      method: 'POST',
    }),

  // Get summary
  getSummary: (workshopId: string) =>
    request(`/workshops/${workshopId}/phase5/summary`),

  // Download cahier de charge PDF
  downloadCahierCharge: async (workshopId: string) => {
    try {
      const response = await fetch(`${API_BASE}/workshops/${workshopId}/phase5/cahier/pdf`);
      if (!response.ok) {
        return { error: { message: 'Download failed' }, status: response.status };
      }
      const data = await response.blob();
      return { data, status: response.status };
    } catch (err) {
      return { error: { message: 'Network error' }, status: 500 };
    }
  },

  // Download PDF URL
  downloadPdf: (workshopId: string) => `${API_BASE}/workshops/${workshopId}/phase5/cahier/pdf`,

  // Complete phase 5
  complete: (workshopId: string) =>
    request(`/workshops/${workshopId}/phase5/complete`, {
      method: 'POST',
    }),
};

// =============================================================================
// SSE Stream
// =============================================================================

// All SSE event types from backend
const SSE_EVENT_TYPES = [
  'phase_started',
  'phase_completed',
  'agent_started',
  'agent_complete',
  'agent_completed',
  'empathy_contribution',
  'empathy_item',
  'idea_generated',
  'ideation_complete',
  'vote_cast',
  'voting_complete',
  'triz_started',
  'triz_contradiction',
  'triz_principle',
  'triz_analysis_complete',
  'selection_started',
  'final_idea_selected',
  'cahier_generated',
  'error',
  'heartbeat',
  'connected',
] as const;

export function createSSEStream(workshopId: string, onEvent: (event: any) => void) {
  const eventSource = new EventSource(`${API_BASE}/workshops/${workshopId}/stream`);

  // Listen for named events
  SSE_EVENT_TYPES.forEach((eventType) => {
    eventSource.addEventListener(eventType, (event: MessageEvent) => {
      try {
        // Skip if no data or undefined
        if (!event.data || event.data === 'undefined' || event.data === '') {
          console.log(`SSE ${eventType}: empty data, skipping`);
          return;
        }
        const data = JSON.parse(event.data);
        onEvent({ type: eventType, ...data });
      } catch (err) {
        console.warn(`Failed to parse SSE event ${eventType}:`, event.data, err);
      }
    });
  });

  // Fallback for generic messages
  eventSource.onmessage = (event) => {
    try {
      // Skip if no data or undefined
      if (!event.data || event.data === 'undefined' || event.data === '') {
        return;
      }
      const data = JSON.parse(event.data);
      onEvent(data);
    } catch (err) {
      console.warn('Failed to parse SSE generic event:', event.data, err);
    }
  };

  eventSource.onerror = (err) => {
    console.warn('SSE connection error:', err);
    // Don't spam error events - only notify once
  };

  eventSource.onopen = () => {
    console.log('SSE connection opened');
  };

  return () => eventSource.close();
}
