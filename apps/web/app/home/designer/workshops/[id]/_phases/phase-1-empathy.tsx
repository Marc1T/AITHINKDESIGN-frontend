/**
 * Phase 1 - Empathy
 * Empathy Map, Customer Journey, HMW Questions
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { Textarea } from '@kit/ui/textarea';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Badge } from '@kit/ui/badge';
import { AGENT_PERSONALITIES, type Workshop, type SSEEvent, type EmpathyMap, type HMWQuestion } from '../../_lib/types';
import { phase1Api } from '../../_lib/api';

interface Phase1Props {
  workshop: Workshop;
  workshopId: string;
  onAdvancePhase: (phase: number) => void;
  isAdvancing: boolean;
  sseEvents: SSEEvent[];
  refetch: () => void;
}

type Tab = 'empathy-map' | 'journey' | 'hmw';
type AgentStatus = 'idle' | 'working' | 'completed';

interface AgentProgress {
  [agentId: string]: {
    status: AgentStatus;
    contributions: number;
  };
}

export default function Phase1Empathy({
  workshop,
  workshopId,
  onAdvancePhase,
  isAdvancing,
  sseEvents,
}: Phase1Props) {
  const [activeTab, setActiveTab] = useState<Tab>('empathy-map');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for persona
  const [personaDescription, setPersonaDescription] = useState('');
  const [personaContext, setPersonaContext] = useState('');
  const [personaNeeds, setPersonaNeeds] = useState('');

  // Results state
  const [empathyMap, setEmpathyMap] = useState<EmpathyMap | null>(null);
  const [customerJourney, setCustomerJourney] = useState<any[]>([]);
  const [hmwQuestions, setHmwQuestions] = useState<HMWQuestion[]>([]);

  // Agent progress
  const [agentProgress, setAgentProgress] = useState<AgentProgress>({});

  // Tab completion status
  const [tabStatus, setTabStatus] = useState({
    'empathy-map': false,
    'journey': false,
    'hmw': false,
  });

  // Process SSE events for real-time updates
  useEffect(() => {
    const latestEvent = sseEvents[sseEvents.length - 1];
    if (!latestEvent) return;

    switch (latestEvent.type) {
      case 'agent_started':
        if (latestEvent.agent_id) {
          setAgentProgress((prev) => ({
            ...prev,
            [latestEvent.agent_id!]: { status: 'working', contributions: 0 },
          }));
        }
        break;
      case 'agent_complete':
        if (latestEvent.agent_id) {
          setAgentProgress((prev) => {
            const existing = prev[latestEvent.agent_id!];
            return {
              ...prev,
              [latestEvent.agent_id!]: {
                status: 'completed' as const,
                contributions: existing?.contributions ?? 0,
              },
            };
          });
        }
        break;
      case 'empathy_contribution':
        // Real-time empathy map update from SSE
        if (latestEvent.data?.contribution) {
          const contribution = latestEvent.data.contribution as EmpathyMap;
          setEmpathyMap((prev) => {
            const base = prev || { says: [], thinks: [], does: [], feels: [] };
            return {
              says: [...base.says, ...(contribution.says || []).map((c: any) => ({ 
                id: crypto.randomUUID(), 
                content: typeof c === 'string' ? c : c.content,
                agent_id: latestEvent.agent_id || '',
                created_at: new Date().toISOString() 
              }))],
              thinks: [...base.thinks, ...(contribution.thinks || []).map((c: any) => ({ 
                id: crypto.randomUUID(), 
                content: typeof c === 'string' ? c : c.content,
                agent_id: latestEvent.agent_id || '',
                created_at: new Date().toISOString() 
              }))],
              does: [...base.does, ...(contribution.does || []).map((c: any) => ({ 
                id: crypto.randomUUID(), 
                content: typeof c === 'string' ? c : c.content,
                agent_id: latestEvent.agent_id || '',
                created_at: new Date().toISOString() 
              }))],
              feels: [...base.feels, ...(contribution.feels || []).map((c: any) => ({ 
                id: crypto.randomUUID(), 
                content: typeof c === 'string' ? c : c.content,
                agent_id: latestEvent.agent_id || '',
                created_at: new Date().toISOString() 
              }))],
            };
          });
        }
        break;
      case 'journey_stage':
        // Real-time journey stage update - backend sends { stage: {...} }
        if (latestEvent.data?.stage) {
          setCustomerJourney((prev) => {
            const stage = latestEvent.data.stage;
            // Avoid duplicates by stage name
            const exists = prev.some((s: any) => s.name === stage.name);
            if (exists) return prev;
            return [...prev, stage];
          });
        }
        break;
      case 'hmw_question':
        if (latestEvent.data?.question) {
          setHmwQuestions((prev) => [...prev, {
            id: crypto.randomUUID(),
            question: latestEvent.data.question,
            agent_ids: [latestEvent.agent_id || ''],
          }]);
        }
        break;
    }
  }, [sseEvents]);

  const handleStartEmpathyMap = async () => {
    if (!personaDescription.trim()) {
      setError('Veuillez décrire votre persona utilisateur');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setEmpathyMap(null); // Reset previous data

    // Initialize agent progress
    const initialProgress: AgentProgress = {};
    workshop.agent_personalities?.forEach((id) => {
      initialProgress[id] = { status: 'idle', contributions: 0 };
    });
    setAgentProgress(initialProgress);

    try {
      const result = await phase1Api.startEmpathyMap(workshopId, {
        description: personaDescription,
        context: personaContext || undefined,
        needs: personaNeeds ? personaNeeds.split(',').map((n) => n.trim()) : undefined,
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      // Use the data returned from API
      const data = result.data as { empathy_map?: Record<string, any[]> } | undefined;
      if (data?.empathy_map) {
        const em = data.empathy_map;
        setEmpathyMap({
          says: (em.says || []).map((item: any) => ({
            id: typeof item === 'string' ? crypto.randomUUID() : item.id || crypto.randomUUID(),
            content: typeof item === 'string' ? item : item.content,
            agent_id: typeof item === 'string' ? '' : item.agent_id || '',
            created_at: new Date().toISOString(),
          })),
          thinks: (em.thinks || []).map((item: any) => ({
            id: typeof item === 'string' ? crypto.randomUUID() : item.id || crypto.randomUUID(),
            content: typeof item === 'string' ? item : item.content,
            agent_id: typeof item === 'string' ? '' : item.agent_id || '',
            created_at: new Date().toISOString(),
          })),
          does: (em.does || []).map((item: any) => ({
            id: typeof item === 'string' ? crypto.randomUUID() : item.id || crypto.randomUUID(),
            content: typeof item === 'string' ? item : item.content,
            agent_id: typeof item === 'string' ? '' : item.agent_id || '',
            created_at: new Date().toISOString(),
          })),
          feels: (em.feels || []).map((item: any) => ({
            id: typeof item === 'string' ? crypto.randomUUID() : item.id || crypto.randomUUID(),
            content: typeof item === 'string' ? item : item.content,
            agent_id: typeof item === 'string' ? '' : item.agent_id || '',
            created_at: new Date().toISOString(),
          })),
        });
      }

      // Mark empathy map as complete
      setTabStatus((prev) => ({ ...prev, 'empathy-map': true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'analyse');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartJourney = async () => {
    setIsAnalyzing(true);
    setCustomerJourney([]); // Reset
    try {
      const result = await phase1Api.startCustomerJourney(workshopId);
      
      if (result.error) {
        setError(result.error.message);
        return;
      }

      // Use the data returned from API
      // Backend returns { customer_journey: { stages: [...] } }
      const data = result.data as { customer_journey?: { stages?: any[] } | any[] } | undefined;
      if (data?.customer_journey) {
        // Handle both formats: { stages: [...] } or direct array
        const stages = Array.isArray(data.customer_journey) 
          ? data.customer_journey 
          : data.customer_journey.stages || [];
        setCustomerJourney(stages);
      }
      
      setTabStatus((prev) => ({ ...prev, 'journey': true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartHMW = async () => {
    setIsAnalyzing(true);
    setHmwQuestions([]); // Reset
    try {
      const result = await phase1Api.startHMW(workshopId);
      
      if (result.error) {
        setError(result.error.message);
        return;
      }

      // Use the data returned from API
      const data = result.data as { hmw_questions?: any[] } | undefined;
      if (data?.hmw_questions) {
        const questions = data.hmw_questions;
        setHmwQuestions(questions.map((q: any) => ({
          id: q.id || crypto.randomUUID(),
          question: q.question || q,
          agent_ids: q.agent_ids || [q.agent_id || ''],
        })));
      }
      
      setTabStatus((prev) => ({ ...prev, 'hmw': true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const allTabsComplete = tabStatus['empathy-map'] && tabStatus['journey'] && tabStatus['hmw'];

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-t-lg">
        <CardTitle className="text-xl flex items-center gap-2">
          🎭 Phase 1 - Empathy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Error display */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
            ❌ {error}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="empathy-map" className="gap-2">
              Empathy Map {tabStatus['empathy-map'] && '✓'}
            </TabsTrigger>
            <TabsTrigger value="journey" className="gap-2">
              Journey {tabStatus['journey'] && '✓'}
            </TabsTrigger>
            <TabsTrigger value="hmw" className="gap-2">
              HMW {tabStatus['hmw'] && '✓'}
            </TabsTrigger>
          </TabsList>

          {/* Empathy Map Tab */}
          <TabsContent value="empathy-map" className="space-y-6 pt-4">
            {!tabStatus['empathy-map'] ? (
              <>
                <div className="space-y-4">
                  <h3 className="font-semibold">👤 Décrivez votre persona utilisateur</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="persona-desc">Description du persona *</Label>
                    <Textarea
                      id="persona-desc"
                      placeholder="Jeune actif urbain, 25-35 ans, locataire d'un petit appartement..."
                      value={personaDescription}
                      onChange={(e) => setPersonaDescription(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="persona-context">Contexte (optionnel)</Label>
                    <Input
                      id="persona-context"
                      placeholder="Petit appartement 35m², cherche à optimiser l'espace..."
                      value={personaContext}
                      onChange={(e) => setPersonaContext(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="persona-needs">Besoins principaux (séparés par virgule)</Label>
                    <Input
                      id="persona-needs"
                      placeholder="Installation sans traces, Design minimaliste, Prix abordable"
                      value={personaNeeds}
                      onChange={(e) => setPersonaNeeds(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleStartEmpathyMap}
                  disabled={isAnalyzing || !personaDescription.trim()}
                  className="w-full"
                >
                  {isAnalyzing ? '⏳ Analyse en cours...' : '🚀 Lancer l\'analyse'}
                </Button>
              </>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">🎭 Empathy Map Complète</h3>
                  <Badge variant="secondary">✅ Terminé</Badge>
                </div>

                {/* Empathy Map Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {(['says', 'thinks', 'does', 'feels'] as const).map((category) => {
                    const icons = { says: '💬', thinks: '💭', does: '🏃', feels: '❤️' };
                    const titles = { says: 'Dit', thinks: 'Pense', does: 'Fait', feels: 'Ressent' };
                    const items = empathyMap?.[category] || [];
                    
                    return (
                      <div key={category} className="p-4 rounded-lg bg-muted/50 space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          {icons[category]} {titles[category].toUpperCase()} ({items.length})
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {items.slice(0, 5).map((item) => (
                            <li key={item.id} className="flex items-start gap-2">
                              <span>•</span>
                              <span>{item.content}</span>
                            </li>
                          ))}
                          {items.length > 5 && (
                            <li className="text-muted-foreground">[+{items.length - 5} autres]</li>
                          )}
                        </ul>
                      </div>
                    );
                  })}
                </div>

                <Button onClick={() => setActiveTab('journey')} className="w-full">
                  Passer au Customer Journey →
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Customer Journey Tab */}
          <TabsContent value="journey" className="space-y-6 pt-4">
            {!tabStatus['journey'] ? (
              <div className="text-center py-8 space-y-4">
                <div className="text-4xl">🗺️</div>
                <h3 className="font-semibold">Customer Journey Map</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Les agents vont créer une carte du parcours client avec les touchpoints, émotions et pain points.
                </p>
                <Button onClick={handleStartJourney} disabled={isAnalyzing}>
                  {isAnalyzing ? '⏳ Génération...' : '🚀 Générer le Journey'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">🗺️ Customer Journey ({customerJourney.length} étapes)</h3>
                  <Badge variant="secondary">✅ Terminé</Badge>
                </div>
                
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {customerJourney.length > 0 ? (
                    customerJourney.map((stage: any, i) => (
                      <div key={stage.id || i} className="min-w-[220px] p-4 rounded-lg bg-muted/50 space-y-3">
                        <h4 className="font-medium">{i + 1}. {stage.name || stage.stage_name || `Étape ${i + 1}`}</h4>
                        
                        {stage.touchpoints && stage.touchpoints.length > 0 && (
                          <div className="text-xs space-y-1">
                            <p className="font-medium">🔍 Touchpoints</p>
                            <ul className="pl-2 space-y-0.5">
                              {stage.touchpoints.slice(0, 3).map((tp: string, j: number) => (
                                <li key={j} className="text-muted-foreground">• {tp}</li>
                              ))}
                              {stage.touchpoints.length > 3 && (
                                <li className="text-muted-foreground italic">+{stage.touchpoints.length - 3} autres</li>
                              )}
                            </ul>
                          </div>
                        )}
                        
                        {stage.emotions && stage.emotions.length > 0 && (
                          <div className="text-xs space-y-1">
                            <p className="font-medium">😊 Émotions</p>
                            <p className="text-muted-foreground">{stage.emotions.slice(0, 3).join(', ')}</p>
                          </div>
                        )}
                        
                        {stage.pain_points && stage.pain_points.length > 0 && (
                          <div className="text-xs space-y-1">
                            <p className="font-medium">⚠️ Pain Points</p>
                            <ul className="pl-2 space-y-0.5">
                              {stage.pain_points.slice(0, 2).map((pp: string, j: number) => (
                                <li key={j} className="text-muted-foreground">• {pp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    // Fallback placeholder stages
                    ['Découverte', 'Recherche', 'Comparaison', 'Achat', 'Installation'].map((step, i) => (
                      <div key={step} className="min-w-[200px] p-4 rounded-lg bg-muted/50 space-y-2">
                        <h4 className="font-medium">{i + 1}. {step}</h4>
                        <div className="text-xs space-y-1">
                          <p className="text-muted-foreground">🔍 Touchpoints</p>
                          <p className="text-muted-foreground">😊 Émotions</p>
                          <p className="text-muted-foreground">⚠️ Pain Points</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Button onClick={() => setActiveTab('hmw')} className="w-full">
                  Passer aux HMW Questions →
                </Button>
              </div>
            )}
          </TabsContent>

          {/* HMW Tab */}
          <TabsContent value="hmw" className="space-y-6 pt-4">
            {!tabStatus['hmw'] ? (
              <div className="text-center py-8 space-y-4">
                <div className="text-4xl">❓</div>
                <h3 className="font-semibold">How Might We Questions</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Les agents vont formuler des questions "Comment pourrions-nous..." pour guider l'idéation.
                </p>
                <Button onClick={handleStartHMW} disabled={isAnalyzing}>
                  {isAnalyzing ? '⏳ Génération...' : '🚀 Générer les questions'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">❓ How Might We Questions</h3>
                  <Badge variant="secondary">✅ Terminé</Badge>
                </div>

                <div className="space-y-3">
                  {hmwQuestions.map((q, i) => {
                    const agentId = q.agent_ids?.[0];
                    const agent = agentId ? AGENT_PERSONALITIES[agentId] : undefined;
                    return (
                      <div key={q.id} className="p-4 rounded-lg bg-muted/50">
                        <p className="font-medium">{i + 1}. {q.question}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {agent && <span className="text-sm">{agent.icon} {agent.name}</span>}
                        </div>
                      </div>
                    );
                  })}
                  {hmwQuestions.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Les questions seront générées ici...
                    </p>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Agent Progress */}
        {isAnalyzing && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="text-sm font-medium">Progression des agents</h4>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(agentProgress).map(([agentId, progress]) => {
                const agent = AGENT_PERSONALITIES[agentId];
                return agent ? (
                  <div
                    key={agentId}
                    className={`p-2 rounded-lg text-center text-sm ${
                      progress.status === 'working' ? 'bg-blue-100 dark:bg-blue-900 animate-pulse' :
                      progress.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900' :
                      'bg-muted'
                    }`}
                  >
                    <span>{agent.icon}</span>
                    <span className="ml-1">{agent.name}</span>
                    {progress.status === 'completed' && <span className="ml-1">✓</span>}
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Advance to Phase 2 */}
        {allTabsComplete && (
          <div className="pt-6 border-t">
            <Button
              size="lg"
              onClick={() => onAdvancePhase(2)}
              disabled={isAdvancing}
              className="w-full gap-2"
            >
              {isAdvancing ? (
                <><span className="animate-spin">⏳</span> Transition...</>
              ) : (
                <>Avancer vers Phase 2: Ideation 💡</>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
