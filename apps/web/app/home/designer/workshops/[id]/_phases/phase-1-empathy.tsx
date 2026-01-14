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
import {
  AgentAvatarIcon,
  Spinner,
  HeartHandshake,
  User,
  MessageCircle,
  Brain,
  Activity,
  Heart,
  Map,
  HelpCircle,
  Rocket,
  CheckCircle2,
  XCircle,
  MapPin,
  Smile,
  AlertTriangle,
  ArrowRight,
  Check,
  Lightbulb,
  ChevronDown,
  Edit3,
  Trash2,
  Plus,
} from '../../_lib/icons';

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

  // Expanded sections state for viewing all items
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  // Editing state
  const [editingItem, setEditingItem] = useState<{ category: string; id: string; content: string } | null>(null);
  const [newItemContent, setNewItemContent] = useState('');
  const [addingToCategory, setAddingToCategory] = useState<string | null>(null);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Handle editing an empathy map item
  const handleEditItem = (category: 'says' | 'thinks' | 'does' | 'feels', id: string, newContent: string) => {
    if (!empathyMap || !newContent.trim()) return;
    
    setEmpathyMap(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [category]: prev[category].map(item => 
          item.id === id ? { ...item, content: newContent.trim() } : item
        )
      };
    });
    setEditingItem(null);
  };

  // Handle deleting an empathy map item
  const handleDeleteItem = (category: 'says' | 'thinks' | 'does' | 'feels', id: string) => {
    if (!empathyMap) return;
    
    setEmpathyMap(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [category]: prev[category].filter(item => item.id !== id)
      };
    });
  };

  // Handle adding a new empathy map item
  const handleAddItem = (category: 'says' | 'thinks' | 'does' | 'feels') => {
    if (!empathyMap || !newItemContent.trim()) return;
    
    const newItem = {
      id: crypto.randomUUID(),
      content: newItemContent.trim(),
      agent_id: 'user',
      created_at: new Date().toISOString(),
    };
    
    setEmpathyMap(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [category]: [...prev[category], newItem]
      };
    });
    setNewItemContent('');
    setAddingToCategory(null);
  };

  // HMW Questions editing state
  const [editingHmw, setEditingHmw] = useState<{ id: string; question: string } | null>(null);
  const [newHmwQuestion, setNewHmwQuestion] = useState('');
  const [isAddingHmw, setIsAddingHmw] = useState(false);

  // Handle editing an HMW question
  const handleEditHmw = (id: string, newQuestion: string) => {
    if (!newQuestion.trim()) return;
    setHmwQuestions(prev => 
      prev.map(q => q.id === id ? { ...q, question: newQuestion.trim() } : q)
    );
    setEditingHmw(null);
  };

  // Handle deleting an HMW question
  const handleDeleteHmw = (id: string) => {
    setHmwQuestions(prev => prev.filter(q => q.id !== id));
  };

  // Handle adding a new HMW question
  const handleAddHmw = () => {
    if (!newHmwQuestion.trim()) return;
    const newItem: HMWQuestion = {
      id: crypto.randomUUID(),
      question: newHmwQuestion.trim(),
      agent_ids: ['user'],
    };
    setHmwQuestions(prev => [...prev, newItem]);
    setNewHmwQuestion('');
    setIsAddingHmw(false);
  };

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
          <HeartHandshake className="w-5 h-5" />
          Phase 1 - Empathy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Error display */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="empathy-map" className="gap-2">
              Empathy Map {tabStatus['empathy-map'] && <Check className="w-3 h-3" />}
            </TabsTrigger>
            <TabsTrigger value="journey" className="gap-2">
              Journey {tabStatus['journey'] && <Check className="w-3 h-3" />}
            </TabsTrigger>
            <TabsTrigger value="hmw" className="gap-2">
              HMW {tabStatus['hmw'] && <Check className="w-3 h-3" />}
            </TabsTrigger>
          </TabsList>

          {/* Empathy Map Tab */}
          <TabsContent value="empathy-map" className="space-y-6 pt-4">
            {!tabStatus['empathy-map'] ? (
              <>
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Décrivez votre persona utilisateur
                  </h3>
                  
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
                  className="w-full gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Spinner size="sm" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" />
                      Lancer l'analyse
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4" />
                    Empathy Map Complète
                  </h3>
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Terminé
                  </Badge>
                </div>

                {/* Empathy Map Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {(['says', 'thinks', 'does', 'feels'] as const).map((category) => {
                    const IconMap = { says: MessageCircle, thinks: Brain, does: Activity, feels: Heart };
                    const titles = { says: 'Dit', thinks: 'Pense', does: 'Fait', feels: 'Ressent' };
                    const IconComponent = IconMap[category];
                    const items = empathyMap?.[category] || [];
                    const isExpanded = expandedSections[category];
                    const displayedItems = isExpanded ? items : items.slice(0, 5);
                    
                    return (
                      <div key={category} className="p-4 rounded-lg bg-muted/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            {titles[category].toUpperCase()} ({items.length})
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAddingToCategory(addingToCategory === category ? null : category)}
                            className="h-6 w-6 p-0"
                            title="Ajouter un élément"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        {/* Add new item form */}
                        {addingToCategory === category && (
                          <div className="flex gap-2 mb-2">
                            <Input
                              value={newItemContent}
                              onChange={(e) => setNewItemContent(e.target.value)}
                              placeholder="Nouveau contenu..."
                              className="text-sm h-8"
                              onKeyDown={(e) => e.key === 'Enter' && handleAddItem(category)}
                            />
                            <Button size="sm" onClick={() => handleAddItem(category)} className="h-8">
                              <Check className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                        
                        <ul className="space-y-1 text-sm">
                          {displayedItems.map((item) => (
                            <li key={item.id} className="group flex items-start gap-2">
                              {editingItem?.id === item.id ? (
                                <div className="flex-1 flex gap-1">
                                  <Input
                                    value={editingItem.content}
                                    onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                                    className="text-sm h-7 flex-1"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleEditItem(category, item.id, editingItem.content);
                                      if (e.key === 'Escape') setEditingItem(null);
                                    }}
                                  />
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleEditItem(category, item.id, editingItem.content)}>
                                    <Check className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <span>•</span>
                                  <span className="flex-1">{item.content}</span>
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <button
                                      onClick={() => setEditingItem({ category, id: item.id, content: item.content })}
                                      className="text-muted-foreground hover:text-foreground p-0.5"
                                      title="Modifier"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteItem(category, item.id)}
                                      className="text-muted-foreground hover:text-red-500 p-0.5"
                                      title="Supprimer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </li>
                          ))}
                        </ul>
                        
                        {items.length > 5 && (
                          <button
                            onClick={() => toggleSection(category)}
                            className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
                          >
                            <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            {isExpanded ? 'Réduire' : `Voir ${items.length - 5} autres`}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <Button onClick={() => setActiveTab('journey')} className="w-full gap-2">
                  Passer au Customer Journey
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Customer Journey Tab */}
          <TabsContent value="journey" className="space-y-6 pt-4">
            {!tabStatus['journey'] ? (
              <div className="text-center py-8 space-y-4">
                <div className="flex justify-center">
                  <Map className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">Customer Journey Map</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Les agents vont créer une carte du parcours client avec les touchpoints, émotions et pain points.
                </p>
                <Button onClick={handleStartJourney} disabled={isAnalyzing} className="gap-2">
                  {isAnalyzing ? (
                    <>
                      <Spinner size="sm" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" />
                      Générer le Journey
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    Customer Journey ({customerJourney.length} étapes)
                  </h3>
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Terminé
                  </Badge>
                </div>
                
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {customerJourney.length > 0 ? (
                    customerJourney.map((stage: any, i) => {
                      const stageKey = `journey-${i}`;
                      const isStageExpanded = expandedSections[stageKey];
                      
                      return (
                        <div key={stage.id || i} className="min-w-[250px] max-w-[300px] p-4 rounded-lg bg-muted/50 space-y-3 flex-shrink-0">
                          <h4 className="font-medium">{i + 1}. {stage.name || stage.stage_name || `Étape ${i + 1}`}</h4>
                          
                          {stage.touchpoints && stage.touchpoints.length > 0 && (
                            <div className="text-xs space-y-1">
                              <p className="font-medium flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                Touchpoints ({stage.touchpoints.length})
                              </p>
                              <ul className="pl-2 space-y-0.5">
                                {(isStageExpanded ? stage.touchpoints : stage.touchpoints.slice(0, 3)).map((tp: string, j: number) => (
                                  <li key={j} className="text-muted-foreground">• {tp}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {stage.emotions && stage.emotions.length > 0 && (
                            <div className="text-xs space-y-1">
                              <p className="font-medium flex items-center gap-1">
                                <Smile className="w-3 h-3" />
                                Émotions ({stage.emotions.length})
                              </p>
                              <p className="text-muted-foreground">
                                {isStageExpanded 
                                  ? stage.emotions.join(', ') 
                                  : stage.emotions.slice(0, 3).join(', ') + (stage.emotions.length > 3 ? '...' : '')}
                              </p>
                            </div>
                          )}
                          
                          {stage.pain_points && stage.pain_points.length > 0 && (
                            <div className="text-xs space-y-1">
                              <p className="font-medium flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Pain Points ({stage.pain_points.length})
                              </p>
                              <ul className="pl-2 space-y-0.5">
                                {(isStageExpanded ? stage.pain_points : stage.pain_points.slice(0, 2)).map((pp: string, j: number) => (
                                  <li key={j} className="text-muted-foreground">• {pp}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Expand/Collapse button */}
                          {((stage.touchpoints?.length > 3) || (stage.emotions?.length > 3) || (stage.pain_points?.length > 2)) && (
                            <button
                              onClick={() => toggleSection(stageKey)}
                              className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
                            >
                              <ChevronDown className={`w-3 h-3 transition-transform ${isStageExpanded ? 'rotate-180' : ''}`} />
                              {isStageExpanded ? 'Réduire' : 'Voir tout'}
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    // Fallback placeholder stages
                    ['Découverte', 'Recherche', 'Comparaison', 'Achat', 'Installation'].map((step, i) => (
                      <div key={step} className="min-w-[200px] p-4 rounded-lg bg-muted/50 space-y-2">
                        <h4 className="font-medium">{i + 1}. {step}</h4>
                        <div className="text-xs space-y-1">
                          <p className="text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Touchpoints
                          </p>
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Smile className="w-3 h-3" />
                            Émotions
                          </p>
                          <p className="text-muted-foreground flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Pain Points
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Button onClick={() => setActiveTab('hmw')} className="w-full gap-2">
                  Passer aux HMW Questions
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </TabsContent>

          {/* HMW Tab */}
          <TabsContent value="hmw" className="space-y-6 pt-4">
            {!tabStatus['hmw'] ? (
              <div className="text-center py-8 space-y-4">
                <div className="flex justify-center">
                  <HelpCircle className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">How Might We Questions</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Les agents vont formuler des questions "Comment pourrions-nous..." pour guider l'idéation.
                </p>
                <Button onClick={handleStartHMW} disabled={isAnalyzing} className="gap-2">
                  {isAnalyzing ? (
                    <>
                      <Spinner size="sm" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" />
                      Générer les questions
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    How Might We Questions ({hmwQuestions.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingHmw(!isAddingHmw)}
                      className="gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Ajouter
                    </Button>
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Terminé
                    </Badge>
                  </div>
                </div>

                {/* Add new HMW form */}
                {isAddingHmw && (
                  <div className="flex gap-2 p-3 bg-muted/30 rounded-lg">
                    <Input
                      value={newHmwQuestion}
                      onChange={(e) => setNewHmwQuestion(e.target.value)}
                      placeholder="Comment pourrions-nous..."
                      className="flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddHmw()}
                    />
                    <Button onClick={handleAddHmw}>
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <div className="space-y-3">
                  {hmwQuestions.map((q, i) => {
                    const agentId = q.agent_ids?.[0];
                    const agent = agentId && agentId !== 'user' ? AGENT_PERSONALITIES[agentId] : undefined;
                    return (
                      <div key={q.id} className="group p-4 rounded-lg bg-muted/50">
                        {editingHmw?.id === q.id ? (
                          <div className="flex gap-2">
                            <Textarea
                              value={editingHmw.question}
                              onChange={(e) => setEditingHmw({ ...editingHmw, question: e.target.value })}
                              className="flex-1 min-h-[60px]"
                              autoFocus
                            />
                            <div className="flex flex-col gap-1">
                              <Button size="sm" onClick={() => handleEditHmw(q.id, editingHmw.question)}>
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingHmw(null)}>
                                <XCircle className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between">
                              <p className="font-medium flex-1">{i + 1}. {q.question}</p>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-2">
                                <button
                                  onClick={() => setEditingHmw({ id: q.id, question: q.question })}
                                  className="text-muted-foreground hover:text-foreground p-1"
                                  title="Modifier"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteHmw(q.id)}
                                  className="text-muted-foreground hover:text-red-500 p-1"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {agent ? (
                                <span className="text-sm flex items-center gap-1">
                                  <AgentAvatarIcon personality={agentId} size="sm" />
                                  {agent.name}
                                </span>
                              ) : agentId === 'user' ? (
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  Ajouté par vous
                                </span>
                              ) : null}
                            </div>
                          </>
                        )}
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
                    className={`p-2 rounded-lg text-center text-sm flex items-center justify-center gap-1 ${
                      progress.status === 'working' ? 'bg-blue-100 dark:bg-blue-900 animate-pulse' :
                      progress.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900' :
                      'bg-muted'
                    }`}
                  >
                    <AgentAvatarIcon personality={agentId} size="sm" />
                    <span>{agent.name}</span>
                    {progress.status === 'completed' && <Check className="w-3 h-3" />}
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
                <>
                  <Spinner size="sm" />
                  Transition...
                </>
              ) : (
                <>
                  Avancer vers Phase 2: Ideation
                  <Lightbulb className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
