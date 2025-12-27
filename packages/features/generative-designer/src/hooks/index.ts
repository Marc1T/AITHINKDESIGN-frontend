/**
 * Hooks exports - Custom React hooks for Generative Designer
 */

// Workshop hooks
export {
  useWorkshops,
  useWorkshop,
  useWorkshopStats,
  useCreateWorkshop,
  useDeleteWorkshop,
  useActiveWorkshop,
  useCompletedWorkshopsCount,
  workshopKeys,
} from './use-workshops';

export type { UseWorkshopsOptions } from './use-workshops';

// Agent hooks
export {
  useAgents,
  useAgentStats,
  agentKeys,
} from './use-agents';

// Phase hooks
export {
  useAdvancePhase,
  usePhaseStatus,
  phaseKeys,
} from './use-phases';

// Ideas hooks (Phase 2)
export {
  useIdeas,
  useIdea,
  useGenerateIdeas,
  useUpdateIdea,
  useDeleteIdea,
  useIdeaSummary,
  ideaKeys,
} from './use-ideas';

// Vote hooks (Phase 3)
export {
  useInitiateVoting,
  useVoteResults,
  useVoteSummary,
  voteKeys,
} from './use-votes';

// Empathy hooks (Phase 1)
export {
  useRunEmpathyMap,
  useRunCustomerJourney,
  useGenerateHMW,
  usePhase1Summary,
  useCompletePhase1,
  empathyKeys,
} from './use-empathy';

// TRIZ hooks (Phase 4)
export {
  useTRIZ,
} from './use-triz';

// Selection hooks (Phase 5)
export {
  useReviewIdeas,
  useSelectFinal,
  useGenerateCahier,
  selectionKeys,
} from './use-selection';