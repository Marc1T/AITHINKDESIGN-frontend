// =============================================================================
// packages/features/generative-designer/src/lib/api-client.ts
// =============================================================================

import axios, { AxiosInstance } from "axios";
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

  constructor(baseURL: string = "/api/generative-designer") {
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 60000, // 60s for LLM calls
    });

    // Add JWT token interceptor
    this.client.interceptors.request.use((config) => {
      // Token will be added by Next.js middleware
      return config;
    });
  }

  // ========== Ideation Endpoints ==========
  
  async createIdeation(data: {
    prompt: string;
    image?: File;
  }): Promise<IdeationResponse> {
    const formData = new FormData();
    formData.append("prompt", data.prompt);
    if (data.image) {
      formData.append("image_file", data.image);
    }

    const response = await this.client.post<IdeationResponse>(
      "/ideations",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  }

  async getIdeation(ideationId: string) {
    const response = await this.client.get(`/ideations/${ideationId}`);
    return response.data;
  }

  async updateIdeation(
    ideationId: string,
    parameters: Partial<IdeationParameters>
  ) {
    const response = await this.client.patch(
      `/ideations/${ideationId}`,
      { parameters }
    );
    return response.data;
  }

  // ========== Chat Endpoints ==========
  
  async sendChatMessage(data: {
    message: string;
    conversation_history?: ChatMessage[];
    conversation_state?: ConversationState;
  }): Promise<ChatResponse> {
    const formData = new FormData();
    formData.append("message", data.message);
    
    if (data.conversation_history) {
      formData.append(
        "conversation_history",
        JSON.stringify(data.conversation_history)
      );
    }
    
    if (data.conversation_state) {
      formData.append(
        "conversation_state",
        JSON.stringify(data.conversation_state)
      );
    }

    const response = await this.client.post<ChatResponse>(
      "/ideation/chat",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  }

  async getChatWelcome() {
    const response = await this.client.get("/ideation/chat/welcome");
    return response.data;
  }

  // ========== TRIZ Endpoints ==========
  
  async sendTRIZMessage(data: {
    ideation_id: string;
    message: string;
    triz_history?: TRIZMessage[];
    triz_state?: any;
  }): Promise<TRIZChatResponse> {
    const formData = new FormData();
    formData.append("message", data.message);
    
    if (data.triz_history) {
      formData.append("triz_history", JSON.stringify(data.triz_history));
    }
    
    if (data.triz_state) {
      formData.append("triz_state", JSON.stringify(data.triz_state));
    }

    const response = await this.client.post<TRIZChatResponse>(
      `/ideations/${data.ideation_id}/triz/chat`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  }

  async getTRIZWelcome(ideationId: string) {
    const response = await this.client.get(`/ideations/${ideationId}/triz/welcome`);
    return response.data;
  }

  // ========== Document Generation ==========
  
  async generateCahierDeCharge(ideationId: string) {
    const response = await this.client.post(
      `/ideations/${ideationId}/generate-cahier`,
      {},
      {
        responseType: "blob", // PDF response
      }
    );
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `cahier-de-charge-${ideationId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true };
  }
}

// Export singleton instance
export const apiClient = new GenerativeDesignerAPI();
