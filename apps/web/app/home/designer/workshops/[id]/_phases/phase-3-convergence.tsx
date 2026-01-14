/**
 * Phase 3 - Convergence
 * Voting on ideas with different methods - Enhanced UI
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Badge } from '@kit/ui/badge';
import { cn } from '@kit/ui/utils';
import { AGENT_PERSONALITIES, type Workshop, type SSEEvent, type Idea, type VotingMethod, type Vote } from '../../_lib/types';
import { phase2Api, phase3Api } from '../../_lib/api';
import { 
  AgentAvatarIcon, 
  Spinner, 
  RankBadge,
  Vote as VoteIcon, 
  Circle, 
  LayoutGrid, 
  TrendingUp, 
  XCircle, 
  Check,
  BarChart2,
  Award,
  Wrench,
  ArrowRight,
  Trophy,
  Target,
  Sparkles
} from '../../_lib/icons';

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
  icon: React.ReactNode;
  description: string;
  details: string[];
  color: string;
  recommended?: boolean;
}

const VOTING_METHODS: VotingMethodOption[] = [
  {
    id: 'dot_voting',
    name: 'Dot Voting',
    icon: <Circle className="w-6 h-6" />,
    description: 'Chaque agent distribue 3 points sur ses idées préférées',
    details: ['Simple et rapide', 'Vote démocratique', 'Visualisation claire'],
    color: 'blue',
    recommended: true,
  },
  {
    id: 'now_how_wow',
    name: 'Now-How-Wow Matrix',
    icon: <LayoutGrid className="w-6 h-6" />,
    description: 'Catégorise les idées selon leur faisabilité et originalité',
    details: ['NOW: Quick wins', 'HOW: À développer', 'WOW: Innovation'],
    color: 'purple',
  },
  {
    id: 'impact_effort',
    name: 'Impact/Effort Matrix',
    icon: <TrendingUp className="w-6 h-6" />,
    description: 'Évalue chaque idée sur son impact potentiel et l\'effort requis',
    details: ['Score Impact 1-10', 'Score Effort 1-10', 'Priorisation claire'],
    color: 'green',
  },
];

// Color mapping for voting methods
const methodColors: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500 to-blue-600',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950',
    border: 'border-purple-500',
    text: 'text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-500 to-purple-600',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-500',
    text: 'text-green-600 dark:text-green-400',
    gradient: 'from-green-500 to-green-600',
  },
};

export default function Phase3Convergence({
  workshop,
  workshopId,
  onAdvancePhase,
  isAdvancing,
  sseEvents,
}: Phase3Props) {
  const [votingMethod, setVotingMethod] = useState<VotingMethod>('dot_voting');
  const [isVoting, setIsVoting] = useState(false);
  const [votingStarted, setVotingStarted] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [agentProgress, setAgentProgress] = useState<Record<string, { status: string; votes: number }>>({});
  const [phase, setPhase] = useState<'method' | 'voting' | 'selection'>('method');
  const [savedTotalVotes, setSavedTotalVotes] = useState(0);
  const [savedCompletedAgents, setSavedCompletedAgents] = useState(0);

  // Load ideas and existing phase data on mount
  useEffect(() => {
    loadIdeas();
    loadExistingVotesFromApi();
  }, [workshopId, workshop]);

  const loadIdeas = async () => {
    try {
      const result = await phase2Api.getIdeas(workshopId);
      if (result.data) {
        const ideasData = result.data as Idea[];
        setIdeas(ideasData);
        
        // If ideas have vote counts, we have existing votes
        const hasVotes = ideasData.some(idea => (idea.votes_count || 0) > 0);
        if (hasVotes) {
          // Calculate total votes from ideas
          const totalFromIdeas = ideasData.reduce((sum, idea) => sum + (idea.votes_count || 0), 0);
          setSavedTotalVotes(totalFromIdeas);
          setSavedCompletedAgents(workshop.agent_personalities?.length || 0);
          
          // Go directly to selection phase
          setPhase('selection');
          setVotingCompleteReceived(true);
          
          // Pre-select top 3 ideas
          const sortedByVotes = [...ideasData].sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0));
          const top3 = sortedByVotes.slice(0, 3).map(i => i.id);
          setSelectedIds(new Set(top3));
        }
      }
    } catch (err) {
      console.error('Failed to load ideas:', err);
    }
  };

  // Load existing votes from API
  const loadExistingVotesFromApi = async () => {
    try {
      const result = await phase3Api.getVotes(workshopId);
      if (result.data) {
        const voteSummary = result.data as { total_votes: number; top_ideas: { id: string; title: string; votes_count: number }[] };
        
        if (voteSummary.total_votes > 0) {
          console.log('📊 Loaded existing votes:', voteSummary);
          setSavedTotalVotes(voteSummary.total_votes);
          setSavedCompletedAgents(workshop.agent_personalities?.length || 0);
          
          // Update ideas with vote counts from summary
          if (voteSummary.top_ideas && voteSummary.top_ideas.length > 0) {
            setIdeas(prev => prev.map(idea => {
              const topIdea = voteSummary.top_ideas.find(t => t.id === idea.id);
              return topIdea ? { ...idea, votes_count: topIdea.votes_count } : idea;
            }));
          }
          
          // Go to selection phase
          setPhase('selection');
          setVotingCompleteReceived(true);
          
          // Pre-select top 3 ideas
          const top3 = voteSummary.top_ideas.slice(0, 3).map(i => i.id);
          setSelectedIds(new Set(top3));
        }
      }
    } catch (err) {
      console.error('Failed to load votes:', err);
    }
  };

  // Process SSE events
  const [processedEventCount, setProcessedEventCount] = useState(0);
  const [votingCompleteReceived, setVotingCompleteReceived] = useState(false);
  
  useEffect(() => {
    const newEvents = sseEvents.slice(processedEventCount);
    if (newEvents.length === 0) return;

    if (!votingStarted) {
      setProcessedEventCount(sseEvents.length);
      return;
    }

    const votingEvents = newEvents.filter(e =>
      e.type === 'vote_cast' ||
      e.type === 'voting_complete' ||
      e.type === 'agent_started' ||
      e.type === 'agent_complete' ||
      e.type === 'agent_completed' ||
      e.type === 'error'
    );

    votingEvents.forEach((event) => {
      switch (event.type) {
        case 'agent_started':
          if (event.agent_id) {
            setAgentProgress((prev) => ({ 
              ...prev, 
              [event.agent_id!]: { status: 'voting', votes: 0 } 
            }));
          }
          break;
        case 'agent_complete':
        case 'agent_completed':
          if (event.agent_id) {
            setAgentProgress((prev) => ({ 
              ...prev, 
              [event.agent_id!]: { 
                status: 'completed', 
                votes: prev[event.agent_id!]?.votes || 0 
              } 
            }));
          }
          break;
        case 'vote_cast':
          if (event.data) {
            // SSE sends: { idea_id, agent_id, vote_type, value: { dots?, category?, impact?, effort? } }
            const voteEvent = event.data as { 
              idea_id: string; 
              agent_id: string; 
              vote_type: string; 
              value: { dots?: number; category?: string; impact?: number; effort?: number } 
            };
            
            // Create vote record for local state
            const voteData: Vote = {
              id: `temp-${Date.now()}`,
              idea_id: voteEvent.idea_id,
              agent_id: voteEvent.agent_id,
              dots: voteEvent.value?.dots,
              category: voteEvent.value?.category as 'now' | 'how' | 'wow' | undefined,
              impact: voteEvent.value?.impact,
              effort: voteEvent.value?.effort,
            };
            
            setVotes((prev) => [...prev, voteData]);
            
            // Update agent vote count
            if (voteEvent.agent_id) {
              setAgentProgress((prev) => ({
                ...prev,
                [voteEvent.agent_id]: {
                  status: prev[voteEvent.agent_id]?.status || 'voting',
                  votes: (prev[voteEvent.agent_id]?.votes || 0) + 1,
                },
              }));
            }
            
            // Update idea vote count based on vote type
            const voteValue = voteEvent.value?.dots || 1;
            setIdeas((prev) =>
              prev.map((idea) =>
                idea.id === voteEvent.idea_id
                  ? { ...idea, votes_count: (idea.votes_count || 0) + voteValue }
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

    setProcessedEventCount(sseEvents.length);
  }, [sseEvents, processedEventCount, votingStarted]);

  const handleStartVoting = async () => {
    setVotingStarted(true);
    setIsVoting(true);
    setError(null);
    setVotes([]);
    setProcessedEventCount(sseEvents.length);

    const initialProgress: Record<string, { status: string; votes: number }> = {};
    workshop.agent_personalities?.forEach((id) => {
      initialProgress[id] = { status: 'idle', votes: 0 };
    });
    setAgentProgress(initialProgress);

    try {
      const result = await phase3Api.startVoting(workshopId, votingMethod);
      if (result.error) {
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
  
  // Calculate total votes from ideas if savedTotalVotes is 0
  const totalVotesFromIdeas = ideas.reduce((sum, idea) => sum + (idea.votes_count || 0), 0);
  
  // Use live votes count if voting in progress, otherwise use saved or calculated from ideas
  const totalVotes = votes.length > 0 ? votes.length : (savedTotalVotes > 0 ? savedTotalVotes : totalVotesFromIdeas);
  const completedAgents = Object.values(agentProgress).filter((a) => a.status === 'completed').length || savedCompletedAgents;
  const totalAgents = workshop.agent_personalities?.length || 0;

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

  const selectedMethod = VOTING_METHODS.find(m => m.id === votingMethod) ?? VOTING_METHODS[0]!;
  const colors = methodColors[selectedMethod.color] ?? methodColors.blue!;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
        <CardTitle className="text-xl flex items-center gap-2">
          <VoteIcon className="w-5 h-5" />
          Phase 3 - Convergence
        </CardTitle>
        <p className="text-indigo-100 text-sm mt-1">
          {phase === 'method' && 'Choisissez une méthode de vote pour évaluer les idées'}
          {phase === 'voting' && 'Les agents votent pour leurs idées préférées'}
          {phase === 'selection' && 'Sélectionnez les meilleures idées pour la phase TRIZ'}
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 flex items-center gap-2">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ============ METHOD SELECTION ============ */}
        {phase === 'method' && (
          <>
            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Target className="w-5 h-5" />
                  <span className="text-2xl font-bold">{ideas.length}</span>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">Idées à évaluer</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Award className="w-5 h-5" />
                  <span className="text-2xl font-bold">{totalAgents}</span>
                </div>
                <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">Agents votants</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Trophy className="w-5 h-5" />
                  <span className="text-2xl font-bold">3-5</span>
                </div>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">Idées sélectionnées</p>
              </div>
            </div>

            {/* Method Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-500" />
                Choisissez une méthode de vote
              </h3>
              <div className="space-y-3">
                {VOTING_METHODS.map((m) => {
                  const mColors = methodColors[m.color] ?? methodColors.blue!;
                  const isSelected = votingMethod === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setVotingMethod(m.id)}
                      className={cn(
                        'p-5 rounded-xl border-2 cursor-pointer transition-all duration-200',
                        isSelected
                          ? `${mColors.border} ${mColors.bg} shadow-lg`
                          : 'border-transparent bg-muted/50 hover:bg-muted hover:shadow-md'
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          'p-3 rounded-xl',
                          isSelected ? `bg-gradient-to-br ${mColors.gradient} text-white` : 'bg-muted'
                        )}>
                          {m.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-lg">{m.name}</p>
                            {m.recommended && (
                              <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-white border-0">
                                <Sparkles className="w-3 h-3 mr-1" /> Recommandé
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {m.details.map((detail, i) => (
                              <span
                                key={i}
                                className={cn(
                                  'px-2 py-1 rounded-full text-xs font-medium',
                                  isSelected ? `${mColors.bg} ${mColors.text}` : 'bg-muted text-muted-foreground'
                                )}
                              >
                                {detail}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div
                          className={cn(
                            'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                            isSelected 
                              ? `bg-gradient-to-br ${mColors.gradient} border-transparent text-white` 
                              : 'border-gray-300'
                          )}
                        >
                          {isSelected && <Check className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button 
              size="lg" 
              onClick={handleStartVoting} 
              disabled={isVoting || ideas.length === 0} 
              className={cn(
                "w-full gap-2 text-lg py-6",
                `bg-gradient-to-r ${colors.gradient} hover:opacity-90`
              )}
            >
              {isVoting ? (
                <>
                  <Spinner size="sm" />
                  Démarrage du vote...
                </>
              ) : (
                <>
                  <VoteIcon className="w-5 h-5" />
                  Lancer le Vote
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </>
        )}

        {/* ============ VOTING IN PROGRESS ============ */}
        {phase === 'voting' && (
          <>
            {/* Progress Header */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500 text-white animate-pulse">
                  <VoteIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Vote en cours...</h3>
                  <p className="text-sm text-muted-foreground">{selectedMethod.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalVotes}</p>
                <p className="text-xs text-muted-foreground">votes distribués</p>
              </div>
            </div>

            {/* Agent Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(agentProgress).map(([agentId, progress]) => {
                const agent = AGENT_PERSONALITIES[agentId];
                if (!agent) return null;
                
                const isCompleted = progress.status === 'completed';
                const isAgentVoting = progress.status === 'voting';
                
                return (
                  <div
                    key={agentId}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all duration-300',
                      isCompleted 
                        ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900' 
                        : isAgentVoting 
                          ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 animate-pulse' 
                          : 'border-gray-200 dark:border-gray-700 bg-muted/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <AgentAvatarIcon personality={agentId} size="lg" />
                      <div className="flex-1">
                        <p className="font-semibold">{agent.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {isCompleted ? (
                            <Badge className="bg-emerald-500 text-white">
                              <Check className="w-3 h-3 mr-1" /> Terminé
                            </Badge>
                          ) : isAgentVoting ? (
                            <Badge className="bg-indigo-500 text-white animate-pulse">
                              <Spinner size="xs" className="mr-1" /> Vote...
                            </Badge>
                          ) : (
                            <Badge variant="secondary">En attente</Badge>
                          )}
                        </div>
                      </div>
                      {progress.votes > 0 && (
                        <div className="text-center">
                          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{progress.votes}</p>
                          <p className="text-xs text-muted-foreground">votes</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Rankings */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Classement en temps réel
              </h4>
              <div className="space-y-2">
                {sortedIdeas.slice(0, 5).map((idea, i) => {
                  const maxVotes = sortedIdeas[0]?.votes_count || 1;
                  const percentage = ((idea.votes_count || 0) / maxVotes) * 100;
                  
                  return (
                    <div key={idea.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <RankBadge rank={i + 1} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{idea.title}</p>
                          <div className="mt-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                'h-full rounded-full transition-all duration-500',
                                i === 0 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                i === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                                i === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                                'bg-gradient-to-r from-indigo-400 to-indigo-500'
                              )}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                          <Circle className="w-4 h-4 fill-current" />
                          <span className="font-bold">{idea.votes_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ============ SELECTION PHASE ============ */}
        {phase === 'selection' && (
          <>
            {/* Results Header */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500 text-white">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-700 dark:text-emerald-300">Vote terminé !</h3>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">{totalVotes} votes au total</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500 text-white text-lg px-4 py-2">
                  {completedAgents}/{totalAgents} agents
                </Badge>
              </div>
            </div>

            {/* Selection Instructions */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
              <p className="text-amber-700 dark:text-amber-300 flex items-center gap-2">
                <Target className="w-5 h-5" />
                <span>Sélectionnez <strong>3 à 5 idées</strong> pour l&apos;analyse TRIZ. Les meilleures sont pré-sélectionnées.</span>
              </p>
            </div>

            {/* Ideas Grid */}
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
              {sortedIdeas.map((idea, i) => {
                const isSelected = selectedIds.has(idea.id);
                const maxVotes = sortedIdeas[0]?.votes_count || 1;
                const percentage = ((idea.votes_count || 0) / maxVotes) * 100;
                
                return (
                  <div
                    key={idea.id}
                    onClick={() => toggleSelection(idea.id)}
                    className={cn(
                      'p-4 rounded-xl cursor-pointer transition-all duration-200 border-2',
                      isSelected 
                        ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 shadow-lg' 
                        : 'border-transparent bg-muted/50 hover:bg-muted hover:shadow-md'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <RankBadge rank={i + 1} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{idea.title}</p>
                        <p className="text-sm text-muted-foreground truncate mt-1">{idea.description}</p>
                        {/* Vote bar */}
                        <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{idea.votes_count || 0}</p>
                          <p className="text-xs text-muted-foreground">votes</p>
                        </div>
                        <div
                          className={cn(
                            'w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all',
                            isSelected 
                              ? 'bg-indigo-500 border-indigo-500 text-white' 
                              : 'border-gray-300 dark:border-gray-600'
                          )}
                        >
                          {isSelected && <Check className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Badge variant={selectedIds.size >= 3 && selectedIds.size <= 5 ? 'default' : 'secondary'}>
                  {selectedIds.size} sélectionnées
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedIds.size < 3 && `(${3 - selectedIds.size} de plus requises)`}
                  {selectedIds.size > 5 && '(maximum 5)'}
                  {selectedIds.size >= 3 && selectedIds.size <= 5 && '✓ Prêt'}
                </span>
              </div>
              <Button
                size="lg"
                onClick={handleConfirmSelection}
                disabled={isAdvancing || selectedIds.size < 3 || selectedIds.size > 5}
                className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              >
                {isAdvancing ? (
                  <>
                    <Spinner size="sm" />
                    Transition...
                  </>
                ) : (
                  <>
                    Valider et aller vers TRIZ
                    <Wrench className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
