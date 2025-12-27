// =============================================================================
// packages/features/generative-designer/src/lib/api-client.ts
// =============================================================================


import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type { AxiosRequestConfig } from 'axios';
import type {
  IdeationResponse,
  IdeationParameters,
  ChatMessage,
  ChatResponse,
  ConversationState,
  TRIZChatResponse,
  TRIZMessage,
} from '../types';

export class GenerativeDesignerAPI {
  private client: AxiosInstance;

  constructor(baseURL?: string) {
    const raw = baseURL || process.env.NEXT_PUBLIC_GENERATIVE_DESIGNER_API_URL || '/api/generative-designer';
    this.client = axios.create({
      baseURL: raw,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 60000, // 60s for LLM calls
    });

    // Add JWT token interceptor. Prefer server-side proxy; fallback to client-side
    // Supabase session token stored in `localStorage` under `supabase.auth.token`.
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      // If Authorization already present, respect it
      const headers = config.headers;
      if (headers && (headers.Authorization || headers.authorization)) return config;

      // Only run in browser
      if (typeof window === 'undefined') return config;

      try {
        // Parse cookies into map
        const cookies: Record<string, string> = {};
        document.cookie.split(/;\s*/).forEach((pair) => {
          if (!pair) return;
          const idx = pair.indexOf('=');
          if (idx === -1) return;
          const name = pair.slice(0, idx);
          const value = pair.slice(idx + 1);
          cookies[name] = decodeURIComponent(value);
        });

        // Candidate cookie keys used by Supabase libs
        const candidates = Object.keys(cookies).filter(k =>
          k === 'supabase.auth.token' ||
          k === 'supabase.session' ||
          /sb-.*-auth-token/.test(k) ||
          /supabase-.*-auth-token/.test(k)
        );

        let token: string | undefined;

        for (const key of candidates) {
          const raw = cookies[key];
          if (!raw) continue;

          // If value looks like a JWT, use directly
          if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(raw)) {
            token = raw;
            break;
          }

          try {
            const parsed = JSON.parse(raw);
            if (parsed?.access_token) {
              token = parsed.access_token;
              break;
            }
            if (parsed?.currentSession?.access_token) {
              token = parsed.currentSession.access_token;
              break;
            }
          } catch {
            // Not JSON or corrupt; skip
          }
        }

        if (token && headers) {
          headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.warn('[api-client] Could not extract JWT from cookies:', err);
      }
      return config;
    });
  }

  /**
   * Generic request helper with uniform error handling.
   * Returns { data?, error?, status }.
   */
  async request<T = any>(config: AxiosRequestConfig): Promise<{
    data?: T;
    error?: { message: string; code?: string; details?: any };
    status: number;
  }> {
    try {
      const response = await this.client.request<T>(config);
      return { data: response.data, status: response.status };
    } catch (err: any) {
      const status = err.response?.status || 500;
      const errorData = err.response?.data;
      const message = errorData?.detail || errorData?.message || err.message || 'Request failed';
      const code = errorData?.error?.code || errorData?.code;
      return { error: { message, code, details: errorData }, status };
    }
  }

  /**
   * Convenience methods for common HTTP verbs
   */
  get<T = any>(url: string, params?: Record<string, any>) {
    return this.request<T>({ method: 'GET', url, params });
  }

  post<T = any>(url: string, data?: any) {
    return this.request<T>({ method: 'POST', url, data });
  }

  patch<T = any>(url: string, data?: any) {
    return this.request<T>({ method: 'PATCH', url, data });
  }

  put<T = any>(url: string, data?: any) {
    return this.request<T>({ method: 'PUT', url, data });
  }

  del<T = any>(url: string) {
    return this.request<T>({ method: 'DELETE', url });
  }

  // ============================================================================
  // Workshop endpoints
  // ============================================================================
  workshopApi = {
    create: (data: any) => this.request({ method: 'POST', url: '/workshops', data }),
    list: (params?: { status?: string; limit?: number; offset?: number }) => 
      this.request({ method: 'GET', url: '/workshops', params }),
    get: (id: string) => this.request({ method: 'GET', url: `/workshops/${id}` }),
    getById: (id: string) => this.request({ method: 'GET', url: `/workshops/${id}` }),
    getStats: (id: string) => this.request({ method: 'GET', url: `/workshops/${id}/stats` }),
    update: (id: string, data: any) => this.request({ method: 'PUT', url: `/workshops/${id}`, data }),
    delete: (id: string) => this.request({ method: 'DELETE', url: `/workshops/${id}` }),
    stream: (id: string) => `/workshops/${id}/stream`,
    advancePhase: (id: string, targetPhase: number) => 
      this.request({ method: 'POST', url: `/workshops/${id}/phases/advance?target_phase=${targetPhase}` }),
    getPhaseStatus: (id: string) => this.request({ method: 'GET', url: `/workshops/${id}/phases/status` }),
  };

  // ============================================================================
  // Agent endpoints
  // ============================================================================
  agentApi = {
    list: (workshopId: string) => this.request({ method: 'GET', url: `/workshops/${workshopId}/agents` }),
    get: (workshopId: string, agentId: string) =>
      this.request({ method: 'GET', url: `/workshops/${workshopId}/agents/${agentId}` }),
    update: (workshopId: string, agentId: string, data: any) =>
      this.request({ method: 'PUT', url: `/workshops/${workshopId}/agents/${agentId}`, data }),
    getStats: (workshopId: string) =>
      this.request({ method: 'GET', url: `/workshops/${workshopId}/agents/stats` }),
  };

  // ============================================================================
  // Idea endpoints
  // ============================================================================
  ideaApi = {
    list: (workshopId: string) => this.request({ method: 'GET', url: `/workshops/${workshopId}/ideas` }),
    get: (workshopId: string, ideaId: string) =>
      this.request({ method: 'GET', url: `/workshops/${workshopId}/ideas/${ideaId}` }),
    update: (workshopId: string, ideaId: string, data: any) =>
      this.request({ method: 'PUT', url: `/workshops/${workshopId}/ideas/${ideaId}`, data }),
    delete: (workshopId: string, ideaId: string) =>
      this.request({ method: 'DELETE', url: `/workshops/${workshopId}/ideas/${ideaId}` }),
  };

  // ============================================================================
  // Phase endpoints
  // ============================================================================
  phaseApi = {
    list: (workshopId: string) => this.request({ method: 'GET', url: `/workshops/${workshopId}/phases` }),
    get: (workshopId: string, phaseId: string) =>
      this.request({ method: 'GET', url: `/workshops/${workshopId}/phases/${phaseId}` }),
    update: (workshopId: string, phaseId: string, data: any) =>
      this.request({ method: 'PUT', url: `/workshops/${workshopId}/phases/${phaseId}`, data }),
  };

  // ============================================================================
  // Vote endpoints
  // ============================================================================
  voteApi = {
    submit: (workshopId: string, data: any) =>
      this.request({ method: 'POST', url: `/workshops/${workshopId}/votes`, data }),
    list: (workshopId: string) => this.request({ method: 'GET', url: `/workshops/${workshopId}/votes` }),
  };

  // ============================================================================
  // TRIZ endpoints
  // ============================================================================
  trizApi = {
    analyze: (workshopId: string, ideaId: string, data: any) =>
      this.request({ method: 'POST', url: `/workshops/${workshopId}/ideas/${ideaId}/triz`, data }),
    getAnalysis: (workshopId: string, ideaId: string) =>
      this.request({ method: 'GET', url: `/workshops/${workshopId}/ideas/${ideaId}/triz` }),
  };

  // ============================================================================
  // Selection endpoints
  // ============================================================================
  selectionApi = {
    finalize: (workshopId: string, data: any) =>
      this.request({ method: 'POST', url: `/workshops/${workshopId}/selection`, data }),
    get: (workshopId: string) =>
      this.request({ method: 'GET', url: `/workshops/${workshopId}/selection` }),
  };

  // ============================================================================
  // Ideation endpoints (deprecated – use workshopApi)
  // ============================================================================
  async runIdeation(params: IdeationParameters): Promise<IdeationResponse> {
    const { data } = await this.client.post<IdeationResponse>("/ideation", params);
    return data;
  }

  async streamIdeation(params: IdeationParameters): Promise<ReadableStream> {
    const response = await fetch(`${this.client.defaults.baseURL}/ideation/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!response.body) throw new Error("Stream not available");
    return response.body;
  }

  // ============================================================================
  // Chat endpoints
  // ============================================================================
  async sendChatMessage(message: ChatMessage): Promise<ChatResponse> {
    const { data } = await this.client.post<ChatResponse>("/chat", message);
    return data;
  }

  async streamChatMessage(message: ChatMessage): Promise<ReadableStream> {
    const response = await fetch(`${this.client.defaults.baseURL}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    if (!response.body) throw new Error("Stream not available");
    return response.body;
  }

  async getConversationState(conversationId: string): Promise<ConversationState> {
    const { data } = await this.client.get<ConversationState>(`/chat/state/${conversationId}`);
    return data;
  }

  // ============================================================================
  // TRIZ Chat endpoints
  // ============================================================================
  async sendTRIZMessage(message: TRIZMessage): Promise<TRIZChatResponse> {
    const { data } = await this.client.post<TRIZChatResponse>("/triz/chat", message);
    return data;
  }

  async streamTRIZMessage(message: TRIZMessage): Promise<ReadableStream> {
    const response = await fetch(`${this.client.defaults.baseURL}/triz/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    if (!response.body) throw new Error("Stream not available");
    return response.body;
  }

  async getTRIZState(conversationId: string): Promise<ConversationState> {
    const { data } = await this.client.get<ConversationState>(`/triz/chat/state/${conversationId}`);
    return data;
  }
}

// Singleton instance
export const apiClient = new GenerativeDesignerAPI();

// Named exports for convenience
export const workshopApi = apiClient.workshopApi;
export const agentApi = apiClient.agentApi;
export const ideaApi = apiClient.ideaApi;
export const phaseApi = apiClient.phaseApi;
export const voteApi = apiClient.voteApi;
export const trizApi = apiClient.trizApi;
export const selectionApi = apiClient.selectionApi;
