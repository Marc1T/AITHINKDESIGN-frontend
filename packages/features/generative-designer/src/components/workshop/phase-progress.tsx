/**
 * Phase Progress Component
 * Visual progress bar showing 6 Design Thinking phases
 */

'use client';

import { Check } from 'lucide-react';
import { PHASE_INFO, type WorkshopPhase } from '../types';
import { cn } from '~/utils';

interface PhaseProgressProps {
  currentPhase: WorkshopPhase;
  className?: string;
  compact?: boolean;
}

export function PhaseProgress({
  currentPhase,
  className,
  compact = false,
}: PhaseProgressProps) {
  const phases = [1, 2, 3, 4, 5, 6] as const;

  return (
    <div className={cn('relative', className)}>
      {/* Progress Line */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
      <div
        className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
        style={{
          width: `${(currentPhase / 6) * 100}%`,
        }}
      />

      {/* Phase Dots */}
      <div className="relative flex justify-between">
        {phases.map((phase) => {
          const info = PHASE_INFO[phase];
          const isActive = phase === currentPhase;
          const isCompleted = phase < currentPhase;
          const isFuture = phase > currentPhase;

          return (
            <div key={phase} className="flex flex-col items-center gap-2">
              {/* Dot */}
              <div
                className={cn(
                  'relative h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                  'bg-background',
                  isActive && 'border-primary shadow-lg shadow-primary/20',
                  isCompleted && 'border-primary bg-primary',
                  isFuture && 'border-border'
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 text-primary-foreground" />
                ) : (
                  <span className="text-sm font-medium" style={{
                    color: isActive ? info.color : undefined,
                  }}>
                    {info.icon}
                  </span>
                )}

                {/* Active Pulse */}
                {isActive && (
                  <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-50" />
                )}
              </div>

              {/* Label */}
              {!compact && (
                <div className="flex flex-col items-center gap-0.5 min-w-[80px]">
                  <span
                    className={cn(
                      'text-xs font-medium transition-colors text-center',
                      isActive && 'text-foreground',
                      isCompleted && 'text-muted-foreground',
                      isFuture && 'text-muted-foreground/50'
                    )}
                  >
                    {info.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70 text-center">
                    Phase {phase}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}