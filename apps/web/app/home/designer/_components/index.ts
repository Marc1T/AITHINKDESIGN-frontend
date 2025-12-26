/**
 * Workshop Components - Index
 * Export centralisé de tous les composants
 */

// Theme & Configuration
export { workshopTheme, agentPersonalities } from './workshop-theme';

// Core Components
export { PhaseProgress } from './phase-progress';
export { AgentCard } from './agent-card';
export { WorkshopSidebar } from './workshop-sidebar';
export { WorkshopHeader } from './workshop-header';
export { MultiAgentChat } from './multi-agent-chat';

// Phase Components
export { Phase1Empathy, type Phase1Data } from './phase-1-empathy';
export { Phase2Ideation } from './phase-2-ideation';
export { Phase3Convergence } from './phase-3-convergence';

// API Client
export * from '~/lib/api/generative-designer';
