/**
 * Page: Workshop Detail - INTEGRATED VERSION
 * Interface principale du workshop avec phases
 * 
 * Intégration API complète avec:
 * - Chargement des données du workshop
 * - Gestion des agents
 * - Navigation entre les phases
 * - Sauvegarde des données de phase
 * - Streaming en temps réel
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { WorkshopHeader } from '../_components/workshop-header';
import { WorkshopSidebar } from '../_components/workshop-sidebar';
import { Phase1Empathy } from '../_components/phase-1-empathy';
import { Phase2Ideation } from '../_components/phase-2-ideation';
import { Phase3Convergence } from '../_components/phase-3-convergence';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import { generativeDesignerApi } from '~/lib/api/generative-designer';

interface Workshop {
  id: string;
  title: string;
  initial_problem: string;
  current_phase: number;
  status: string;
  phase_data: Record<string, any>;
  created_at: string;
  user_id?: string;
}

interface Agent {
  id: string;
  personality: string;
  display_name: string;
  contributions_count: number;
  total_tokens_used: number;
  is_active: boolean;
}

interface Idea {
  id: string;
  agent_name: string;
  agent_personality: string;
  title: string;
  content: string;
  technique: string;
  timestamp: Date;
  votes_count?: number;
}

export default function WorkshopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workshopId = params.id as string;

  // State Management
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();
  
  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ====================================================================
  // API Calls
  // ====================================================================

  const loadWorkshop = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch workshop data
      const workshopResult = await generativeDesignerApi.workshop.get(workshopId);
      if (workshopResult.error) {
        setError(workshopResult.error.message);
        return;
      }

      if (workshopResult.data) {
        setWorkshop(workshopResult.data);

        // Fetch agents for this workshop
        const agentsResult = await generativeDesignerApi.agent.list(workshopId);
        if (agentsResult.data) {
          setAgents(agentsResult.data);
        }

        // Fetch ideas if not in phase 1
        if (workshopResult.data.current_phase > 1) {
          const ideasResult = await generativeDesignerApi.idea.list(workshopId);
          if (ideasResult.data) {
            setIdeas(ideasResult.data);
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de chargement du workshop';
      setError(message);
      console.error('Failed to load workshop:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workshopId]);

  // Load workshop on mount
  useEffect(() => {
    loadWorkshop();
  }, [loadWorkshop]);

  const handlePhaseComplete = async (phaseNumber: number, data: any) => {
    if (!workshop) return;

    setIsSaving(true);
    try {
      // Save phase data
      const result = await generativeDesignerApi.phase.saveData(
        workshopId,
        phaseNumber,
        data
      );

      if (result.error) {
        alert(`Erreur: ${result.error.message}`);
        return;
      }

      // Complete phase
      const completeResult = await generativeDesignerApi.phase.complete(
        workshopId,
        phaseNumber,
        data
      );

      if (completeResult.error) {
        alert(`Erreur: ${completeResult.error.message}`);
        return;
      }

      // Update local state - move to next phase
      setWorkshop({
        ...workshop,
        current_phase: phaseNumber + 1,
        phase_data: { ...workshop.phase_data, [phaseNumber]: data },
      });

      console.log(`✅ Phase ${phaseNumber} completed successfully`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      alert(message);
      console.error('Failed to complete phase:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviousPhase = () => {
    if (!workshop || workshop.current_phase <= 1) return;
    setWorkshop({
      ...workshop,
      current_phase: workshop.current_phase - 1,
    });
  };

  const handlePhaseJump = async (phaseNumber: number) => {
    if (!workshop) return;
    if (phaseNumber < 1 || phaseNumber > workshop.current_phase) {
      alert('Vous ne pouvez pas sauter à cette phase');
      return;
    }

    setWorkshop({
      ...workshop,
      current_phase: phaseNumber,
    });
  };

  const handleExport = async () => {
    try {
      const result = await generativeDesignerApi.workshop.export(workshopId);
      if (result.error) {
        alert(`Erreur: ${result.error.message}`);
        return;
      }
      // In a real app, this would trigger a download
      console.log('Workshop exported:', result.data);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de l\'export');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce workshop ?')) return;

    try {
      const result = await generativeDesignerApi.workshop.delete(workshopId);
      if (result.error) {
        alert(`Erreur: ${result.error.message}`);
        return;
      }
      router.push('/home/designer/workshops');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  // ====================================================================
  // Rendering
  // ====================================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin text-4xl">⏳</div>
          <p className="text-muted-foreground">Chargement du workshop...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="pt-6 space-y-4">
            <p className="text-red-600 dark:text-red-400">❌ {error}</p>
            <Button onClick={() => loadWorkshop()}>Réessayer</Button>
            <Button variant="outline" onClick={() => router.back()}>Retour</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 space-y-4">
            <p className="text-destructive">❌ Workshop non trouvé</p>
            <Button onClick={() => router.push('/home/designer/workshops')}>
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderPhaseContent = () => {
    switch (workshop.current_phase) {
      case 1:
        return (
          <Phase1Empathy
            problemStatement={workshop.initial_problem}
            onNext={(data) => handlePhaseComplete(1, data)}
          />
        );

      case 2:
        return (
          <Phase2Ideation
            ideas={ideas}
            onComplete={(selectedIdeas) => handlePhaseComplete(2, selectedIdeas)}
          />
        );

      case 3:
        return (
          <Phase3Convergence
            ideas={ideas}
            onComplete={(selectedIdeas) => handlePhaseComplete(3, selectedIdeas)}
          />
        );

      case 4:
        return (
          <Card className="m-6">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardTitle className="text-xl">⚙️ Phase 4 - TRIZ (Enrichissement Technique)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <p className="text-muted-foreground">
                Enrichissement technique avec les 40 principes inventifs TRIZ.
              </p>
              <p className="text-sm text-muted-foreground">
                L'analyse TRIZ vous aide à résoudre les contradictions techniques
                en s'appuyant sur les brevets et innovations de tous les secteurs.
              </p>

              <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                <p className="text-sm">
                  <strong>Top idées:</strong> {ideas.slice(0, 3).map(i => i.title).join(', ') || 'Aucune'}
                </p>
              </div>

              <Button className="mt-4 gap-2 w-full">
                🔧 Lancer l'analyse TRIZ →
              </Button>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card className="m-6">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <CardTitle className="text-xl">✨ Phase 5 - Sélection Finale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <p className="text-muted-foreground">
                Sélectionnez le concept final et générez le cahier de charge détaillé.
              </p>

              <div className="grid grid-cols-2 gap-4 my-4">
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{ideas.length}</p>
                    <p className="text-xs text-muted-foreground">Idées totales</p>
                  </CardContent>
                </Card>
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center">
                    <p className="text-2xl font-bold text-blue-600">{agents.length}</p>
                    <p className="text-xs text-muted-foreground">Agents</p>
                  </CardContent>
                </Card>
              </div>

              <Button className="mt-4 gap-2 w-full">
                📄 Générer le cahier de charge →
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card className="m-6">
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                🎉 Workshop complété avec succès!
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-72 border-r border-border overflow-hidden flex flex-col">
        <WorkshopSidebar
          agents={agents}
          selectedAgentId={selectedAgentId}
          onSelectAgent={setSelectedAgentId}
          workshopTitle={workshop.title}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <WorkshopHeader
          title={workshop.title}
          currentPhase={workshop.current_phase}
          status={workshop.status}
          onExport={handleExport}
          onArchive={() => console.log('Archiving...')}
          onDelete={handleDelete}
        />

        {/* Phase Navigation */}
        <div className="px-6 py-3 border-b border-border bg-gray-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Phase {workshop.current_phase} / 5
            </div>
            <div className="flex gap-2">
              {workshop.current_phase > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPhase}
                >
                  ← Précédent
                </Button>
              )}
              {isSaving && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin">⏳</div>
                  Sauvegarde...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Phase Content */}
        <div className="flex-1 overflow-y-auto">
          {renderPhaseContent()}
        </div>
      </div>
    </div>
  );
}
