/**
 * Workshop Types - Définitions TypeScript complètes
 */

// ============================================================================
// Workshop
// ============================================================================

export interface WorkshopConfig {
  nb_agents: number;
  target_ideas_count: number;
  enabled_techniques: Record<string, string[]>;
  agent_personalities?: string[];
}

export interface Workshop {
  id: string;
  user_id: string;
  account_id?: string;
  title: string;
  initial_problem: string;
  config: WorkshopConfig;
  current_phase: number; // 0-6
  phase_data: Record<string, any>;
  status: WorkshopStatus;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

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

// ============================================================================
// Agent
// ============================================================================

export enum AgentPersonality {
  CREATIVE = 'creative',
  PRAGMATIC = 'pragmatic',
  TECHNICAL = 'technical',
  EMPATHETIC = 'empathetic',
  CRITIC = 'critic',
  FACILITATOR = 'facilitator',
}

export interface WorkshopAgent {
  id: string;
  workshop_id: string;
  personality: AgentPersonality;
  display_name: string;
  avatar_emoji: string;
  system_prompt: string;
  metadata: {
    description: string;
    strengths: string[];
    style: string;
    color: string;
  };
  contributions_count: number;
  total_tokens_used: number;
  position: number;
  is_active: boolean;
  created_at: string;
}

// ============================================================================
// Message
// ============================================================================

export enum MessageType {
  AGENT_CONTRIBUTION = 'agent_contribution',
  USER_MESSAGE = 'user_message',
  USER_FEEDBACK = 'user_feedback',
  SYSTEM_NOTIFICATION = 'system_notification',
  PHASE_TRANSITION = 'phase_transition',
  AGENT_RESPONSE = 'agent_response',
}

export interface WorkshopMessage {
  id: string;
  workshop_id: string;
  agent_id?: string;
  user_id?: string;
  phase: number;
  message_type: MessageType;
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// ============================================================================
// Idea
// ============================================================================

export enum IdeaTechnique {
  SCAMPER = 'scamper',
  RANDOM_WORD = 'random_word',
  WORST_IDEA = 'worst_idea',
  USER_INPUT = 'user_input',
  OTHER = 'other',
}

export interface WorkshopIdea {
  id: string;
  workshop_id: string;
  agent_id?: string;
  title: string;
  description: string;
  technique: IdeaTechnique;
  raw_score: number;
  votes_count: number;
  status: IdeaStatus;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export enum IdeaStatus {
  GENERATED = 'generated',
  SELECTED = 'selected',
  REJECTED = 'rejected',
  IN_PROGRESS = 'in_progress',
}

// ============================================================================
// Vote
// ============================================================================

export enum VoteType {
  DOT_VOTING = 'dot_voting',
  NOW_HOW_WOW = 'now_how_wow',
  IMPACT_EFFORT = 'impact_effort',
}

export interface WorkshopVote {
  id: string;
  workshop_id: string;
  idea_id: string;
  voter_id: string;
  voter_type: 'agent' | 'user';
  vote_type: VoteType;
  value: any; // Flexible selon type de vote
  created_at: string;
}

// ============================================================================
// Phase Data Structures
// ============================================================================

export interface Phase1Data {
  empathy_maps: {
    segment: string;
    says: string[];
    thinks: string[];
    does: string[];
    feels: string[];
  }[];
  customer_journey?: {
    stages: string[];
    touchpoints: string[];
  };
  hmw_questions: string[];
  problem_statement_validated: string;
}

export interface Phase2Data {
  ideas_generated: WorkshopIdea[];
  techniques_used: IdeaTechnique[];
  agent_contributions: Record<string, number>; // agent_id -> count
}

export interface Phase3Data {
  selected_ideas: string[]; // idea_ids
  voting_results: Record<string, any>;
  matrices: {
    impact_effort: Record<string, { impact: number; effort: number }>;
    now_how_wow: Record<string, string>; // idea_id -> category
  };
}

export interface Phase4Data {
  triz_analysis: {
    idea_id: string;
    contradictions: any[];
    principles_applied: string[];
    enriched_solution: string;
  }[];
}

export interface Phase5Data {
  selected_concept: {
    idea_id: string;
    title: string;
    final_description: string;
  };
  assumptions_mapping: {
    assumption: string;
    criticality: 'high' | 'medium' | 'low';
    test_method: string;
  }[];
  cahier_de_charge_url?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  detail: string;
  status: number;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

// ============================================================================
// Request Types
// ============================================================================

export interface CreateWorkshopRequest {
  title: string;
  initial_problem: string;
  config: {
    nb_agents: number;
    target_ideas_count: number;
    enabled_techniques: Record<string, string[]>;
    agent_personalities: string[];
  };
}

export interface CreateIdeaRequest {
  title: string;
  description: string;
  technique: IdeaTechnique;
  phase: number;
}

export interface CastVoteRequest {
  idea_id: string;
  vote_type: VoteType;
  value: any;
}

export interface SendMessageRequest {
  content: string;
  message_type: MessageType;
  phase: number;
}
