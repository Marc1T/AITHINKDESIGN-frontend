/**
 * Types for Generative Designer feature
 */

// =============================================================================
// Enums
// =============================================================================

export type Material =
  | 'aluminum_6061'
  | 'abs'
  | 'pla'
  | 'steel_316l'
  | 'wood'
  | 'ceramic';

export type Process =
  | 'cnc_3axis'
  | 'fdm_3d'
  | 'injection_molding'
  | 'traditional_machining';

export type Objective =
  | 'minimize_cost'
  | 'maximize_strength'
  | 'optimize_aesthetic'
  | 'balance_all';

export type IdeationStatus = 'draft' | 'refined' | 'finalized' | 'archived';

export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

// =============================================================================
// API Models
// =============================================================================

export interface IdeationParameters {
  material: Material;
  process: Process;
  objective: Objective;
  max_load_n: number;
  max_dimensions_mm: [number, number, number];
}

export interface IdeationResponse {
  status: string;
  ideation_id: string;
  detailed_brief: string;
  parameters: IdeationParameters;
  processing_time_ms: number;
  input_image_url?: string;
}

export interface GenerationResponse {
  status: string;
  generation_id: string;
  estimated_time_seconds?: number;
}

export interface GenerationStatusResponse {
  generation_id: string;
  status: GenerationStatus;
  progress_percent: number;
  current_step?: string;
  estimated_time_remaining_seconds?: number;
  logs: string[];
  output_image_url?: string;
  output_svg_url?: string;
  output_pdf_url?: string;
  output_metadata?: Record<string, any>;
  error_message?: string;
}

// =============================================================================
// Chat Models
// =============================================================================

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ConversationState {
  stage: 'initial' | 'gathering' | 'clarifying' | 'ready';
  collected_info: Record<string, any>;
  messages_count: number;
  brief_ready: boolean;
}

export interface ChatResponse {
  bot_message: string;
  conversation_state: ConversationState;
  suggested_actions: string[];
  extracted_parameters?: IdeationParameters;
}

// =============================================================================
// UI State
// =============================================================================

export type DesignerMode = 'form' | 'chat';

export interface DesignerState {
  mode: DesignerMode;
  ideationId?: string;
  generationId?: string;
  isProcessing: boolean;
  error?: string;
}