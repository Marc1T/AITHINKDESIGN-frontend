/**
 * Phase 4 - TRIZ
 * TRIZ analysis and enriched brief creation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Badge } from '@kit/ui/badge';
import { cn } from '@kit/ui/utils';
import { AGENT_PERSONALITIES, type Workshop, type SSEEvent, type Idea, type TRIZAnalysis } from '../../_lib/types';
import { phase3Api, phase4Api } from '../../_lib/api';
import { IdeaCardCompact } from '../../_components/idea-card';
import { AgentAvatar } from '../../_components/agent-card';

interface Phase4Props {
  workshop: Workshop;
  workshopId: string;
  onAdvancePhase: (phase: number) => void;
  isAdvancing: boolean;
  sseEvents: SSEEvent[];
  refetch: () => void;
}

export default function Phase4TRIZ({
  workshop,
  workshopId,
  onAdvancePhase,
  isAdvancing,
  sseEvents,
  refetch,
}: Phase4Props) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedIdeas, setSelectedIdeas] = useState<Idea[]>([]);
  const [trizResults, setTrizResults] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [ideaProgress, setIdeaProgress] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<'review' | 'analyzing' | 'results'>('review');
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [processedEventCount, setProcessedEventCount] = useState(0);
  const [phaseCompleteReceived, setPhaseCompleteReceived] = useState(false);

  // Load selected ideas on mount
  useEffect(() => {
    loadSelectedIdeas();
    // Check if already completed
    loadExistingResults();
  }, [workshopId]);

  const loadSelectedIdeas = async () => {
    try {
      const result = await phase3Api.getSelectedIdeas(workshopId);
      if (result.data && Array.isArray(result.data)) {
        const ideas = result.data as Idea[];
        setSelectedIdeas(ideas);
        if (ideas.length > 0) {
          setSelectedIdeaId(ideas[0]!.id);
        }
      }
    } catch (err) {
      console.error('Failed to load selected ideas:', err);
    }
  };

  // Load existing TRIZ results if already completed
  const loadExistingResults = async () => {
    try {
      const result = await phase4Api.getResults(workshopId);
      if (result.data && result.data.analyses && Object.keys(result.data.analyses).length > 0) {
        console.log('📊 Loaded existing TRIZ results:', result.data);
        setTrizResults(result.data.analyses);
        setPhase('results');
      }
    } catch (err) {
      console.error('Failed to load existing results:', err);
    }
  };

  // Process SSE events
  useEffect(() => {
    if (sseEvents.length <= processedEventCount) return;
    
    // Process all new events
    for (let i = processedEventCount; i < sseEvents.length; i++) {
      const event = sseEvents[i];
      if (!event) continue;
      
      console.log('📡 Phase 4 SSE event:', event.type, event);

      switch (event.type) {
        case 'phase_started':
          setPhase('analyzing');
          break;
        case 'triz_started':
          if (event.idea_id) {
            setIdeaProgress((prev) => ({ ...prev, [event.idea_id!]: 'analyzing' }));
          }
          break;
        case 'triz_contradiction':
          // Optional: show live contradictions
          break;
        case 'triz_principle':
          // Optional: show live principles
          break;
        case 'triz_analysis_complete':
          if (event.idea_id) {
            setIdeaProgress((prev) => ({ ...prev, [event.idea_id!]: 'completed' }));
          }
          break;
        case 'phase_complete':
          console.log('✅ Phase 4 complete, loading results...');
          setPhaseCompleteReceived(true);
          setIsAnalyzing(false);
          break;
      }
    }
    
    setProcessedEventCount(sseEvents.length);
  }, [sseEvents, processedEventCount]);

  // Load results when phase complete
  useEffect(() => {
    if (phaseCompleteReceived && phase === 'analyzing') {
      loadExistingResults();
    }
  }, [phaseCompleteReceived, phase]);

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    setPhase('analyzing');

    // Initialize idea progress
    const initialProgress: Record<string, string> = {};
    selectedIdeas.forEach((idea) => {
      initialProgress[idea.id] = 'pending';
    });
    setIdeaProgress(initialProgress);

    try {
      const result = await phase4Api.analyze(workshopId);
      if (result.error) {
        setError(typeof result.error === 'string' ? result.error : result.error.message || 'Erreur');
        setPhase('review');
        setIsAnalyzing(false);
        return;
      }
      // SSE events will handle the rest
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      setPhase('review');
      setIsAnalyzing(false);
    }
  };

  const analysisComplete = Object.keys(ideaProgress).length > 0 && 
    Object.values(ideaProgress).every((s) => s === 'completed');

  // Transition to results when complete
  useEffect(() => {
    if (analysisComplete && Object.keys(trizResults).length > 0 && phase === 'analyzing') {
      setPhase('results');
    }
  }, [analysisComplete, trizResults, phase]);

  // Get current idea's TRIZ analysis
  const currentAnalysis = selectedIdeaId ? trizResults[selectedIdeaId] : null;

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="text-xl flex items-center gap-2">
          🔧 Phase 4 - Analyse TRIZ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg text-red-600">
            ❌ {error}
          </div>
        )}

        {/* Review Selected Ideas */}
        {phase === 'review' && (
          <>
            <div className="space-y-4">
              <h3 className="font-semibold">📋 Idées Sélectionnées</h3>
              <p className="text-muted-foreground">
                Ces {selectedIdeas.length} idées vont être analysées avec la méthode TRIZ
              </p>
              <div className="space-y-3">
                {selectedIdeas.map((idea, i) => (
                  <IdeaCardCompact
                    key={idea.id}
                    idea={idea}
                    rank={i + 1}
                  />
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <h4 className="font-medium">🔧 Qu'est-ce que TRIZ ?</h4>
              <p className="text-sm text-muted-foreground">
                TRIZ (Théorie de Résolution de Problèmes Inventifs) identifie les contradictions 
                techniques et suggère des principes d'innovation pour les résoudre. L'analyse 
                va produire un Brief Enrichi pour chaque idée.
              </p>
            </div>

            <Button size="lg" onClick={handleStartAnalysis} disabled={isAnalyzing} className="w-full gap-2">
              {isAnalyzing ? '⏳ Démarrage...' : '🔬 Lancer l\'Analyse TRIZ'}
            </Button>
          </>
        )}

        {/* Analysis in Progress */}
        {phase === 'analyzing' && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">🔬 Analyse en Cours...</h3>
              <Badge variant="secondary">
                {Object.values(ideaProgress).filter((s) => s === 'completed').length}/
                {selectedIdeas.length}
              </Badge>
            </div>

            {/* Idea Progress */}
            <div className="space-y-3">
              {selectedIdeas.map((idea) => {
                const status = ideaProgress[idea.id] || 'pending';
                return (
                  <div
                    key={idea.id}
                    className={cn(
                      'p-4 rounded-lg flex items-center gap-3',
                      status === 'analyzing' ? 'bg-purple-100 dark:bg-purple-900 animate-pulse' :
                      status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900' :
                      'bg-muted'
                    )}
                  >
                    <div className="text-2xl">
                      {status === 'completed' ? '✅' : status === 'analyzing' ? '🔍' : '⏳'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{idea.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {status === 'completed' ? '✓ Analyse terminée' : 
                         status === 'analyzing' ? 'Analyse TRIZ en cours...' : 
                         'En attente'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <p className="font-medium">🔧 Analyse TRIZ en cours</p>
              <p className="text-sm text-muted-foreground">
                Identification des contradictions techniques et application des principes TRIZ...
              </p>
            </div>
          </>
        )}

        {/* Results Phase */}
        {phase === 'results' && Object.keys(trizResults).length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">🔧 Analyse TRIZ Terminée</h3>
              <Badge>✅ {Object.keys(trizResults).length} idées analysées</Badge>
            </div>

            {/* Tabs for each idea */}
            <div className="flex gap-2 flex-wrap">
              {selectedIdeas.map((idea) => (
                <Button
                  key={idea.id}
                  variant={selectedIdeaId === idea.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedIdeaId(idea.id)}
                >
                  {idea.title.substring(0, 30)}{idea.title.length > 30 ? '...' : ''}
                </Button>
              ))}
            </div>

            {/* TRIZ Results for Selected Idea */}
            {currentAnalysis && (
              <div className="space-y-4">
                {/* Idea Header */}
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium">{currentAnalysis.idea_title}</h4>
                  {currentAnalysis.triz_applied === false && (
                    <Badge variant="secondary" className="mt-1">TRIZ non applicable</Badge>
                  )}
                </div>

                {/* Contradictions */}
                <div className="p-4 rounded-lg border bg-card">
                  <h4 className="font-medium mb-2">⚡ Contradictions Identifiées ({currentAnalysis.contradictions?.length || 0})</h4>
                  <div className="space-y-2">
                    {currentAnalysis.contradictions?.length > 0 ? (
                      currentAnalysis.contradictions.map((c: any, i: number) => (
                        <div key={i} className="p-3 rounded bg-muted/50">
                          <p className="font-medium text-sm">
                            {c.parameter_1} vs {c.parameter_2}
                          </p>
                          <p className="text-sm text-muted-foreground">{c.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">Aucune contradiction majeure identifiée</p>
                    )}
                  </div>
                </div>

                {/* TRIZ Principles */}
                <div className="p-4 rounded-lg border bg-card">
                  <h4 className="font-medium mb-2">💡 Principes TRIZ Suggérés</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentAnalysis.suggested_principles?.length > 0 ? (
                      currentAnalysis.suggested_principles.map((p: number, i: number) => (
                        <Badge key={i} variant="secondary" className="py-1">
                          Principe #{p}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">Aucun principe suggéré</p>
                    )}
                  </div>
                </div>

                {/* Enriched Brief */}
                <div className="p-4 rounded-lg border bg-card">
                  <h4 className="font-medium mb-2">📝 Brief Enrichi</h4>
                  <p className="text-sm whitespace-pre-wrap">
                    {currentAnalysis.enriched_brief || currentAnalysis.idea_description || 'Brief non disponible'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button
                size="lg"
                onClick={() => onAdvancePhase(5)}
                disabled={isAdvancing}
                className="gap-2"
              >
                {isAdvancing ? (
                  <><span className="animate-spin">⏳</span> Transition...</>
                ) : (
                  <>Passer à la Sélection Finale 🏆</>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
