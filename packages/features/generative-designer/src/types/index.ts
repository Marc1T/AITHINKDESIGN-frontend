// =============================================================================
// packages/features/generative-designer/src/types/index.ts
// =============================================================================

/**
 * Workshop Types - TypeScript definitions for Design Thinking workshops
 * Matches backend models from Python API
 */

// Re-export types from lib/types.ts for v1.0 compatibility
export type {
  Material,
  Process,
  Objective,
  IdeationStatus,
  GenerationStatus,
  IdeationParameters,
  IdeationResponse,
  GenerationResponse,
  GenerationStatusResponse,
  ChatMessage,
  ConversationState,
  ChatResponse,
  DesignerMode,
  DesignerState,
} from '../lib/types';

// =============================================================================
// TRIZ Types (for chat)
// =============================================================================

export interface TRIZMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface TRIZConversationState {
  stage: 'initial' | 'analyzing' | 'principles' | 'enrichment' | 'complete';
  contradictions: TRIZContradiction[];
  selected_principles: number[];
  enriched_brief?: string;
}

export interface TRIZContradiction {
  improving_parameter: string;
  worsening_parameter: string;
  description: string;
}

export interface TRIZAnalysis {
  contradictions: TRIZContradiction[];
  suggested_principles: TRIZPrinciple[];
  enriched_brief: string;
}

export interface TRIZPrinciple {
  number: number;
  name: string;
  description: string;
  application?: string;
}

export interface TRIZChatResponse {
  bot_message: string;
  conversation_state: TRIZConversationState;
  suggested_actions: string[];
  triz_analysis?: TRIZAnalysis;
  is_complete: boolean;
}

// =============================================================================
// Enums
// =============================================================================

export enum WorkshopStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PHASE1_COMPLETE = 'phase1_complete',
  PHASE2_COMPLETE = 'phase2_complete',
  PHASE3_COMPLETE = 'phase3_complete',
  PHASE4_COMPLETE = 'phase4_complete',
  PHASE5_COMPLETE = 'phase5_complete',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum AgentPersonality {
  CREATIVE = 'creative',
  PRAGMATIC = 'pragmatic',
  TECHNICAL = 'technical',
  EMPATHETIC = 'empathetic',
  CRITICAL = 'critical',
  FACILITATOR = 'facilitator',
}

export enum MessageType {
  SYSTEM = 'system',
  USER_MESSAGE = 'user_message',
  AGENT_RESPONSE = 'agent_response',
  AGENT_CONTRIBUTION = 'agent_contribution',
  PHASE_TRANSITION = 'phase_transition',
}

export enum IdeaTechnique {
  SCAMPER = 'scamper',
  RANDOM_WORD = 'random_word',
  WORST_IDEA = 'worst_idea',
}

export enum VoteType {
  DOT_VOTING = 'dot_voting',
  NOW_HOW_WOW = 'now_how_wow',
  IMPACT_EFFORT = 'impact_effort',
}

// =============================================================================
// Workshop Models
// =============================================================================

