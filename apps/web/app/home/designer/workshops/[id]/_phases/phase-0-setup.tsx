/**
 * Phase 0 - Setup
 * Shows workshop configuration and "Start Phase 1" button
 */

'use client';

import React from 'react';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { AGENT_PERSONALITIES, type Workshop, type SSEEvent } from '../../_lib/types';
import { 
  AgentAvatarIcon, 
  PhaseIcon, 
  Spinner,
  Settings2,
  Sparkles,
  Users,
  Target,
  Lightbulb,
  ClipboardList,
  HeartHandshake,
  Play,
} from '../../_lib/icons';

interface Phase0Props {
  workshop: Workshop;
  workshopId: string;
  onAdvancePhase: (phase: number) => void;
  isAdvancing: boolean;
  sseEvents: SSEEvent[];
  refetch: () => void;
}

export default function Phase0Setup({
  workshop,
  onAdvancePhase,
  isAdvancing,
}: Phase0Props) {
  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-t-lg">
        <CardTitle className="text-xl flex items-center gap-2">
          <Settings2 className="w-5 h-5" />
          Phase 0 - Workshop Configuré !
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <Sparkles className="w-16 h-16 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Votre équipe de Design Thinking est prête</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Les agents IA sont configurés et prêts à vous aider à résoudre votre problème de design.
          </p>
        </div>

        {/* Team display */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Votre équipe
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {workshop.agent_personalities?.map((agentId) => {
              const agent = AGENT_PERSONALITIES[agentId];
              return agent ? (
                <div
                  key={agentId}
                  className={`flex flex-col items-center p-4 rounded-xl ${agent.bgClass} hover:opacity-90 transition-opacity`}
                >
                  <AgentAvatarIcon personality={agentId} size="xl" />
                  <p className="font-semibold mt-2">{agent.name}</p>
                  <p
                    className={`text-xs px-2 py-0.5 rounded-full mt-1 ${agent.colorClass} bg-white dark:bg-gray-800`}
                  >
                    {agentId}
                  </p>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    {agent.description}
                  </p>
                </div>
              ) : null;
            })}
          </div>
        </div>

        {/* Problem reminder */}
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Problème à résoudre
          </h4>
          <p className="text-foreground">{workshop.initial_problem}</p>
        </div>

        {/* Target */}
        <div className="flex items-center justify-center gap-8 py-4">
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">{workshop.target_ideas_count || 20}</p>
            <p className="text-sm text-muted-foreground">idées à générer</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">{workshop.agent_personalities?.length || 3}</p>
            <p className="text-sm text-muted-foreground">agents IA</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">6</p>
            <p className="text-sm text-muted-foreground">phases</p>
          </div>
        </div>

        {/* Phase 1 description */}
        <div className="p-4 rounded-lg bg-pink-50 dark:bg-pink-950 border border-pink-200 dark:border-pink-800">
          <h4 className="font-medium text-pink-700 dark:text-pink-300 mb-2 flex items-center gap-2">
            <HeartHandshake className="w-4 h-4" />
            Phase 1 - Empathy
          </h4>
          <p className="text-sm text-foreground">
            La Phase 1 vous aidera à comprendre profondément votre utilisateur avant de générer des idées.
            Les agents vont créer une Empathy Map, un Customer Journey et des questions "How Might We".
          </p>
        </div>

        {/* Action button */}
        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            onClick={() => onAdvancePhase(1)}
            disabled={isAdvancing}
            className="gap-2 text-lg px-8 py-6"
          >
            {isAdvancing ? (
              <>
                <Spinner size="md" />
                Démarrage...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Démarrer Phase 1: Empathy
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
