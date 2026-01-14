/**
 * PhaseProgress Component
 * Shows progress through workshop phases
 */

'use client';

import React from 'react';
import { cn } from '@kit/ui/utils';
import { Check } from 'lucide-react';
import { PHASE_CONFIG } from '../_lib/types';

interface PhaseProgressProps {
  currentPhase: number;
  className?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PhaseProgress({
  currentPhase,
  className,
  showLabels = true,
  size = 'md',
}: PhaseProgressProps) {
  const sizes = {
    sm: { circle: 'w-6 h-6', text: 'text-xs', icon: 'text-sm' },
    md: { circle: 'w-10 h-10', text: 'text-sm', icon: 'text-lg' },
    lg: { circle: 'w-14 h-14', text: 'text-base', icon: 'text-2xl' },
  };

  const s = sizes[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {PHASE_CONFIG.map((phase, index) => {
        const isCompleted = currentPhase > phase.number;
        const isCurrent = currentPhase === phase.number;
        const isPending = currentPhase < phase.number;

        return (
          <React.Fragment key={phase.number}>
            {/* Connector line */}
            {index > 0 && (
              <div
                className={cn(
                  'flex-1 h-1 rounded-full transition-colors',
                  isCompleted
                    ? 'bg-emerald-500'
                    : isCurrent
                      ? 'bg-gradient-to-r from-emerald-500 to-gray-300'
                      : 'bg-gray-200 dark:bg-gray-700'
                )}
              />
            )}

            {/* Phase circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'rounded-full flex items-center justify-center transition-all',
                  s.circle,
                  isCompleted && 'bg-emerald-500 text-white',
                  isCurrent && 'bg-primary text-white ring-4 ring-primary/30',
                  isPending && 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                )}
              >
                {isCompleted ? (
                  <Check className={cn(s.icon, 'w-4 h-4')} />
                ) : (
                  <span className={s.icon}>{phase.icon}</span>
                )}
              </div>

              {showLabels && (
                <span
                  className={cn(
                    'font-medium transition-colors',
                    s.text,
                    isCompleted && 'text-emerald-600 dark:text-emerald-400',
                    isCurrent && 'text-primary',
                    isPending && 'text-muted-foreground'
                  )}
                >
                  {phase.name}
                </span>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/**
 * PhaseProgressBar - Linear progress indicator
 */
export function PhaseProgressBar({
  currentPhase,
  totalPhases = 6,
  className,
}: {
  currentPhase: number;
  totalPhases?: number;
  className?: string;
}) {
  const progress = (currentPhase / (totalPhases - 1)) * 100;

  return (
    <div className={cn('relative', className)}>
      {/* Background */}
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        {/* Progress */}
        <div
          className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Dots */}
      <div className="absolute inset-0 flex justify-between items-center px-1">
        {PHASE_CONFIG.map((phase) => (
          <div
            key={phase.number}
            className={cn(
              'w-3 h-3 rounded-full transition-colors',
              currentPhase >= phase.number
                ? 'bg-white ring-2 ring-primary'
                : 'bg-gray-300 dark:bg-gray-600'
            )}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * PhaseHeader - Display current phase info
 */
export function PhaseHeader({
  currentPhase,
  subStep,
  totalSubSteps,
  className,
}: {
  currentPhase: number;
  subStep?: number;
  totalSubSteps?: number;
  className?: string;
}) {
  const phase = PHASE_CONFIG[currentPhase];
  if (!phase) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{phase.icon}</span>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Phase {phase.number}: {phase.name}
          </h2>
          {subStep !== undefined && totalSubSteps !== undefined && (
            <p className="text-muted-foreground">
              Étape {subStep}/{totalSubSteps}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