export interface Workshop {
  id: string;
  user_id: string;
  account_id: string | null;
  title: string;
  initial_problem: string;
  config: WorkshopConfig;
  current_phase: number;
  phase_data: PhaseData;
  status: WorkshopStatus;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface WorkshopConfig {
  nb_agents: number;
  target_ideas_count: number;
  enabled_techniques: {
    phase1: string[];
    phase2: string[];
    phase3: string[];
    phase4: string[];
    phase5: string[];
    phase6: string[];
  };
}

export interface PhaseData {
  phase1: Phase1Data;
  phase2: Phase2Data;
  phase3: Phase3Data;
  phase4: Phase4Data;
  phase5: Phase5Data;
  phase6: Phase6Data;
}

// Phase-specific data structures
export interface Phase1Data {
  empathy_map?: EmpathyMap;
  customer_journey?: CustomerJourney;
  hmw_questions?: string[];
  phase1_complete?: boolean;
}

export interface Phase2Data {
  ideas_generated?: number;
  techniques_used?: string[];
}

export interface Phase3Data {
  selected_ideas?: string[];
  voting_complete?: boolean;
}

export interface Phase4Data {
  triz_complete?: boolean;
  analyses?: Record<string, any>;
}

export interface Phase5Data {
  final_idea_id?: string;
  ideation_id?: string;
  cahier_pdf_url?: string;
}

export interface Phase6Data {
  prototype_url?: string;
  generation_id?: string;
}

// =============================================================================
// Agent Models
// =============================================================================

export interface Agent {
  id: string;
  workshop_id: string;
  personality: AgentPersonality;
  display_name: string;
  avatar_emoji: string;
  avatar_url: string | null;
  metadata: AgentMetadata;
  contributions_count: number;
  total_tokens_used: number;
  position: number;
  is_active: boolean;
  created_at: string;
}

export interface AgentMetadata {
  description: string;
  strengths: string[];
  style: string;
  color: string;
}

// =============================================================================
// Message Models
// =============================================================================

export interface Message {
  id: string;
  workshop_id: string;
  agent_id: string | null;
  user_id: string | null;
  phase: number;
  message_type: MessageType;
  content: string;
  metadata: Record<string, any>;
  created_at: string;
  agent_name?: string;
  agent_avatar?: string;
}

// =============================================================================
// Idea Models
// =============================================================================

export interface Idea {
  id: string;
  workshop_id: string;
  agent_id: string | null;
  title: string;
  description: string;
  technique: IdeaTechnique;
  raw_score: number;
  votes_count: number;
  status: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  agent_name?: string;
}

// =============================================================================
// Vote Models
// =============================================================================

export interface Vote {
  id: string;
  workshop_id: string;
  idea_id: string;
  voter_id: string | null;
  voter_type: string;
  vote_type: VoteType;
  value: VoteValue;
  created_at: string;
}

export type VoteValue =
  | { dots: number }
  | { category: 'now' | 'how' | 'wow' }
  | { impact: number; effort: number };

// =============================================================================
// Phase 1 Specific Models
// =============================================================================

export interface EmpathyMap {
  says: string[];
  thinks: string[];
  does: string[];
  feels: string[];
}

export interface CustomerJourney {
  stages: JourneyStage[];
}

export interface JourneyStage {
  name: string;
  touchpoints: string[];
  emotions: string[];
  pain_points: string[];
}

// =============================================================================
// API Request/Response Models
// =============================================================================

export interface CreateWorkshopRequest {
  title: string;
  initial_problem: string;
  agent_personalities: AgentPersonality[];
  target_ideas_count: number;
}

export interface WorkshopResponse {
  workshop_id: string;
  title: string;
  initial_problem: string;
  current_phase: number;
  status: WorkshopStatus;
  nb_agents: number;
  created_at: string;
}

export interface WorkshopDetail extends Workshop {
  agents: Agent[];
}

export interface PhaseTransitionResponse {
  workshop_id: string;
  previous_phase: number;
  current_phase: number;
  status: WorkshopStatus;
  message: string;
  next_actions: string[];
}

// =============================================================================
// Phase Info
// =============================================================================

export type WorkshopPhase = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface PhaseInfo {
  phase: WorkshopPhase;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const PHASE_INFO: Record<WorkshopPhase, PhaseInfo> = {
  0: {
    phase: 0,
    name: 'Setup',
    description: 'Configuration',
    icon: '⚙️',
    color: 'hsl(210, 40%, 50%)',
  },
  1: {
    phase: 1,
    name: 'Empathy',
    description: "Comprendre l'utilisateur",
    icon: '🎭',
    color: 'hsl(280, 70%, 60%)',
  },
  2: {
    phase: 2,
    name: 'Ideation',
    description: 'Générer des idées',
    icon: '💡',
    color: 'hsl(45, 90%, 55%)',
  },
  3: {
    phase: 3,
    name: 'Convergence',
    description: 'Sélectionner les meilleures',
    icon: '🗳️',
    color: 'hsl(217, 91%, 60%)',
  },
  4: {
    phase: 4,
    name: 'TRIZ',
    description: 'Résoudre les contradictions',
    icon: '🔧',
    color: 'hsl(142, 76%, 36%)',
  },
  5: {
    phase: 5,
    name: 'Selection',
    description: 'Choix final',
    icon: '⭐',
    color: 'hsl(33, 100%, 50%)',
  },
  6: {
    phase: 6,
    name: 'Prototype',
    description: 'Créer le prototype',
    icon: '🎨',
    color: 'hsl(330, 81%, 60%)',
  },
};

// =============================================================================
// Agent Colors
// =============================================================================

export const AGENT_COLORS: Record<AgentPersonality, string> = {
  [AgentPersonality.CREATIVE]: '#ec4899', // Rose
  [AgentPersonality.PRAGMATIC]: '#3b82f6', // Bleu
  [AgentPersonality.TECHNICAL]: '#10b981', // Vert
  [AgentPersonality.EMPATHETIC]: '#f59e0b', // Orange
  [AgentPersonality.CRITICAL]: '#ef4444', // Rouge
  [AgentPersonality.FACILITATOR]: '#8b5cf6', // Violet
};

export const AGENT_EMOJIS: Record<AgentPersonality, string> = {
  [AgentPersonality.CREATIVE]: '👩‍🎨',
  [AgentPersonality.PRAGMATIC]: '👨‍💼',
  [AgentPersonality.TECHNICAL]: '👨‍🔧',
  [AgentPersonality.EMPATHETIC]: '👩‍⚕️',
  [AgentPersonality.CRITICAL]: '🔍',
  [AgentPersonality.FACILITATOR]: '🎯',
};

// =============================================================================
// Utility Types
// =============================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: number;
}