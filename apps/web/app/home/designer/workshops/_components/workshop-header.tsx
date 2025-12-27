'use client';

import React from 'react';

export interface WorkshopHeaderProps {
  title: string;
  initialProblem: string;
  currentPhase: number;
  status: string;
}

export function WorkshopHeader({ title, initialProblem, currentPhase, status }: WorkshopHeaderProps) {
  const phases = [
    { name: 'Setup', icon: '⚙️' },
    { name: 'Empathy', icon: '❤️' },
    { name: 'Ideation', icon: '💡' },
    { name: 'Convergence', icon: '🎯' },
    { name: 'TRIZ', icon: '🔧' },
    { name: 'Selection', icon: '✨' },
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
            <span className="text-lg">{phase.icon}</span>
            <span className="text-sm font-medium">{phase.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
