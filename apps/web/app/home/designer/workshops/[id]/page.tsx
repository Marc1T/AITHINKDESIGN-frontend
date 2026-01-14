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
import { 
  Loader2, 
  XCircle, 
  Search, 
  ArrowLeft, 
  Circle, 
  Trash2,
  Users,
  BarChart2,
  Target,
  Check
} from 'lucide-react';
import { useWorkshop, useAdvancePhase, useDeleteWorkshop } from '@kit/generative-designer/hooks';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { PhaseProgress } from '../_components/phase-progress';
import { AGENT_PERSONALITIES, PHASE_CONFIG, type Workshop, type SSEEvent } from '../_lib/types';
import { createSSEStream } from '../_lib/api';
import { AgentAvatarIcon, PhaseIcon } from '../_lib/icons';

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
  const supabase = useSupabase();

  const { data: workshop, isLoading, error, refetch } = useWorkshop(workshopId);
  const { mutate: advancePhase, isPending: isAdvancing } = useAdvancePhase();
  const { mutate: deleteWorkshop } = useDeleteWorkshop();

  const [sseEvents, setSseEvents] = useState<SSEEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const typedWorkshop = workshop as Workshop | undefined;

  useEffect(() => {
    if (!workshopId || !typedWorkshop || typedWorkshop.status === 'completed') return;

    let cleanup: (() => void) | undefined;
    
    // Get auth token and connect to SSE
    const connectSSE = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        if (!token) {
          console.warn('SSE: No auth token available');
          return;
        }
        
        cleanup = createSSEStream(workshopId, (event: SSEEvent) => {
          setSseEvents((prev) => [...prev.slice(-50), event]);
          if (event.type === 'phase_completed') refetch();
        }, token);
        
        setIsConnected(true);
      } catch (err) {
        console.error('SSE connection error:', err);
      }
    };
    
    connectSSE();
    
    return () => {
      if (cleanup) cleanup();
      setIsConnected(false);
    };
  }, [workshopId, typedWorkshop?.status, refetch, supabase]);

  const handleAdvancePhase = useCallback((targetPhase: number) => {
    advancePhase({ workshopId, targetPhase }, {
      onSuccess: async () => {
        // Force immediate refetch to update UI
        await refetch();
        console.log(`[Workshop] Advanced to phase ${targetPhase}`);
      },
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
          <div className="flex items-center justify-center">
            <Loader2 className="w-16 h-16 animate-spin text-primary" />
          </div>
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
            <p className="text-red-600 flex items-center justify-center gap-2">
              <XCircle className="w-5 h-5" />
              {error instanceof Error ? error.message : 'Erreur'}
            </p>
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
            <p className="text-muted-foreground flex items-center justify-center gap-2">
              <Search className="w-5 h-5" />
              Workshop non trouvé
            </p>
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

  // Use key to force re-mount when phase changes
  const renderPhase = () => {
    const key = `phase-${currentPhase}-${workshopId}`;
    switch (currentPhase) {
      case 0: return <Phase0Setup key={key} {...phaseProps} />;
      case 1: return <Phase1Empathy key={key} {...phaseProps} />;
      case 2: return <Phase2Ideation key={key} {...phaseProps} />;
      case 3: return <Phase3Convergence key={key} {...phaseProps} />;
      case 4: return <Phase4Triz key={key} {...phaseProps} />;
      case 5: return <Phase5Selection key={key} {...phaseProps} />;
      default: return <Phase0Setup key={key} {...phaseProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/home/designer/workshops')} className="gap-1">
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-bold">{typedWorkshop.title}</h1>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant={typedWorkshop.status === 'active' ? 'default' : 'outline'} className="flex items-center gap-1">
                    {typedWorkshop.status === 'active' ? (
                      <><Circle className="w-3 h-3 fill-current" /> En cours</>
                    ) : typedWorkshop.status}
                  </Badge>
                  {isConnected && <span className="text-emerald-500 flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/>Live</span>}
                </div>
              </div>
            </div>
            <div className="hidden md:block flex-1 max-w-2xl">
              <PhaseProgress currentPhase={currentPhase} size="sm" showLabels={false} />
            </div>
            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <Users className="w-4 h-4" /> Équipe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {typedWorkshop.agents?.map((agent) => {
                  const personality = AGENT_PERSONALITIES[agent.personality];
                  return (
                    <div key={agent.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted">
                      <AgentAvatarIcon personality={agent.personality} size="md" />
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
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <BarChart2 className="w-4 h-4" /> Phase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <PhaseIcon phase={currentPhase} size="lg" />
                  <div><p className="font-semibold">Phase {currentPhase}</p><p className="text-sm text-muted-foreground">{phaseConfig.name}</p></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <Target className="w-4 h-4" /> Objectif
                </CardTitle>
              </CardHeader>
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
