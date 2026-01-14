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
import {
  AgentAvatarIcon,
  Spinner,
  Lightbulb,
  XCircle,
  RefreshCw,
  Shuffle,
  Zap,
  Rocket,
  Target,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  BarChart2,
} from '../../_lib/icons';

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
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  details: string[];
  recommended?: boolean;
}

interface ModeOption {
  id: IdeationMode;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const TECHNIQUES: TechniqueOption[] = [
  {
    id: 'scamper',
    name: 'SCAMPER',
    icon: RefreshCw,
    description: 'Transforme le problème sous 7 angles différents',
    details: ['Substitute', 'Combine', 'Adapt', 'Modify', 'Put to other uses', 'Eliminate', 'Reverse'],
    recommended: true,
  },
  {
    id: 'random_word',
    name: 'Random Word',
    icon: Shuffle,
    description: 'Force des connexions inattendues avec des mots aléatoires',
    details: ['Idées surprenantes', 'Connexions inattendues'],
  },
  {
    id: 'worst_idea',
    name: 'Worst Possible Idea',
    icon: Zap,
    description: 'Génère les PIRES idées puis les inverse en solutions',
    details: ['Approche contre-intuitive', 'Déblocage créatif'],
  },
];

const MODES: ModeOption[] = [
  { id: 'parallel', name: 'Parallel', icon: Zap, description: 'Rapide - tous en même temps' },
  { id: 'sequence', name: 'Sequence', icon: ArrowRight, description: 'Cohérent - un après l\'autre' },
  { id: 'discussion', name: 'Discussion', icon: MessageSquare, description: 'Qualité - débat entre agents' },
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
  const [ideationStarted, setIdeationStarted] = useState(false); // Track if user started ideation
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [agentProgress, setAgentProgress] = useState<Record<string, { status: string; count: number }>>({});
  const [processedEventCount, setProcessedEventCount] = useState(0);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const targetCount = workshop.target_ideas_count || 20;
  
  // Add debug log helper
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[Phase2] ${message}`);
    setDebugLogs(prev => [...prev.slice(-20), `${timestamp}: ${message}`]);
  };

  // Timeout protection - stop generating after 2 minutes if no progress
  useEffect(() => {
    if (!isGenerating || !generationStartTime) return;
    
    const timeoutId = setTimeout(() => {
      const elapsed = Date.now() - generationStartTime;
      if (elapsed > 120000 && ideas.length === 0) { // 2 minutes with no ideas
        addLog('⚠️ Timeout: Aucune idée reçue après 2 minutes');
        setError('Timeout: La génération a pris trop de temps. Veuillez réessayer.');
        setIsGenerating(false);
      }
    }, 120000);
    
    return () => clearTimeout(timeoutId);
  }, [isGenerating, generationStartTime, ideas.length]);

  // Process SSE events - only process ideation-specific events
  useEffect(() => {
    if (sseEvents.length <= processedEventCount) return;

    // Skip processing if user hasn't started ideation yet
    if (!ideationStarted) {
      // Just mark as processed to avoid re-processing later
      setProcessedEventCount(sseEvents.length);
      return;
    }

    // Process all new events since last check
    const newEvents = sseEvents.slice(processedEventCount);
    
    // Filter to only ideation-related events
    const ideationEvents = newEvents.filter(e => 
      e.type === 'idea_generated' || 
      e.type === 'ideation_complete' || 
      e.type === 'ideation_started' ||
      e.type === 'agent_started' ||
      e.type === 'agent_complete' ||
      e.type === 'agent_completed' ||
      e.type === 'error'
    );
    
    if (ideationEvents.length > 0) {
      addLog(`🔵 Processing ${ideationEvents.length} ideation events (ignored ${newEvents.length - ideationEvents.length} other events)`);
    }

    ideationEvents.forEach((event) => {
      // agent_id can be at top level or in data
      const agentId = event.agent_id || event.data?.agent_id || '';

      switch (event.type) {
      case 'ideation_started':
        addLog('✅ ideation_started received');
        setIsGenerating(true);
        break;
      case 'agent_started':
        if (agentId) {
          addLog(`🤖 Agent ${agentId} started`);
          setAgentProgress((prev) => ({
            ...prev,
            [agentId]: { status: 'working', count: 0 },
          }));
        }
        break;
      case 'agent_complete':
      case 'agent_completed':
        if (agentId) {
          addLog(`✅ Agent ${agentId} completed`);
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
        addLog(`💡 idea_generated: ${ideaData.title?.substring(0, 30)}...`);
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
          setIdeas((prev) => {
            // Avoid duplicates
            if (prev.some(i => i.id === newIdea.id)) {
              addLog(`⚠️ Duplicate idea skipped: ${newIdea.id}`);
              return prev;
            }
            return [...prev, newIdea];
          });
          if (ideaAgentId) {
            setAgentProgress((prev) => {
              const existing = prev[ideaAgentId];
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
        addLog('🎉 ideation_complete received');
        setIsGenerating(false);
        break;
      case 'error':
        addLog(`❌ Error event: ${event.data?.message || JSON.stringify(event)}`);
        setError(event.data?.message || 'Erreur du serveur');
        setIsGenerating(false);
        break;
      default:
        // Log other events for debugging
        if (event.type !== 'heartbeat' && event.type !== 'connected') {
          addLog(`📨 Event: ${event.type}`);
        }
      }
    });

    // Mark all events as processed
    setProcessedEventCount(sseEvents.length);
  }, [sseEvents, technique, processedEventCount, ideationStarted]);

  // Handle cancel generation
  const handleCancelGeneration = () => {
    addLog('🛑 Generation cancelled by user');
    setIsGenerating(false);
    setIdeationStarted(false);
    if (ideas.length === 0) {
      setError('Génération annulée. Vous pouvez réessayer.');
    }
  };

  const handleStartIdeation = async () => {
    setIdeationStarted(true); // Mark that user explicitly started ideation
    setIsGenerating(true);
    setError(null);
    setIdeas([]);
    setDebugLogs([]);
    setGenerationStartTime(Date.now());
    setProcessedEventCount(sseEvents.length); // Reset to current count to ignore old events
    
    addLog('🚀 Starting ideation...');
    addLog(`Technique: ${technique}, Mode: ${mode}, Target: ${targetCount}`);

    // Initialize agent progress
    const initialProgress: Record<string, { status: string; count: number }> = {};
    workshop.agent_personalities?.forEach((id) => {
      initialProgress[id] = { status: 'idle', count: 0 };
    });
    setAgentProgress(initialProgress);

    try {
      addLog('📡 Calling API...');
      const result = await phase2Api.startIdeation(workshopId, {
        technique,
        mode,
        target_count: targetCount,
      });

      if (result.error) {
        addLog(`❌ API Error: ${result.error.message}`);
        setError(result.error.message);
        setIsGenerating(false);
      } else {
        addLog('✅ API call successful');
        // API response contains all generated ideas - use as source of truth
        const apiIdeas = result.data?.ideas || [];
        if (Array.isArray(apiIdeas) && apiIdeas.length > 0) {
          addLog(`📦 API returned ${apiIdeas.length} ideas (replacing SSE data)`);
          // Replace with API ideas (source of truth)
          const formattedIdeas = apiIdeas.map((idea: any) => ({
            id: idea.id,
            title: idea.title || 'Sans titre',
            description: idea.description || '',
            agent_id: idea.agent_id || '',
            agent_name: idea.agent_name || AGENT_PERSONALITIES[idea.agent_id]?.name || '',
            technique: idea.technique || technique,
            technique_detail: idea.technique_detail,
            votes_count: idea.votes_count || 0,
            created_at: idea.created_at || new Date().toISOString(),
            // Technique-specific fields
            worst_idea_original: idea.worst_idea_original,
            inversion_insight: idea.inversion_insight,
            scamper_type: idea.scamper_type,
            random_word: idea.random_word,
          }));
          setIdeas(formattedIdeas);
          addLog(`✅ Loaded ${formattedIdeas.length} ideas`);
          
          // Update agent progress from API ideas (recalculate counts)
          // Use agent_name as key since backend agent names may differ from AGENT_PERSONALITIES
          const newAgentProgress: Record<string, { status: string; count: number }> = {};
          
          // Count ideas per agent using agent_name as the key
          formattedIdeas.forEach((idea) => {
            const agentKey = idea.agent_name || idea.agent_id || 'unknown';
            if (agentKey) {
              if (!newAgentProgress[agentKey]) {
                newAgentProgress[agentKey] = { status: 'completed', count: 0 };
              }
              newAgentProgress[agentKey].count += 1;
            }
          });
          
          setAgentProgress(newAgentProgress);
          addLog(`📊 Agent stats updated: ${JSON.stringify(Object.entries(newAgentProgress).map(([id, p]) => `${id}: ${p.count}`))}`);
        }
        // Stop generating - API completion means ideation is done
        setIsGenerating(false);
        addLog('🎉 Ideation complete');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de la génération';
      addLog(`❌ Exception: ${errorMsg}`);
      setError(errorMsg);
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
          <Lightbulb className="w-5 h-5" />
          Phase 2 - Ideation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-600 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            {error}
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
                        <t.icon className="w-6 h-6" />
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
                        {technique === t.id && <CheckCircle2 className="w-3 h-3" />}
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
                    <m.icon className="w-5 h-5 mx-auto" />
                    <p className="font-medium text-sm mt-1">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button size="lg" onClick={handleStartIdeation} className="w-full gap-2">
              <Rocket className="w-4 h-4" />
              Générer les Idées
            </Button>
          </>
        )}

        {/* During/After generation */}
        {(isGenerating || ideas.length > 0) && (
          <>
            {/* Progress header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                {isGenerating ? 'Génération en Cours...' : 'Idées Générées'}
              </h3>
              <div className="flex items-center gap-2">
                {isGenerating && (
                  <Button variant="outline" size="sm" onClick={handleCancelGeneration}>
                    Annuler
                  </Button>
                )}
                <Badge variant={isComplete ? 'default' : 'secondary'}>
                  {ideas.length}/{targetCount}
                </Badge>
              </div>
            </div>

            {/* Agent Progress - Enhanced Design */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(agentProgress).map(([agentKey, progress], index) => {
                // Dynamic colors for each agent
                const agentColors = [
                  { bg: 'from-violet-500 to-purple-600', light: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600' },
                  { bg: 'from-emerald-500 to-teal-600', light: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600' },
                  { bg: 'from-amber-500 to-orange-600', light: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600' },
                  { bg: 'from-blue-500 to-indigo-600', light: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600' },
                  { bg: 'from-rose-500 to-pink-600', light: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-600' },
                ];
                const color = agentColors[index % agentColors.length];
                const displayName = agentKey;
                const percentage = ideas.length > 0 ? Math.round((progress.count / ideas.length) * 100) : 0;
                
                return (
                  <div
                    key={agentKey}
                    className={cn(
                      'relative overflow-hidden rounded-xl border transition-all duration-300',
                      progress.status === 'working' ? 'ring-2 ring-blue-400 ring-offset-2' : '',
                      progress.status === 'completed' ? 'border-green-300 dark:border-green-700' : 'border-border'
                    )}
                  >
                    {/* Gradient header */}
                    <div className={cn('h-2 bg-gradient-to-r', color.bg)} />
                    
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar with status indicator */}
                        <div className="relative">
                          <div className={cn(
                            'w-12 h-12 rounded-full flex items-center justify-center text-2xl',
                            color.light
                          )}>
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          {progress.status === 'working' && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
                          )}
                          {progress.status === 'completed' && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{displayName}</p>
                          <p className={cn('text-sm', color.text)}>
                            {progress.status === 'working' ? 'En cours...' : 
                             progress.status === 'completed' ? 'Terminé' : 'En attente'}
                          </p>
                        </div>
                        
                        {/* Count badge */}
                        <div className={cn(
                          'text-2xl font-bold',
                          color.text
                        )}>
                          {progress.count}
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{progress.count} idées</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn('h-full bg-gradient-to-r transition-all duration-500', color.bg)}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Debug Logs (collapsible) */}
            {isGenerating && debugLogs.length > 0 && (
              <details className="text-xs border rounded-lg p-2 bg-muted/30">
                <summary className="cursor-pointer font-medium">Debug Logs ({debugLogs.length})</summary>
                <div className="mt-2 max-h-32 overflow-y-auto space-y-0.5 font-mono">
                  {debugLogs.map((log, i) => (
                    <p key={i} className="text-muted-foreground">{log}</p>
                  ))}
                </div>
              </details>
            )}

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

            {/* Stats - Enhanced Design */}
            {ideas.length > 0 && !isGenerating && (
              <div className="rounded-xl border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
                <div className="px-4 py-3 border-b bg-white/50 dark:bg-black/20">
                  <h4 className="font-semibold flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-primary" />
                    Récapitulatif de la Session
                  </h4>
                </div>
                
                <div className="p-4 space-y-4">
                  {/* Summary cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                      <p className="text-3xl font-bold text-primary">{ideas.length}</p>
                      <p className="text-xs text-muted-foreground">Idées générées</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                      <p className="text-3xl font-bold text-emerald-600">{Object.keys(agentProgress).length}</p>
                      <p className="text-xs text-muted-foreground">Agents actifs</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                      <p className="text-3xl font-bold text-amber-600">
                        {Math.round(ideas.length / Math.max(1, Object.keys(agentProgress).length))}
                      </p>
                      <p className="text-xs text-muted-foreground">Moy. par agent</p>
                    </div>
                  </div>
                  
                  {/* Agent contributions chart */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Contribution par agent</p>
                    {Object.entries(agentProgress).map(([agentKey, progress], index) => {
                      const agentColors = [
                        'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 
                        'bg-blue-500', 'bg-rose-500'
                      ];
                      const color = agentColors[index % agentColors.length];
                      const percentage = ideas.length > 0 ? Math.round((progress.count / ideas.length) * 100) : 0;
                      
                      return (
                        <div key={agentKey} className="flex items-center gap-3">
                          <div className="w-20 text-sm font-medium truncate">{agentKey}</div>
                          <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={cn('h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2', color)}
                              style={{ width: `${Math.max(percentage, 10)}%` }}
                            >
                              <span className="text-xs font-semibold text-white">{progress.count}</span>
                            </div>
                          </div>
                          <div className="w-12 text-right text-sm text-muted-foreground">{percentage}%</div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Session info */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t">
                    <Badge variant="outline" className="gap-1">
                      <RefreshCw className="w-3 h-3" />
                      {TECHNIQUES.find((t) => t.id === technique)?.name}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      {mode === 'parallel' ? <Zap className="w-3 h-3" /> : 
                       mode === 'sequence' ? <ArrowRight className="w-3 h-3" /> : 
                       <MessageSquare className="w-3 h-3" />}
                      {MODES.find((m) => m.id === mode)?.name}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Target className="w-3 h-3" />
                      Objectif: {targetCount}
                    </Badge>
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
                  <>
                    <Spinner size="sm" />
                    Transition...
                  </>
                ) : (
                  <>
                    Avancer vers Phase 3: Voting
                    <Target className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
