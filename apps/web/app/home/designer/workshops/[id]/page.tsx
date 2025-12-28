/**
 * Workshop Detail Page
 * URL: /home/designer/workshops/[id]
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Badge } from '@kit/ui/badge';
import { useWorkshop, useAdvancePhase, useDeleteWorkshop } from '@kit/generative-designer/hooks';
import { PhaseProgress } from '../_components/phase-progress';
import { AGENT_PERSONALITIES, PHASE_CONFIG, type Workshop, type SSEEvent } from '../_lib/types';
import { createSSEStream } from '../_lib/api';

import {
  Phase0Setup,
  Phase1Empathy,
  Phase2Ideation,
  Phase3Convergence,
  Phase4Triz,
  Phase5Selection,
} from './_phases';

export default function WorkshopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workshopId = params.id as string;

  const { data: workshop, isLoading, error, refetch } = useWorkshop(workshopId);
  const { mutate: advancePhase, isPending: isAdvancing } = useAdvancePhase();
  const { mutate: deleteWorkshop } = useDeleteWorkshop();

  const [sseEvents, setSseEvents] = useState<SSEEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const typedWorkshop = workshop as Workshop | undefined;

  useEffect(() => {
    if (!workshopId || !typedWorkshop || typedWorkshop.status === 'completed') return;

    const cleanup = createSSEStream(workshopId, (event: SSEEvent) => {
      setSseEvents((prev) => [...prev.slice(-50), event]);
      if (event.type === 'phase_completed') refetch();
    });

    setIsConnected(true);
    return () => { cleanup(); setIsConnected(false); };
  }, [workshopId, typedWorkshop?.status, refetch]);

  const handleAdvancePhase = useCallback((targetPhase: number) => {
    advancePhase({ workshopId, targetPhase }, {
      onSuccess: () => refetch(),
      onError: (err) => alert(`Erreur: ${err.message}`),
    });
  }, [workshopId, advancePhase, refetch]);

  const handleDelete = () => {
    if (!confirm('Supprimer ce workshop ?')) return;
    deleteWorkshop(workshopId, {
      onSuccess: () => router.push('/home/designer/workshops'),
      onError: (err) => alert(`Erreur: ${err.message}`),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce">⏳</div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="max-w-md border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="pt-6 space-y-4 text-center">
            <p className="text-red-600">❌ {error instanceof Error ? error.message : 'Erreur'}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => refetch()}>Réessayer</Button>
              <Button variant="outline" onClick={() => router.back()}>Retour</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!typedWorkshop) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="max-w-md">
          <CardContent className="pt-6 space-y-4 text-center">
            <p className="text-muted-foreground">🔍 Workshop non trouvé</p>
            <Button onClick={() => router.push('/home/designer/workshops')}>Retour</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPhase = typedWorkshop.current_phase;
  const phaseConfig = PHASE_CONFIG[currentPhase] ?? PHASE_CONFIG[0]!;
  
  // Extract agent personalities from agents array for phase components
  const agentPersonalities = typedWorkshop.agents?.map(a => a.personality) || [];
  const workshopWithPersonalities = {
    ...typedWorkshop,
    agent_personalities: agentPersonalities,
    target_ideas_count: typedWorkshop.config?.target_ideas_count || 20,
  };
  
  const phaseProps = { workshop: workshopWithPersonalities, workshopId, onAdvancePhase: handleAdvancePhase, isAdvancing, sseEvents, refetch };

  const renderPhase = () => {
    switch (currentPhase) {
      case 0: return <Phase0Setup {...phaseProps} />;
      case 1: return <Phase1Empathy {...phaseProps} />;
      case 2: return <Phase2Ideation {...phaseProps} />;
      case 3: return <Phase3Convergence {...phaseProps} />;
      case 4: return <Phase4Triz {...phaseProps} />;
      case 5: return <Phase5Selection {...phaseProps} />;
      default: return <Phase0Setup {...phaseProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/home/designer/workshops')}>← Dashboard</Button>
              <div>
                <h1 className="text-xl font-bold">{typedWorkshop.title}</h1>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant={typedWorkshop.status === 'active' ? 'default' : 'outline'}>
                    {typedWorkshop.status === 'active' ? '🟢 En cours' : typedWorkshop.status}
                  </Badge>
                  {isConnected && <span className="text-emerald-500 flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/>Live</span>}
                </div>
              </div>
            </div>
            <div className="hidden md:block flex-1 max-w-2xl">
              <PhaseProgress currentPhase={currentPhase} size="sm" showLabels={false} />
            </div>
            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500">🗑️</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">👥 Équipe</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {typedWorkshop.agents?.map((agent) => {
                  const personality = AGENT_PERSONALITIES[agent.personality];
                  return (
                    <div key={agent.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted">
                      <span className="text-xl">{agent.avatar_emoji || personality?.icon || '🤖'}</span>
                      <div>
                        <p className="font-medium text-sm">{agent.display_name}</p>
                        <p className="text-xs text-muted-foreground">{personality?.description || agent.personality}</p>
                      </div>
                    </div>
                  );
                }) || (
                  <p className="text-muted-foreground text-sm">Aucun agent</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">📊 Phase</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{phaseConfig.icon}</span>
                  <div><p className="font-semibold">Phase {currentPhase}</p><p className="text-sm text-muted-foreground">{phaseConfig.name}</p></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">🎯 Objectif</CardTitle></CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{typedWorkshop.config?.target_ideas_count || 20}</p>
                <p className="text-sm text-muted-foreground">idées</p>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3">{renderPhase()}</div>
        </div>
      </div>
    </div>
  );
}
