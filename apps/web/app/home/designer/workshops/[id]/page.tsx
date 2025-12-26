/**
 * Page: Workshop Detail
 * Interface principale du workshop avec phases
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { WorkshopHeader } from '../_components/workshop-header';
import { WorkshopSidebar } from '../_components/workshop-sidebar';
import { Phase1Empathy } from '../_components/phase-1-empathy';
import { Phase2Ideation } from '../_components/phase-2-ideation';
import { Phase3Convergence } from '../_components/phase-3-convergence';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';

interface Workshop {
  id: string;
  title: string;
  initial_problem: string;
  current_phase: number;
  status: string;
  phase_data: Record<string, any>;
  created_at: string;
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
}

export default function WorkshopDetailPage() {
  const params = useParams();
  const workshopId = params.id as string;

  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [ideas, setIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    // TODO: Fetch workshop data and agents from API
    setIsLoading(false);
  }, [workshopId]);

  const handlePhaseComplete = (phaseNumber: number, data: any) => {
    // TODO: Save phase data to API
    console.log(`Phase ${phaseNumber} completed:`, data);
    // Progression to next phase
    if (workshop) {
      setWorkshop({
        ...workshop,
        current_phase: phaseNumber + 1,
      });
    }
  };

  const renderPhaseContent = () => {
    if (!workshop) return null;

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
            <CardHeader>
              <CardTitle>⚙️ Phase 4 - TRIZ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Enrichissement technique avec les 40 principes TRIZ
              </p>
              <Button className="mt-4 gap-2">
                Lancer l'analyse TRIZ →
              </Button>
            </CardContent>
          </Card>
        );
      case 5:
        return (
          <Card className="m-6">
            <CardHeader>
              <CardTitle>✨ Phase 5 - Sélection Finale</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Choisir le concept final et générer le cahier de charge
              </p>
              <Button className="mt-4 gap-2">
                Générer le cahier de charge →
              </Button>
            </CardContent>
          </Card>
        );
      default:
        return (
          <Card className="m-6">
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Phase non disponible
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Chargement du workshop...</p>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-destructive">Workshop non trouvé</p>
      </div>
    );
  }

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
          onExport={() => console.log('Exporting...')}
          onArchive={() => console.log('Archiving...')}
          onDelete={() => console.log('Deleting...')}
        />

        {/* Phase Content */}
        <div className="flex-1 overflow-y-auto">
          {renderPhaseContent()}
        </div>
      </div>
    </div>
  );
}
