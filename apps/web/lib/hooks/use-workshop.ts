/**
 * Custom Hook - useWorkshop
 * Gestion complète de l'état et données du workshop
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { generativeDesignerApi } from '~/lib/api/generative-designer';

interface Workshop {
  id: string;
  title: string;
  initial_problem: string;
  current_phase: number;
  status: string;
  phase_data: Record<string, any>;
  created_at: string;
  completed_at?: string;
}

interface Agent {
  id: string;
  personality: string;
  display_name: string;
  contributions_count: number;
  total_tokens_used: number;
  is_active: boolean;
}

interface UseWorkshopOptions {
  workshopId?: string;
  autoFetch?: boolean;
}

export const useWorkshop = (options: UseWorkshopOptions = {}) => {
  const { workshopId, autoFetch = true } = options;

  // State
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch workshop data
  const fetchWorkshop = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const [workshopData, agentsData] = await Promise.all([
        generativeDesignerApi.workshop.get(id),
        generativeDesignerApi.agent.list(id),
      ]);
      setWorkshop(workshopData);
      setAgents(agentsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && workshopId) {
      fetchWorkshop(workshopId);
    }
  }, [workshopId, autoFetch, fetchWorkshop]);

  // Update workshop
  const updateWorkshop = useCallback(
    async (data: Partial<Workshop>) => {
      if (!workshop) return;
      try {
        const updated = await generativeDesignerApi.workshop.update(workshop.id, data);
        setWorkshop(updated);
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      }
    },
    [workshop]
  );

  // Move to next phase
  const nextPhase = useCallback(async () => {
    if (!workshop) return;
    const nextPhaseNum = workshop.current_phase + 1;
    if (nextPhaseNum <= 6) {
      await updateWorkshop({ current_phase: nextPhaseNum });
    }
  }, [workshop, updateWorkshop]);

  // Move to previous phase
  const previousPhase = useCallback(async () => {
    if (!workshop) return;
    const prevPhaseNum = workshop.current_phase - 1;
    if (prevPhaseNum >= 1) {
      await updateWorkshop({ current_phase: prevPhaseNum });
    }
  }, [workshop, updateWorkshop]);

  // Jump to phase
  const jumpToPhase = useCallback(
    async (phase: number) => {
      if (!workshop || phase < 1 || phase > 6) return;
      await updateWorkshop({ current_phase: phase });
    },
    [workshop, updateWorkshop]
  );

  // Save phase data
  const savePhaseData = useCallback(
    async (phase: number, data: Record<string, any>) => {
      if (!workshop) return;
      try {
        await generativeDesignerApi.phase.saveData(workshop.id, phase, data);
        setWorkshop((prev) =>
          prev
            ? {
                ...prev,
                phase_data: {
                  ...prev.phase_data,
                  [`phase${phase}`]: data,
                },
              }
            : null
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
      }
    },
    [workshop]
  );

  // Get phase data
  const getPhaseData = useCallback(
    (phase: number) => {
      if (!workshop) return null;
      return workshop.phase_data[`phase${phase}`] || null;
    },
    [workshop]
  );

  // Complete phase
  const completePhase = useCallback(
    async (phase: number, data?: Record<string, any>) => {
      if (!workshop) return;
      try {
        if (data) {
          await savePhaseData(phase, data);
        }
        // Update status
        const newStatus = `phase${phase}_complete`;
        await updateWorkshop({ status: newStatus });
        // Move to next phase
        if (phase < 6) {
          await nextPhase();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la complétion');
      }
    },
    [workshop, savePhaseData, updateWorkshop, nextPhase]
  );

  return {
    // State
    workshop,
    agents,
    isLoading,
    error,

    // Actions
    fetchWorkshop,
    updateWorkshop,
    nextPhase,
    previousPhase,
    jumpToPhase,
    savePhaseData,
    getPhaseData,
    completePhase,
  };
};

// ============================================================================
// Hook pour la gestion des idées
// ============================================================================

interface Idea {
  id: string;
  title: string;
  content: string;
  technique: string;
  agent_name: string;
  agent_personality: string;
}

export const useIdeas = (workshopId?: string) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch ideas
  const fetchIdeas = useCallback(
    async (phase?: number) => {
      if (!workshopId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await generativeDesignerApi.idea.list(workshopId, phase);
        setIdeas(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setIsLoading(false);
      }
    },
    [workshopId]
  );

  // Generate ideas
  const generateIdeas = useCallback(
    async (technique: string, phase: number) => {
      if (!workshopId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await generativeDesignerApi.idea.generate(workshopId, technique, phase);
        setIdeas((prev) => [...prev, ...(data || [])]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la génération');
      } finally {
        setIsLoading(false);
      }
    },
    [workshopId]
  );

  // Add manual idea
  const addIdea = useCallback(
    async (title: string, content: string, phase: number) => {
      if (!workshopId) return;
      try {
        const newIdea = await generativeDesignerApi.idea.add(workshopId, title, content, phase);
        setIdeas((prev) => [...prev, newIdea]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout');
      }
    },
    [workshopId]
  );

  // Delete idea
  const deleteIdea = useCallback(
    async (ideaId: string) => {
      if (!workshopId) return;
      try {
        await generativeDesignerApi.idea.delete(workshopId, ideaId);
        setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      }
    },
    [workshopId]
  );

  // Get top ideas
  const getTopIdeas = useCallback(
    async (limit = 5) => {
      if (!workshopId) return [];
      try {
        return await generativeDesignerApi.idea.getTop(workshopId, limit);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la récupération');
        return [];
      }
    },
    [workshopId]
  );

  return {
    ideas,
    isLoading,
    error,
    fetchIdeas,
    generateIdeas,
    addIdea,
    deleteIdea,
    getTopIdeas,
  };
};

// ============================================================================
// Hook pour les votes
// ============================================================================

export const useVotes = (workshopId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cast vote
  const castVote = useCallback(
    async (ideaId: string, voteType: string, value: any) => {
      if (!workshopId) return;
      setIsLoading(true);
      setError(null);
      try {
        await generativeDesignerApi.vote.cast(workshopId, ideaId, voteType as any, value);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du vote');
      } finally {
        setIsLoading(false);
      }
    },
    [workshopId]
  );

  // Get vote summary
  const getSummary = useCallback(
    async (voteType?: string) => {
      if (!workshopId) return null;
      try {
        return await generativeDesignerApi.vote.getSummary(workshopId, voteType);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la récupération');
        return null;
      }
    },
    [workshopId]
  );

  return {
    isLoading,
    error,
    castVote,
    getSummary,
  };
};

// ============================================================================
// Hook pour les messages
// ============================================================================

interface Message {
  id: string;
  type: 'agent' | 'user' | 'system';
  agent_name?: string;
  agent_personality?: string;
  content: string;
  timestamp: Date;
}

export const useMessages = (workshopId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch messages
  const fetchMessages = useCallback(
    async (phase?: number) => {
      if (!workshopId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = phase
          ? await generativeDesignerApi.message.listByPhase(workshopId, phase)
          : await generativeDesignerApi.message.list(workshopId);
        setMessages(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setIsLoading(false);
      }
    },
    [workshopId]
  );

  // Send message
  const sendMessage = useCallback(
    async (content: string, type: 'user_message' | 'user_feedback', phase: number) => {
      if (!workshopId) return;
      try {
        await generativeDesignerApi.message.send(workshopId, content, type, phase);
        // Re-fetch messages
        await fetchMessages(phase);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
      }
    },
    [workshopId, fetchMessages]
  );

  return {
    messages,
    isLoading,
    error,
    fetchMessages,
    sendMessage,
  };
};
