/**
 * API Client - Workshop Module
 * Utilitaire pour les appels API vers le backend generative-designer
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_GENERATIVE_DESIGNER_API_URL || '/api/generative-designer';

interface FetchOptions extends RequestInit {
  throwOnError?: boolean;
}

async function apiCall<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { throwOnError = true, ...fetchOptions } = options;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (throwOnError) {
      throw error;
    }
    console.error('API call failed:', error);
    return null as T;
  }
}

// ============================================================================
// Workshop APIs
// ============================================================================

export const workshopApi = {
  // Create Workshop
  create: (data: {
    title: string;
    initial_problem: string;
    config: {
      nb_agents: number;
      target_ideas_count: number;
      enabled_techniques: Record<string, string[]>;
      agent_personalities: string[];
    };
  }) =>
    apiCall('/workshops', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get Workshop
  get: (id: string) => apiCall(`/workshops/${id}`),

  // Get All Workshops for User
  list: () => apiCall('/workshops'),

  // Update Workshop
  update: (id: string, data: Record<string, any>) =>
    apiCall(`/workshops/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Delete Workshop
  delete: (id: string) =>
    apiCall(`/workshops/${id}`, {
      method: 'DELETE',
    }),

  // Export Workshop
  export: (id: string) => apiCall(`/workshops/${id}/export`),
};

// ============================================================================
// Agent APIs
// ============================================================================

export const agentApi = {
  // Get Workshop Agents
  list: (workshopId: string) =>
    apiCall(`/workshops/${workshopId}/agents`),

  // Add Agent to Workshop
  add: (workshopId: string, personality: string) =>
    apiCall(`/workshops/${workshopId}/agents`, {
      method: 'POST',
      body: JSON.stringify({ personality }),
    }),

  // Remove Agent
  remove: (workshopId: string, agentId: string) =>
    apiCall(`/workshops/${workshopId}/agents/${agentId}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// Phase APIs
// ============================================================================

export const phaseApi = {
  // Start Phase
  start: (workshopId: string, phase: number) =>
    apiCall(`/workshops/${workshopId}/phases/${phase}/start`, {
      method: 'POST',
    }),

  // Get Phase Status
  getStatus: (workshopId: string, phase: number) =>
    apiCall(`/workshops/${workshopId}/phases/${phase}/status`),

  // Complete Phase
  complete: (workshopId: string, phase: number, data: Record<string, any>) =>
    apiCall(`/workshops/${workshopId}/phases/${phase}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get Phase Data
  getData: (workshopId: string, phase: number) =>
    apiCall(`/workshops/${workshopId}/phases/${phase}/data`),

  // Save Phase Data
  saveData: (workshopId: string, phase: number, data: Record<string, any>) =>
    apiCall(`/workshops/${workshopId}/phases/${phase}/data`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ============================================================================
// Message APIs (Chat)
// ============================================================================

export const messageApi = {
  // Get Messages by Phase
  listByPhase: (workshopId: string, phase: number) =>
    apiCall(`/workshops/${workshopId}/messages?phase=${phase}`),

  // Get All Messages
  list: (workshopId: string) =>
    apiCall(`/workshops/${workshopId}/messages`),

  // Send Message
  send: (
    workshopId: string,
    content: string,
    type: 'user_message' | 'user_feedback',
    phase: number
  ) =>
    apiCall(`/workshops/${workshopId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        message_type: type,
        phase,
      }),
    }),

  // Stream Agent Response (SSE)
  streamAgentResponse: (workshopId: string, topic: string) => {
    const eventSource = new EventSource(
      `${API_BASE_URL}/workshops/${workshopId}/stream?topic=${encodeURIComponent(topic)}`
    );
    return eventSource;
  },
};

// ============================================================================
// Idea APIs
// ============================================================================

export const ideaApi = {
  // Generate Ideas
  generate: (workshopId: string, technique: string, phase: number) =>
    apiCall(`/workshops/${workshopId}/ideas/generate`, {
      method: 'POST',
      body: JSON.stringify({ technique, phase }),
    }),

  // Get Ideas
  list: (workshopId: string, phase?: number) => {
    const query = phase ? `?phase=${phase}` : '';
    return apiCall(`/workshops/${workshopId}/ideas${query}`);
  },

  // Add Manual Idea
  add: (workshopId: string, title: string, content: string, phase: number) =>
    apiCall(`/workshops/${workshopId}/ideas`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        description: content,
        technique: 'user_input',
        phase,
      }),
    }),

  // Update Idea
  update: (workshopId: string, ideaId: string, data: Record<string, any>) =>
    apiCall(`/workshops/${workshopId}/ideas/${ideaId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Delete Idea
  delete: (workshopId: string, ideaId: string) =>
    apiCall(`/workshops/${workshopId}/ideas/${ideaId}`, {
      method: 'DELETE',
    }),

  // Get Top Ideas
  getTop: (workshopId: string, limit: number = 5) =>
    apiCall(`/workshops/${workshopId}/ideas/top?limit=${limit}`),
};

// ============================================================================
// Vote APIs
// ============================================================================

export const voteApi = {
  // Cast Vote
  cast: (
    workshopId: string,
    ideaId: string,
    voteType: 'dot_voting' | 'now_how_wow' | 'impact_effort',
    value: any
  ) =>
    apiCall(`/workshops/${workshopId}/votes`, {
      method: 'POST',
      body: JSON.stringify({
        idea_id: ideaId,
        vote_type: voteType,
        value,
      }),
    }),

  // Get Vote Summary
  getSummary: (workshopId: string, voteType?: string) => {
    const query = voteType ? `?vote_type=${voteType}` : '';
    return apiCall(`/workshops/${workshopId}/votes/summary${query}`);
  },

  // Get Votes for Idea
  getForIdea: (workshopId: string, ideaId: string) =>
    apiCall(`/workshops/${workshopId}/votes?idea_id=${ideaId}`),
};

// ============================================================================
// Ideation APIs (Legacy v1.0)
// ============================================================================

export const ideationApi = {
  // Create Ideation
  create: (data: Record<string, any>) =>
    apiCall('/ideations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get Ideation
  get: (id: string) => apiCall(`/ideations/${id}`),

  // Chat
  chat: (ideationId: string, message: string) =>
    apiCall('/ideation/chat', {
      method: 'POST',
      body: JSON.stringify({
        ideation_id: ideationId,
        message,
      }),
    }),

  // Generate TRIZ Analysis
  generateTRIZ: (ideationId: string) =>
    apiCall(`/ideations/${ideationId}/generate-triz`, {
      method: 'POST',
    }),

  // Generate Cahier de Charge
  generateCahier: (ideationId: string, ideaTitle: string) =>
    apiCall(`/ideations/${ideationId}/generate-cahier`, {
      method: 'POST',
      body: JSON.stringify({ idea_title: ideaTitle }),
    }),
};

// ============================================================================
// Export for easy imports
// ============================================================================

export const generativeDesignerApi = {
  workshop: workshopApi,
  agent: agentApi,
  phase: phaseApi,
  message: messageApi,
  idea: ideaApi,
  vote: voteApi,
  ideation: ideationApi,
};
