/**
 * Phase 2 - Ideation
 * Technique selection and idea generation with SSE
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Badge } from '@kit/ui/badge';
import { cn } from '@kit/ui/utils';
import { AGENT_PERSONALITIES, type Workshop, type SSEEvent, type Idea, type IdeationTechnique, type IdeationMode } from '../../_lib/types';
import { phase2Api } from '../../_lib/api';
import { IdeaCard } from '../../_components/idea-card';

interface Phase2Props {
  workshop: Workshop;
  workshopId: string;
  onAdvancePhase: (phase: number) => void;
  isAdvancing: boolean;
  sseEvents: SSEEvent[];
  refetch: () => void;
}

interface TechniqueOption {
  id: IdeationTechnique;
  name: string;
  icon: string;
  description: string;
  details: string[];
  recommended?: boolean;
}

interface ModeOption {
  id: IdeationMode;
  name: string;
  icon: string;
  description: string;
}

const TECHNIQUES: TechniqueOption[] = [
  {
    id: 'scamper',
    name: 'SCAMPER',
    icon: '🔄',
    description: 'Transforme le problème sous 7 angles différents',
    details: ['Substitute', 'Combine', 'Adapt', 'Modify', 'Put to other uses', 'Eliminate', 'Reverse'],
    recommended: true,
  },
  {
    id: 'random_word',
    name: 'Random Word',
    icon: '🎲',
    description: 'Force des connexions inattendues avec des mots aléatoires',
    details: ['Idées surprenantes', 'Connexions inattendues'],
  },
  {
    id: 'worst_idea',
    name: 'Worst Possible Idea',
    icon: '💥',
    description: 'Génère les PIRES idées puis les inverse en solutions',
    details: ['Approche contre-intuitive', 'Déblocage créatif'],
  },
];

const MODES: ModeOption[] = [
  { id: 'parallel', name: 'Parallel', icon: '⚡', description: 'Rapide - tous en même temps' },
  { id: 'sequence', name: 'Sequence', icon: '📈', description: 'Cohérent - un après l\'autre' },
  { id: 'discussion', name: 'Discussion', icon: '💬', description: 'Qualité - débat entre agents' },
];

export default function Phase2Ideation({
  workshop,
  workshopId,
  onAdvancePhase,
  isAdvancing,
  sseEvents,
}: Phase2Props) {
  const [technique, setTechnique] = useState<IdeationTechnique>('scamper');
  const [mode, setMode] = useState<IdeationMode>('parallel');
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [agentProgress, setAgentProgress] = useState<Record<string, { status: string; count: number }>>({});
  const [processedEventCount, setProcessedEventCount] = useState(0);

  const targetCount = workshop.target_ideas_count || 20;

  // Process SSE events - process ALL new events, not just the last one
  useEffect(() => {
    if (sseEvents.length <= processedEventCount) return;

    // Process all new events since last check
    const newEvents = sseEvents.slice(processedEventCount);
    console.log(`🔵 Processing ${newEvents.length} new SSE events (total: ${sseEvents.length})`);

    newEvents.forEach((event) => {
      // agent_id can be at top level or in data
      const agentId = event.agent_id || event.data?.agent_id || '';

      switch (event.type) {
      case 'phase_started':
        console.log('✅ phase_started received');
        // Ensure we're in generating state when phase starts
        setIsGenerating(true);
        break;
      case 'agent_started':
        if (agentId) {
          setAgentProgress((prev) => ({
            ...prev,
            [agentId]: { status: 'working', count: 0 },
          }));
        }
        break;
      case 'agent_complete':
      case 'agent_completed':
        if (agentId) {
          setAgentProgress((prev) => {
            const existing = prev[agentId];
            return {
              ...prev,
              [agentId]: { status: 'completed', count: existing?.count ?? 0 },
            };
          });
        }
        break;
      case 'idea_generated':
        // Data comes directly in event (not nested in data property)
        const ideaData = event.data || event;
        console.log('💡 idea_generated - ideaData:', ideaData);
        if (ideaData.title) {
          const ideaAgentId = ideaData.agent_id || event.agent_id || '';
          // Ensure we have a valid ID (not "None" or empty)
          let ideaId = ideaData.idea_id || ideaData.id;
          if (!ideaId || ideaId === 'None' || ideaId === 'null') {
            ideaId = crypto.randomUUID();
          }
          const newIdea: Idea = {
            id: ideaId,
            title: ideaData.title,
            description: ideaData.description || '',
            agent_id: ideaAgentId,
            agent_name: ideaData.agent_name || AGENT_PERSONALITIES[ideaAgentId]?.name || '',
            technique: ideaData.technique || technique,
            technique_detail: ideaData.technique_detail,
            votes_count: 0,
            created_at: new Date().toISOString(),
          };
          console.log('💡 Adding idea:', newIdea.title, 'id:', newIdea.id, 'agent:', ideaAgentId);
          setIdeas((prev) => {
            // Avoid duplicates
            if (prev.some(i => i.id === newIdea.id)) {
              console.log('⚠️ Duplicate idea skipped:', newIdea.id);
              return prev;
            }
            return [...prev, newIdea];
          });
          if (ideaAgentId) {
            setAgentProgress((prev) => {
              const existing = prev[ideaAgentId];
              console.log('📊 Agent progress update:', ideaAgentId, 'current:', existing?.count, '→', (existing?.count ?? 0) + 1);
              return {
                ...prev,
                [ideaAgentId]: {
                  status: existing?.status ?? 'working',
                  count: (existing?.count ?? 0) + 1,
                },
              };
            });
          }
        }
        break;
      case 'ideation_complete':
        // All ideas generated, stop the generating state
        setIsGenerating(false);
        break;
      }
    });

    // Mark all events as processed
    setProcessedEventCount(sseEvents.length);
  }, [sseEvents, technique, processedEventCount]);

  const handleStartIdeation = async () => {
    setIsGenerating(true);
    setError(null);
    setIdeas([]);
    setProcessedEventCount(sseEvents.length); // Reset to current count to ignore old events

    // Initialize agent progress
    const initialProgress: Record<string, { status: string; count: number }> = {};
    workshop.agent_personalities?.forEach((id) => {
      initialProgress[id] = { status: 'idle', count: 0 };
    });
    setAgentProgress(initialProgress);

    try {
      const result = await phase2Api.startIdeation(workshopId, {
        technique,
        mode,
        target_count: targetCount,
      });

      if (result.error) {
        setError(result.error.message);
        setIsGenerating(false); // Only stop on error
      }
      // Don't set isGenerating to false here - wait for SSE ideation_complete event
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération');
      setIsGenerating(false); // Only stop on error
    }
  };

  const handleEditIdea = async (ideaId: string, data: { title: string; description: string }) => {
    try {
      await phase2Api.updateIdea(workshopId, ideaId, data);
      setIdeas((prev) =>
        prev.map((idea) => (idea.id === ideaId ? { ...idea, ...data } : idea))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDeleteIdea = async (ideaId: string) => {
    if (!confirm('Supprimer cette idée ?')) return;
    try {
      await phase2Api.deleteIdea(workshopId, ideaId);
      setIdeas((prev) => prev.filter((idea) => idea.id !== ideaId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const isComplete = ideas.length >= targetCount;

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-t-lg">
        <CardTitle className="text-xl flex items-center gap-2">
          💡 Phase 2 - Ideation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-600">
            ❌ {error}
          </div>
        )}

        {/* Before generation */}
        {ideas.length === 0 && !isGenerating && (
          <>
            {/* Technique Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold">Choisissez une technique de créativité</h3>
              <div className="space-y-3">
                {TECHNIQUES.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setTechnique(t.id)}
                    className={cn(
                      'p-4 rounded-lg border-2 cursor-pointer transition-all',
                      technique === t.id
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent bg-muted/50 hover:bg-muted'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{t.icon}</span>
                        <div>
                          <p className="font-semibold">{t.name}</p>
                          <p className="text-sm text-muted-foreground">{t.description}</p>
                        </div>
                      </div>
                      {t.recommended && <Badge>Recommandé</Badge>}
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                          technique === t.id ? 'bg-primary border-primary text-white' : 'border-gray-300'
                        )}
                      >
                        {technique === t.id && '✓'}
                      </div>
                    </div>
                    {technique === t.id && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {t.details.map((d) => (
                          <Badge key={d} variant="outline" className="text-xs">{d}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mode Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold">Mode d'exécution</h3>
              <div className="grid grid-cols-3 gap-3">
                {MODES.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={cn(
                      'p-3 rounded-lg border-2 cursor-pointer text-center transition-all',
                      mode === m.id
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent bg-muted/50 hover:bg-muted'
                    )}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <p className="font-medium text-sm mt-1">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button size="lg" onClick={handleStartIdeation} className="w-full gap-2">
              🚀 Générer les Idées
            </Button>
          </>
        )}

        {/* During/After generation */}
        {(isGenerating || ideas.length > 0) && (
          <>
            {/* Progress header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {isGenerating ? '💡 Génération en Cours...' : '💡 Idées Générées'}
              </h3>
              <Badge variant={isComplete ? 'default' : 'secondary'}>
                {ideas.length}/{targetCount}
              </Badge>
            </div>

            {/* Agent Progress */}
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(agentProgress).map(([agentId, progress]) => {
                const agent = AGENT_PERSONALITIES[agentId];
                return agent ? (
                  <div
                    key={agentId}
                    className={cn(
                      'p-3 rounded-lg text-center',
                      progress.status === 'working' ? 'bg-blue-100 dark:bg-blue-900 animate-pulse' :
                      progress.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900' :
                      'bg-muted'
                    )}
                  >
                    <span className="text-xl">{agent.icon}</span>
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {progress.status === 'completed' ? '✓ ' : ''}{progress.count} idées
                    </p>
                  </div>
                ) : null;
              })}
            </div>

            {/* Ideas List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {ideas.map((idea, i) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  rank={i + 1}
                  showVotes={false}
                  onEdit={(data) => handleEditIdea(idea.id, data)}
                  onDelete={() => handleDeleteIdea(idea.id)}
                />
              ))}
            </div>

            {/* Stats */}
            {ideas.length > 0 && (
              <div className="p-4 rounded-lg bg-muted/50 text-sm">
                <h4 className="font-medium mb-2">📊 Statistiques</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(agentProgress).map(([agentId, progress]) => {
                    const agent = AGENT_PERSONALITIES[agentId];
                    return agent ? (
                      <div key={agentId} className="flex justify-between">
                        <span>{agent.icon} {agent.name}</span>
                        <span>{progress.count} idées</span>
                      </div>
                    ) : null;
                  })}
                  <div className="col-span-2 flex justify-between pt-2 border-t">
                    <span>Technique</span>
                    <span>{TECHNIQUES.find((t) => t.id === technique)?.name}</span>
                  </div>
                  <div className="col-span-2 flex justify-between">
                    <span>Mode</span>
                    <span>{MODES.find((m) => m.id === mode)?.name}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Advance */}
            {isComplete && (
              <Button
                size="lg"
                onClick={() => onAdvancePhase(3)}
                disabled={isAdvancing}
                className="w-full gap-2"
              >
                {isAdvancing ? (
                  <><span className="animate-spin">⏳</span> Transition...</>
                ) : (
                  <>Avancer vers Phase 3: Voting 🗳️</>
                )}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
