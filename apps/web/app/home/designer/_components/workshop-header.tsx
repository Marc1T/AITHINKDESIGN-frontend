/**
 * Composant Workshop Header - Affiche titre, phase, actions
 */

'use client';

import React from 'react';
import { Button } from '@kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { PhaseProgress } from './phase-progress';
import { workshopTheme } from './workshop-theme';

interface WorkshopHeaderProps {
  title: string;
  currentPhase: number;
  status: string;
  onExport?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

export const WorkshopHeader: React.FC<WorkshopHeaderProps> = ({
  title,
  currentPhase,
  status,
  onExport,
  onArchive,
  onDelete,
}) => {
  const phaseInfo = workshopTheme.phases.find((p) => p.id === currentPhase);

  return (
    <div className="border-b border-border bg-card p-6 space-y-4">
      {/* Row 1: Title & Actions */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            {phaseInfo && (
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1">
                <span className="text-lg">{phaseInfo.icon}</span>
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-200">
                  {phaseInfo.label}
                </span>
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Status: <span className="font-medium capitalize">{status.replace(/_/g, ' ')}</span>
          </p>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <span>⋯</span>
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExport}>
              📥 Exporter le workshop
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onArchive} className="text-amber-600">
              📦 Archiver
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              🗑️ Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Row 2: Phase Progress */}
      <PhaseProgress currentPhase={currentPhase} totalPhases={6} />
    </div>
  );
};
