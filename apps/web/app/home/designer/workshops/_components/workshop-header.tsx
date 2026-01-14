'use client';

import React from 'react';
import { PhaseIcon } from '../_lib/icons';

export interface WorkshopHeaderProps {
  title: string;
  initialProblem: string;
  currentPhase: number;
  status: string;
}

export function WorkshopHeader({ title, initialProblem, currentPhase, status }: WorkshopHeaderProps) {
  const phases = [
    { name: 'Setup', phase: 0 },
    { name: 'Empathy', phase: 1 },
    { name: 'Ideation', phase: 2 },
    { name: 'Convergence', phase: 3 },
    { name: 'TRIZ', phase: 4 },
    { name: 'Selection', phase: 5 },
  ];

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-blue-100">{initialProblem}</p>
      </div>

      {/* Phase Progress */}
      <div className="flex gap-2">
        {phases.map((phase, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              i <= currentPhase
                ? 'bg-blue-700 text-white'
                : 'bg-blue-500/50 text-blue-100'
            }`}
          >
            <PhaseIcon phase={phase.phase} className="w-5 h-5" />
            <span className="text-sm font-medium">{phase.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
