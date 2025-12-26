/**
 * Workshop Card Component
 * Displays workshop summary in list view
 */

'use client';

import { formatDistance } from 'date-fns';
import { ChevronRight, Users, Lightbulb } from 'lucide-react';
import { PHASE_INFO, type WorkshopResponse } from '../types';
import { cn } from '~/utils';

interface WorkshopCardProps {
  workshop: WorkshopResponse;
  onClick?: () => void;
}

export function WorkshopCard({ workshop, onClick }: WorkshopCardProps) {
  const phase = PHASE_INFO[workshop.current_phase];
  const createdAt = new Date(workshop.created_at);

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full rounded-xl border border-border bg-card p-6',
        'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5',
        'transition-all duration-200',
        'text-left'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {workshop.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {workshop.initial_problem}
          </p>
        </div>

        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>

      {/* Phase Badge */}
      <div className="mt-4 flex items-center gap-2">
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          style={{
            backgroundColor: `${phase.color}15`,
            color: phase.color,
          }}
        >
          <span>{phase.icon}</span>
          <span>Phase {workshop.current_phase}</span>
          <span className="text-[10px] opacity-70">• {phase.name}</span>
        </div>

        {/* Status Badge */}
        <div className={cn(
          'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase',
          workshop.status === 'active' && 'bg-green-500/10 text-green-600 dark:text-green-400',
          workshop.status === 'draft' && 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
          workshop.status === 'completed' && 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
        )}>
          {workshop.status}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          <span>{workshop.nb_agents} agents</span>
        </div>

        <div className="h-4 w-px bg-border" />

        <div className="flex items-center gap-1.5">
          <Lightbulb className="h-4 w-4" />
          <span>0 idées</span>
        </div>

        <div className="h-4 w-px bg-border" />

        <time className="text-xs">
          {formatDistance(createdAt, new Date(), { addSuffix: true })}
        </time>
      </div>

      {/* Hover Gradient Border */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div 
          className="absolute inset-0 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${phase.color}08 0%, transparent 50%)`,
          }}
        />
      </div>
    </button>
  );
}