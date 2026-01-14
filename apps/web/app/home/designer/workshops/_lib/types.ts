/**
 * Types for Workshop UI
 * Shared type definitions for workshop pages
 */

// =============================================================================
// Agent Types
// =============================================================================

export type AgentPersonalityId = 'creative' | 'pragmatic' | 'technical' | 'empathetic' | 'critical' | 'facilitator';

export interface AgentPersonality {
  id: string;
  name: string;
  icon: AgentPersonalityId; // Reference to icon key in icons.tsx
  description: string;
  color: string;
  colorClass: string;
  bgClass: string;
  strengths: string[];
}

export const AGENT_PERSONALITIES: Record<string, AgentPersonality> = {
  creative: {
    id: 'creative',
    name: 'Marie',
    icon: 'creative',
    description: 'Idées innovantes et créatives',
    color: 'rgb(236, 72, 153)', // pink-500
    colorClass: 'text-pink-500',
    bgClass: 'bg-pink-100 dark:bg-pink-900/30',
    strengths: ['Innovation', 'Originalité', 'Design'],
  },
  pragmatic: {
    id: 'pragmatic',
    name: 'Thomas',
    icon: 'pragmatic',
    description: 'Faisabilité pratique',
    color: 'rgb(59, 130, 246)', // blue-500
    colorClass: 'text-blue-500',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    strengths: ['Réalisme', 'Business', 'ROI'],
  },
  technical: {
    id: 'technical',
    name: 'Alex',
    icon: 'technical',
    description: 'Ingénierie technique',
    color: 'rgb(16, 185, 129)', // emerald-500
    colorClass: 'text-emerald-500',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    strengths: ['Technique', 'Faisabilité', 'Qualité'],
  },
  empathetic: {
    id: 'empathetic',
    name: 'Sophie',
    icon: 'empathetic',
    description: "Comprend l'utilisateur",
    color: 'rgb(245, 158, 11)', // amber-500
    colorClass: 'text-amber-500',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    strengths: ['UX', 'Empathie', 'Besoins'],
  },
  critical: {
    id: 'critical',
    name: 'Pierre',
    icon: 'critical',
    description: 'Analyse les risques',
    color: 'rgb(239, 68, 68)', // red-500
    colorClass: 'text-red-500',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    strengths: ['Analyse', 'Risques', 'Qualité'],
  },
  facilitator: {
    id: 'facilitator',
    name: 'Julie',
    icon: 'facilitator',
    description: 'Organise le workshop',
    color: 'rgb(139, 92, 246)', // violet-500
    colorClass: 'text-violet-500',
    bgClass: 'bg-violet-100 dark:bg-violet-900/30',
    strengths: ['Organisation', 'Synthèse', 'Facilitation'],
  },
};

// =============================================================================
// Workshop Types
// =============================================================================

export interface AgentProfile {
  id: string;
  personality: string;
  display_name: string;
  avatar_emoji?: string;
  avatar_url?: string;
  metadata?: Record<string, any>;
  contributions_count?: number;
  total_tokens_used?: number;
  position?: number;
  is_active?: boolean;
}

export interface Workshop {
  id: string;
  title: string;
  initial_problem: string;
  problem_description?: string;
  current_phase: number;
  status: WorkshopStatus;
  phase_data?: PhaseData;
  // For list endpoint (nb_agents only)
  nb_agents?: number;
  // For detail endpoint (full agent data)
  agents?: AgentProfile[];
  // Computed from agents - list of personality IDs for UI
  agent_personalities?: string[];
  config?: {
    nb_agents?: number;
    target_ideas_count?: number;
    enabled_techniques?: Record<string, string[]>;
  };
  target_ideas_count?: number;
  total_ideas?: number;
  duration?: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
}

export type WorkshopStatus = 
  | 'draft' 
  | 'active' 
  | 'completed' 
  | 'archived';

export interface PhaseData {
  phase0?: Phase0Data;
  phase1?: Phase1Data;
  phase2?: Phase2Data;
  phase3?: Phase3Data;
  phase4?: Phase4Data;
  phase5?: Phase5Data;
}

// =============================================================================
// Phase 0 - Setup
// =============================================================================

export interface Phase0Data {
  configured: boolean;
  agents_initialized: boolean;
}

// =============================================================================
// Phase 1 - Empathy
// =============================================================================

export interface Phase1Data {
  empathy_map: EmpathyMap;
  customer_journey: CustomerJourneyStep[];
  hmw_questions: HMWQuestion[];
  status: 'pending' | 'in_progress' | 'completed';
}

export interface EmpathyMap {
  says: EmpathyItem[];
  thinks: EmpathyItem[];
  does: EmpathyItem[];
  feels: EmpathyItem[];
}

export interface EmpathyItem {
  id: string;
  content: string;
  agent_id: string;
  created_at: string;
}

export interface CustomerJourneyStep {
  id: string;
  name: string;
  touchpoints: string[];
  emotions: string[];
  pain_points: string[];
}

