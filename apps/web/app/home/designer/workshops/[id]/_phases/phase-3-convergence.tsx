/**
 * Phase 3 - Convergence
 * Voting on ideas with different methods
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Badge } from '@kit/ui/badge';
import { cn } from '@kit/ui/utils';
import { AGENT_PERSONALITIES, type Workshop, type SSEEvent, type Idea, type VotingMethod, type Vote } from '../../_lib/types';
import { phase2Api, phase3Api } from '../../_lib/api';
import { IdeaCardCompact } from '../../_components/idea-card';

interface Phase3Props {
  workshop: Workshop;
  workshopId: string;
  onAdvancePhase: (phase: number) => void;
  isAdvancing: boolean;
  sseEvents: SSEEvent[];
  refetch: () => void;
}

interface VotingMethodOption {
  id: VotingMethod;
  name: string;
  icon: string;
  description: string;
  recommended?: boolean;
}

const VOTING_METHODS: VotingMethodOption[] = [
  {
    id: 'dot_voting',
    name: 'Dot Voting',
    icon: '🔵',
    description: 'Chaque agent distribue 3 points sur les idées',
    recommended: true,
  },
  {
    id: 'now_how_wow',
    name: 'Now-How-Wow Matrix',
    icon: '📊',
    description: 'Catégorise: NOW (quick wins), HOW (à creuser), WOW (jackpot)',
  },
  {
    id: 'impact_effort',
    name: 'Impact/Effort Matrix',
    icon: '📈',
    description: 'Note chaque idée sur Impact (1-10) et Effort (1-10)',
  },
];

export default function Phase3Convergence({
  workshop,
  workshopId,
  onAdvancePhase,
  isAdvancing,
  sseEvents,
}: Phase3Props) {
  const [votingMethod, setVotingMethod] = useState<VotingMethod>('dot_voting');
  const [isVoting, setIsVoting] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [agentProgress, setAgentProgress] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<'method' | 'voting' | 'selection'>('method');

  // Load ideas on mount
  useEffect(() => {
    loadIdeas();
  }, [workshopId]);

  const loadIdeas = async () => {
    try {
      const result = await phase2Api.getIdeas(workshopId);
      if (result.data) {
        setIdeas(result.data as Idea[]);
      }
    } catch (err) {
      console.error('Failed to load ideas:', err);
    }
  };

  // Process SSE events - process ALL new events, not just the last one
  const [processedEventCount, setProcessedEventCount] = useState(0);
  const [votingCompleteReceived, setVotingCompleteReceived] = useState(false);
  
  useEffect(() => {
    // Process only new events since last processed
    const newEvents = sseEvents.slice(processedEventCount);
    if (newEvents.length === 0) return;

    newEvents.forEach((event) => {
      switch (event.type) {
        case 'agent_started':
          if (event.agent_id) {
            setAgentProgress((prev) => ({ ...prev, [event.agent_id!]: 'voting' }));
          }
          break;
        case 'agent_complete':
        case 'agent_completed':
          if (event.agent_id) {
            setAgentProgress((prev) => ({ ...prev, [event.agent_id!]: 'completed' }));
          }
          break;
        case 'vote_cast':
          if (event.data) {
            const voteData = event.data as Vote;
            setVotes((prev) => [...prev, voteData]);
            // Update idea vote count
            setIdeas((prev) =>
              prev.map((idea) =>
                idea.id === voteData.idea_id
                  ? { ...idea, votes_count: (idea.votes_count || 0) + (voteData.dots || 1) }
                  : idea
              )
            );
          }
          break;
        case 'voting_complete':
          console.log('📊 Voting complete event received');
          setVotingCompleteReceived(true);
          setIsVoting(false);
          break;
      }
    });

    // Mark all events as processed
    setProcessedEventCount(sseEvents.length);
  }, [sseEvents, processedEventCount]);

  const handleStartVoting = async () => {
    setIsVoting(true);
    setError(null);
    setVotes([]);

    // Initialize agent progress
    const initialProgress: Record<string, string> = {};
    workshop.agent_personalities?.forEach((id) => {
      initialProgress[id] = 'idle';
    });
    setAgentProgress(initialProgress);

    try {
      const result = await phase3Api.startVoting(workshopId, votingMethod);
      if (result.error) {
        // Handle error that could be a string or object
        const errorMsg = typeof result.error === 'string' 
          ? result.error 
          : result.error.message || JSON.stringify(result.error);
        setError(errorMsg);
        return;
      }
      setPhase('voting');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setIsVoting(false);
    }
  };

  const handleConfirmSelection = async () => {
    if (selectedIds.size < 3 || selectedIds.size > 5) {
      setError('Sélectionnez entre 3 et 5 idées');
      return;
    }

    try {
      const result = await phase3Api.selectIdeas(workshopId, Array.from(selectedIds));
      if (result.error) {
        const errorMsg = typeof result.error === 'string' 
          ? result.error 
          : result.error.message || JSON.stringify(result.error);
        setError(errorMsg);
        return;
      }
      onAdvancePhase(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const toggleSelection = (ideaId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(ideaId)) {
      newSelected.delete(ideaId);
    } else if (newSelected.size < 5) {
      newSelected.add(ideaId);
    }
    setSelectedIds(newSelected);
  };

  // Sort ideas by votes
  const sortedIdeas = [...ideas].sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0));

  // Transition to selection when voting_complete event is received
  useEffect(() => {
    if (votingCompleteReceived && phase === 'voting') {
      console.log('🎯 Transitioning to selection phase');
      setPhase('selection');
      // Pre-select top 3 ideas
      const top3 = sortedIdeas.slice(0, 3).map((i) => i.id);
      setSelectedIds(new Set(top3));
    }
  }, [votingCompleteReceived, phase, sortedIdeas]);

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
        <CardTitle className="text-xl flex items-center gap-2">
          🗳️ Phase 3 - Convergence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg text-red-600">
            ❌ {error}
          </div>
        )}

        {/* Method Selection */}
        {phase === 'method' && (
          <>
            <div className="space-y-4">
              <h3 className="font-semibold">Choisissez une méthode de vote</h3>
              <div className="space-y-3">
                {VOTING_METHODS.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setVotingMethod(m.id)}
                    className={cn(
                      'p-4 rounded-lg border-2 cursor-pointer transition-all',
                      votingMethod === m.id
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent bg-muted/50 hover:bg-muted'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{m.icon}</span>
                        <div>
                          <p className="font-semibold">{m.name}</p>
                          <p className="text-sm text-muted-foreground">{m.description}</p>
                        </div>
                      </div>
                      {m.recommended && <Badge>Recommandé</Badge>}
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                          votingMethod === m.id ? 'bg-primary border-primary text-white' : 'border-gray-300'
                        )}
                      >
                        {votingMethod === m.id && '✓'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                📊 {ideas.length} idées seront évaluées par {workshop.agent_personalities?.length || 3} agents
              </p>
            </div>

            <Button size="lg" onClick={handleStartVoting} disabled={isVoting} className="w-full gap-2">
              {isVoting ? '⏳ Démarrage...' : '🗳️ Lancer le Vote'}
            </Button>
          </>
        )}

        {/* Voting in Progress */}
        {phase === 'voting' && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">🗳️ Vote en Cours...</h3>
              <Badge variant="secondary">
                {Object.values(agentProgress).filter((s) => s === 'completed').length}/
                {workshop.agent_personalities?.length || 0}
              </Badge>
            </div>

            {/* Agent Progress */}
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(agentProgress).map(([agentId, status]) => {
                const agent = AGENT_PERSONALITIES[agentId];
                return agent ? (
                  <div
                    key={agentId}
                    className={cn(
                      'p-3 rounded-lg text-center',
                      status === 'voting' ? 'bg-blue-100 dark:bg-blue-900 animate-pulse' :
                      status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900' :
                      'bg-muted'
                    )}
                  >
                    <span className="text-xl">{agent.icon}</span>
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {status === 'completed' ? '✓ Voté' : status === 'voting' ? 'Vote...' : 'Attente'}
                    </p>
                  </div>
                ) : null;
              })}
            </div>

            {/* Live Rankings */}
            <div className="space-y-2">
              <h4 className="font-medium">📊 Classement Provisoire</h4>
              {sortedIdeas.slice(0, 5).map((idea, i) => (
                <IdeaCardCompact key={idea.id} idea={idea} rank={i + 1} votes={idea.votes_count} />
              ))}
            </div>
          </>
        )}

        {/* Selection Phase */}
        {phase === 'selection' && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">🗳️ Résultats du Vote</h3>
              <Badge>✅ Terminé</Badge>
            </div>

            <p className="text-muted-foreground">
              {votes.length} votes distribués. Sélectionnez 3 à 5 idées pour la Phase TRIZ.
            </p>

            {/* Ideas with selection */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {sortedIdeas.map((idea, i) => {
                const isSelected = selectedIds.has(idea.id);
                return (
                  <div
                    key={idea.id}
                    onClick={() => toggleSelection(idea.id)}
                    className={cn(
                      'p-4 rounded-lg cursor-pointer transition-all border-2',
                      isSelected ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/50 hover:bg-muted'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold w-8">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">{idea.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{idea.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-500">🔵</span>
                        <span className="font-bold">{idea.votes_count || 0}</span>
                      </div>
                      <div
                        className={cn(
                          'w-5 h-5 rounded border-2 flex items-center justify-center',
                          isSelected ? 'bg-primary border-primary text-white' : 'border-gray-300'
                        )}
                      >
                        {isSelected && '✓'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {selectedIds.size} idées sélectionnées (3-5 requises)
              </p>
              <Button
                size="lg"
                onClick={handleConfirmSelection}
                disabled={isAdvancing || selectedIds.size < 3 || selectedIds.size > 5}
                className="gap-2"
              >
                {isAdvancing ? (
                  <><span className="animate-spin">⏳</span> Transition...</>
                ) : (
                  <>Valider et aller vers TRIZ 🔧</>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
