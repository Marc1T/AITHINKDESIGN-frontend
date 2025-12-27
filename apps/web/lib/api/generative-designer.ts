/**
 * API Client - Workshop Module
 * Utilitaire pour les appels API vers le backend generative-designer
 * 
 * Configuration:
 * Ajouter à .env.local:
 *   NEXT_PUBLIC_GENERATIVE_DESIGNER_API_URL=http://localhost:8000/api/generative-designer
 */

// Use `NEXT_PUBLIC_GENERATIVE_DESIGNER_API_URL` when provided, but prefer
// the Next.js proxy route for browser requests so the Supabase session
// (JWT) stored in cookies can be forwarded server-side.
const rawApiUrl = process.env.NEXT_PUBLIC_GENERATIVE_DESIGNER_API_URL;
let API_BASE_URL: string;

if (typeof window !== 'undefined' && rawApiUrl && rawApiUrl.startsWith('http')) {
  // In the browser, route through the Next proxy so the server can attach auth
  API_BASE_URL = '/api/generative-designer';
} else {
  // Server-side or no explicit raw URL: use the provided raw URL or fall back
  API_BASE_URL = rawApiUrl || 'http://localhost:8000/api/generative-designer';
}

interface FetchOptions extends RequestInit {
  throwOnError?: boolean;
  retries?: number;
}

interface ApiError {
  code: string;
  message: string;
  details?: string;
  status: number;
}

/**
 * Utility function to make API calls with error handling and retry logic
 */
async function apiCall<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<{ data?: T; error?: ApiError; status: number }> {
  const { throwOnError = true, retries = 2, ...fetchOptions } = options;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.debug(`[API] ${fetchOptions.method || 'GET'} ${url}`);
      // Inject Authorization header from cookies as fallback when proxy is not used
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers as Record<string, string> || {}),
      };

      try {
        if (typeof window !== 'undefined') {
          const cookieMap: Record<string, string> = {};
          document.cookie.split(/;\s*/).forEach(pair => {
            if (!pair) return;
            const idx = pair.indexOf('=');
            if (idx === -1) return;
            const name = pair.slice(0, idx);
            const value = pair.slice(idx + 1);
            cookieMap[name] = decodeURIComponent(value);
          });

          const candidate = Object.keys(cookieMap).find(k =>
            k === 'supabase.auth.token' ||
            k === 'supabase.session' ||
            /sb-.*-auth-token/.test(k) ||
            /supabase-.*-auth-token/.test(k)
          );

          if (candidate) {
            const raw = cookieMap[candidate];
            let token: string | undefined;
            if (raw && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(raw)) {
              token = raw;
            } else if (raw) {
              try {
                const parsed = JSON.parse(raw);
                token = parsed?.currentSession?.access_token || parsed?.access_token || parsed?.session?.access_token;
              } catch {
                const m = raw.match(/access_token=([^&;]+)/);
                if (m && m[1]) token = decodeURIComponent(m[1]);
              }
            }
            if (token) headers['Authorization'] = `Bearer ${token}`;
          }
        }
      } catch {}

      const response = await fetch(url, {
        headers,
        ...fetchOptions,
      });

      if (!response.ok) {
        // Try to parse JSON error body, fallback to text
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (e) {
          try {
            const text = await response.text();
            if (text) errorData = { message: text };
          } catch {
            errorData = {};
          }
        }

        const apiError: ApiError = {
          code: errorData.code || errorData.error?.code || 'UNKNOWN_ERROR',
          message: errorData.message || errorData.error?.message || errorData.detail || response.statusText,
          details: errorData.details || errorData.error?.details,
          status: response.status,
        };

        console.error(`[API Error] ${response.status}:`, apiError);

        // Throw a proper Error instance so callers get readable messages
        if (throwOnError) {
          const err = new Error(apiError.message);
          Object.assign(err, { code: apiError.code, details: apiError.details, status: apiError.status });
          throw err;
        }

        return { error: apiError, status: response.status };
      }

      const data = await response.json();
      console.debug(`[API Success]`, data);
      return { data, status: response.status };
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Retry on network errors, not on 4xx errors
      if (attempt < retries && lastError.message.includes('Failed to fetch')) {
        console.warn(`[API] Retrying... (attempt ${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
      
      if (throwOnError) {
        throw lastError;
      }
      
      return {
        error: {
          code: 'NETWORK_ERROR',
          message: lastError.message,
          status: 0,
        },
        status: 0,
      };
    }
  }
  
  if (throwOnError && lastError) {
    throw lastError;
  }
  
  return {
    error: {
      code: 'MAX_RETRIES_EXCEEDED',
      message: 'Failed to fetch after multiple retries',
      status: 0,
    },
    status: 0,
  };
}

// ============================================================================
// Workshop APIs
// ============================================================================

export const workshopApi = {
  // Create Workshop
  create: async (data: {
    title: string;
    initial_problem: string;
    agent_personalities: string[];
    target_ideas_count?: number;
  }) => {
    return apiCall('/workshops', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

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
  // Advance to a target phase (backend: /workshops/{id}/phases/advance?target_phase=)
  start: (workshopId: string, phase: number) =>
    apiCall(`/workshops/${workshopId}/phases/advance?target_phase=${phase}`, {
      method: 'POST',
    }),

  // Get Phase Status (backend: /workshops/{id}/phases/status)
  getStatus: (workshopId: string) =>
    apiCall(`/workshops/${workshopId}/phases/status`),

  // NOTE: These endpoints (/complete, /data) are not implemented in the backend
  // in the current API; keep stubs to avoid breaking callers but they map to
  // generic workshop endpoints and may need backend additions.
  complete: (workshopId: string, phase: number, data: Record<string, any>) =>
    apiCall(`/workshops/${workshopId}/phases/advance?target_phase=${phase}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getData: (workshopId: string, phase: number) =>
    apiCall(`/workshops/${workshopId}/phases/status`),

  saveData: (workshopId: string, phase: number, data: Record<string, any>) =>
    apiCall(`/workshops/${workshopId}`, {
      method: 'PATCH',
      body: JSON.stringify({ phase_data: { [`phase${phase}`]: data } }),
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
