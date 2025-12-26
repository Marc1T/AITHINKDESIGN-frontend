/**
 * Workshop Detail Page - Version améliorée avec hooks
 * Exemple complet d'utilisation des hooks et composants
 */

'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWorkshop, useIdeas, useMessages } from '~/lib/hooks/use-workshop';
import {
  WorkshopHeader,
  WorkshopSidebar,
  Phase1Empathy,
  Phase2Ideation,
  Phase3Convergence,
} from '../_components';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import { Spinner } from '@kit/ui/spinner';

export default function WorkshopDetailPageImproved() {
  const params = useParams();
  const workshopId = params.id as string;

  // Hooks
  const workshop = useWorkshop({ workshopId });
  const ideas = useIdeas(workshopId);
  const messages = useMessages(workshopId);

  // Load messages for current phase
  useEffect(() => {
    if (workshop.workshop?.current_phase) {
      messages.fetchMessages(workshop.workshop.current_phase);
    }
  }, [workshop.workshop?.current_phase]);

  // Loading state
  if (workshop.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Spinner />
          <p className="text-muted-foreground">Chargement du workshop...</p>
        </div>
      </div>
    );
  }

  if (workshop.error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="border-destructive">
          <CardContent className="py-8 text-center">
            <p className="text-destructive font-semibold">Erreur</p>
            <p className="text-sm text-muted-foreground">{workshop.error}</p>
            <Button className="mt-4" onClick={() => workshop.fetchWorkshop(workshopId)}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!workshop.workshop) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-destructive">Workshop non trouvé</p>
      </div>
    );
  }

  // Render current phase
  const renderPhase = () => {
    const { current_phase } = workshop.workshop!;

    switch (current_phase) {
      case 1:
        return (
          <Phase1Empathy
            problemStatement={workshop.workshop!.initial_problem}
            onNext={(data) => {
              workshop.completePhase(1, data);
            }}
          />
        );

      case 2:
        return (
          <Phase2Ideation
            ideas={ideas.ideas}
            isGenerating={ideas.isLoading}
            onGenerateIdeas={(technique) =>
              ideas.generateIdeas(technique, current_phase)
            }
            onComplete={(selectedIdeas) => {
              workshop.completePhase(2, { selected_ideas: selectedIdeas });
            }}
          />
        );

      case 3:
        return (
          <Phase3Convergence
            ideas={ideas.ideas}
            onComplete={(selectedIdeas) => {
              workshop.completePhase(3, { selected_ideas: selectedIdeas });
            }}
          />
        );

      case 4:
        return (
          <div className="p-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>⚙️ Phase 4 - TRIZ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Enrichissement technique avec les 40 principes TRIZ
                </p>
                <Button className="gap-2">
                  Lancer l'analyse TRIZ →
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="p-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>✨ Phase 5 - Sélection Finale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Choisir le concept final et générer le cahier de charge
                </p>
                <Button className="gap-2">
                  Générer le cahier de charge →
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <Card className="m-6">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Phase non disponible</p>
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
          agents={workshop.agents}
          workshopTitle={workshop.workshop.title}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <WorkshopHeader
          title={workshop.workshop.title}
          currentPhase={workshop.workshop.current_phase}
          status={workshop.workshop.status}
          onExport={() => {
            // TODO: Implémenter export
            alert('Export non implémenté');
          }}
          onArchive={() => {
            // TODO: Implémenter archive
            alert('Archive non implémenté');
          }}
          onDelete={() => {
            // TODO: Implémenter delete
            alert('Delete non implémenté');
          }}
        />

        {/* Phase Content */}
        <div className="flex-1 overflow-y-auto">
          {renderPhase()}
        </div>
      </div>
    </div>
  );
}