export interface HMWQuestion {
  id: string;
  question: string;
  agent_ids: string[];
}

// =============================================================================
// Phase 2 - Ideation
// =============================================================================

export interface Phase2Data {
  technique: IdeationTechnique;
  mode: IdeationMode;
  ideas: Idea[];
  status: 'pending' | 'in_progress' | 'completed';
}

export type IdeationTechnique = 'scamper' | 'random_word' | 'worst_idea';
export type IdeationMode = 'parallel' | 'sequence' | 'discussion';

export interface Idea {
  id: string;
  title: string;
  description: string;
  agent_id: string;
  agent_name: string;
  technique: string;
  technique_detail?: string;
  votes_count: number;
  created_at: string;
  // TRIZ enrichment
  triz_enrichment?: string;
  triz_principles?: string[];
  // Worst Idea technique specifics
  worst_idea_original?: string;
  inversion_insight?: string;
  // SCAMPER specifics
  scamper_type?: string;
  // Random Word specifics
  random_word?: string;
  // General metadata
  metadata?: Record<string, any>;
}

// =============================================================================
// Phase 3 - Convergence
// =============================================================================

export interface Phase3Data {
  voting_method: VotingMethod;
  votes: Vote[];
  selected_ideas: string[];
  status: 'pending' | 'voting' | 'completed';
}

export type VotingMethod = 'dot_voting' | 'now_how_wow' | 'impact_effort';

export interface Vote {
  id: string;
  idea_id: string;
  agent_id: string;
  dots?: number;
  category?: 'now' | 'how' | 'wow';
  impact?: number;
  effort?: number;
}

// =============================================================================
// Phase 4 - TRIZ
// =============================================================================

export interface Phase4Data {
  analyses: TRIZAnalysis[];
  status: 'pending' | 'analyzing' | 'completed';
}

export interface TRIZAnalysis {
  idea_id: string;
  contradictions: TRIZContradiction[];
  principles: TRIZPrinciple[];
  enriched_brief: string;
  score: number;
}

export interface TRIZContradiction {
  id: string;
  name?: string;
  improving_parameter: string;
  worsening_parameter: string;
  description: string;
}

export interface TRIZPrinciple {
  number: number;
  name: string;
  description: string;
  application: string;
}

export interface TRIZAgentContribution {
  agent_id: string;
  contribution: string;
}

export interface TRIZAnalysis {
  idea_id: string;
  contradictions: TRIZContradiction[];
  principles: TRIZPrinciple[];
  enriched_brief: string;
  score: number;
  agent_contributions?: TRIZAgentContribution[];
}

// =============================================================================
// Phase 5 - Selection
// =============================================================================

export interface Phase5Data {
  selected_idea_id: string;
  justification: string;
  cahier_de_charge?: CahierDeCharge;
  status: 'pending' | 'generating' | 'completed';
}

export interface CahierDeCharge {
  id: string;
  title: string;
  content: string;
  context?: string;
  objectives?: string[];
  functional_specs?: string[];
  constraints?: string[];
  timeline?: string;
  budget?: string;
  parameters?: TechnicalParameters;
  pdf_url?: string;
  created_at: string;
}

export interface TechnicalParameters {
  material: string;
  process: string;
  max_load: number;
  dimensions: [number, number, number];
}

// =============================================================================
// SSE Event Types
// =============================================================================

export interface SSEEvent {
  type: SSEEventType;
  agent_id?: string;
  data: any;
  timestamp: string;
}

export type SSEEventType = 
  | 'phase_started'
  | 'agent_started'
  | 'agent_complete'
  | 'agent_completed'  // alias
  | 'agent_timeout'
  | 'agent_error'
  // Phase 1 - Empathy
  | 'empathy_contribution'
  | 'empathy_complete'
  | 'empathy_item'  // legacy
  | 'journey_stage'
  | 'journey_complete'
  | 'hmw_question'
  | 'hmw_complete'
  // Phase 2 - Ideation
  | 'idea_generated'
  | 'ideation_progress'
  | 'ideation_complete'
  // Phase 3 - Voting
  | 'vote_cast'
  | 'voting_progress'
  | 'voting_complete'
  // Phase 4 - TRIZ
  | 'triz_analysis'
  | 'triz_progress'
  | 'triz_complete'
  // Phase 5 - Selection
  | 'selection_complete'
  | 'cahier_charge_generated'
  // General
  | 'phase_completed'
  | 'workshop_completed'
  | 'error';

// =============================================================================
// Phase Configuration
// =============================================================================

export const PHASE_CONFIG = [
  { number: 0, name: 'Setup', icon: '⚙️', color: 'slate' },
  { number: 1, name: 'Empathy', icon: '🎭', color: 'pink' },
  { number: 2, name: 'Ideation', icon: '💡', color: 'amber' },
  { number: 3, name: 'Convergence', icon: '🗳️', color: 'blue' },
  { number: 4, name: 'TRIZ', icon: '🔧', color: 'emerald' },
  { number: 5, name: 'Selection', icon: '⭐', color: 'violet' },
];
