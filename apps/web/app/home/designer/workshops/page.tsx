/**
 * Workshops Dashboard Page
 * URL: /home/designer/workshops
 * 
 * Displays all user workshops with status, phase progress, and actions
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Badge } from '@kit/ui/badge';
import { useWorkshops, useDeleteWorkshop } from '@kit/generative-designer/hooks';
import { PhaseProgressBar } from './_components/phase-progress';
import { PHASE_CONFIG, AGENT_PERSONALITIES, type Workshop } from './_lib/types';

export default function WorkshopsDashboardPage() {
  const router = useRouter();
  const { data: workshops = [], isLoading, error } = useWorkshops();
  const { mutate: deleteWorkshop } = useDeleteWorkshop();

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${title}" ?`)) return;
    deleteWorkshop(id);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      draft: { label: 'Brouillon', variant: 'outline' },
      active: { label: '🟢 En cours', variant: 'default' },
      completed: { label: '✅ Terminé', variant: 'secondary' },
      archived: { label: '📦 Archivé', variant: 'outline' },
    };
    const c = config[status] ?? config.draft!;
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'À l\'instant';
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString('fr-FR');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">🎨 Mes Workshops</h1>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="max-w-md border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="pt-6 space-y-4 text-center">
            <p className="text-red-600 dark:text-red-400">
              ❌ {error instanceof Error ? error.message : 'Erreur de chargement'}
            </p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">
            🎨 Mes Workshops de Design Thinking
          </h1>
          <p className="text-muted-foreground">
            Créez et gérez vos sessions collaboratives avec des agents IA
          </p>
        </div>

        <Link href="/home/designer/workshops/new">
          <Button size="lg" className="gap-2">
            <span>+</span> Créer
          </Button>
        </Link>
      </div>

      {/* Empty state */}
      {workshops.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">Aucun workshop</h3>
            <p className="text-muted-foreground mb-6">
              Commencez par créer votre premier workshop de Design Thinking
            </p>
            <Link href="/home/designer/workshops/new">
              <Button size="lg">Créer votre premier workshop</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Workshop grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(workshops as Workshop[]).map((workshop) => {
          const phase = PHASE_CONFIG[workshop.current_phase] ?? PHASE_CONFIG[0]!;
          const agentCount = workshop.agent_personalities?.length || 3;

          return (
            <Card
              key={workshop.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-200"
              onClick={() => router.push(`/home/designer/workshops/${workshop.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    🎭 {workshop.title}
                  </CardTitle>
                  {getStatusBadge(workshop.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Problem description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {workshop.initial_problem}
                </p>

                {/* Phase progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {phase.icon} Phase {workshop.current_phase}: {phase.name}
                    </span>
                    <span className="text-muted-foreground">
                      {workshop.current_phase}/5
                    </span>
                  </div>
                  <PhaseProgressBar currentPhase={workshop.current_phase} />
                </div>

                {/* Meta info */}
                <div className="flex items-center justify-between pt-2 border-t text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      👥 {agentCount} agents
                    </span>
                    <span className="flex items-center gap-1">
                      💡 {workshop.target_ideas_count || 20} idées
                    </span>
                  </div>
                  <span>🕐 {formatDate(workshop.created_at)}</span>
                </div>

                {/* Agents avatars */}
                <div className="flex items-center gap-1">
                  {workshop.agent_personalities?.slice(0, 4).map((agentId) => {
                    const agent = AGENT_PERSONALITIES[agentId];
                    return agent ? (
                      <span
                        key={agentId}
                        className="text-lg"
                        title={`${agent.name} (${agentId})`}
                      >
                        {agent.icon}
                      </span>
                    ) : null;
                  })}
                  {(workshop.agent_personalities?.length || 0) > 4 && (
                    <span className="text-sm text-muted-foreground">
                      +{(workshop.agent_personalities?.length || 0) - 4}
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/home/designer/workshops/${workshop.id}`);
                    }}
                  >
                    Ouvrir →
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(workshop.id, workshop.title);
                    }}
                  >
                    🗑️
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
