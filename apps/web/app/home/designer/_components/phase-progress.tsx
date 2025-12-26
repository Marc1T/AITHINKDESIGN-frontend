/**
 * Composant Phase Progress - Barre de progression des phases
 */

'use client';

import React from 'react';
import { workshopTheme } from './workshop-theme';

interface PhaseProgressProps {
  currentPhase: number; // 0-6
  totalPhases?: number;
  onPhaseClick?: (phase: number) => void;
  isInteractive?: boolean;
}

export const PhaseProgress: React.FC<PhaseProgressProps> = ({
  currentPhase,
  totalPhases = 6,
  onPhaseClick,
  isInteractive = false,
}) => {
  const phases = workshopTheme.phases;

  return (
    <div className="w-full space-y-2">
      {/* Texte descriptif */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-medium text-muted-foreground">
          Progression du Workshop
        </p>
        <p className="text-sm font-semibold text-foreground">
          Phase {currentPhase} / {totalPhases}
        </p>
      </div>

      {/* Barre de progression visuelle */}
      <div className="flex gap-2">
        {phases.map((phase) => {
          const isCompleted = phase.id < currentPhase;
          const isActive = phase.id === currentPhase;
          const isUpcoming = phase.id > currentPhase;

          return (
            <button
              key={phase.id}
              onClick={() => isInteractive && onPhaseClick?.(phase.id)}
              disabled={!isInteractive}
              className={`
                flex flex-1 flex-col items-center justify-center gap-1.5
                rounded-lg px-2 py-3
                transition-all duration-300
                ${
                  isActive
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }
                ${isInteractive && !isActive ? 'hover:shadow-md cursor-pointer' : 'cursor-default'}
              `}
            >
              <span className="text-lg" role="img" aria-label={phase.label}>
                {phase.icon}
              </span>
              <span className="text-xs font-semibold text-center leading-tight">
                {phase.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Indicateur de progression */}
      <div className="mt-3 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${(currentPhase / totalPhases) * 100}%` }}
        />
      </div>
    </div>
  );
};
