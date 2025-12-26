/**
 * Composant Agent Card - Affiche un agent IA avec ses stats
 */

'use client';

import React from 'react';
import { agentPersonalities } from './workshop-theme';

interface AgentCardProps {
  personality: string; // creative, pragmatic, technical, empathetic, critic, facilitator
  isActive?: boolean;
  contributions?: number;
  tokensUsed?: number;
  onSelect?: () => void;
  variant?: 'compact' | 'extended';
}

export const AgentCard: React.FC<AgentCardProps> = ({
  personality,
  isActive = false,
  contributions = 0,
  tokensUsed = 0,
  onSelect,
  variant = 'extended',
}) => {
  const agent = agentPersonalities[personality as keyof typeof agentPersonalities];

  if (!agent) return null;

  if (variant === 'compact') {
    return (
      <button
        onClick={onSelect}
        className={`
          flex flex-col items-center gap-2 p-3 rounded-lg
          transition-all duration-200
          ${
            isActive
              ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500 ring-2 ring-blue-300'
              : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300'
          }
        `}
      >
        <span className="text-2xl">{agent.emoji}</span>
        <div className="text-center text-xs">
          <p className="font-semibold text-foreground">{agent.name}</p>
          <p className="text-muted-foreground text-xs">{contributions} contrib.</p>
        </div>
      </button>
    );
  }

  return (
    <div
      className={`
        rounded-lg border p-4 transition-all duration-200
        ${
          isActive
            ? 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700 shadow-md'
            : 'bg-card border-border'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-full text-xl font-semibold"
            style={{ backgroundColor: agent.color + '20', color: agent.color }}
          >
            {agent.emoji}
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{agent.name}</h4>
            <p className="text-sm text-muted-foreground">{agent.title}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 text-sm text-muted-foreground">{agent.description}</p>

      {/* Forces/Compétences */}
      <div className="mt-3 flex flex-wrap gap-2">
        {agent.strengths.map((strength) => (
          <span
            key={strength}
            className="inline-block rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-foreground"
          >
            {strength}
          </span>
        ))}
      </div>

      {/* Stats */}
      {contributions > 0 && (
        <div className="mt-4 flex gap-4 border-t border-border pt-4">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Contributions</p>
            <p className="text-lg font-semibold text-foreground">{contributions}</p>
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Tokens utilisés</p>
            <p className="text-lg font-semibold text-foreground">
              {tokensUsed > 1000 ? `${(tokensUsed / 1000).toFixed(1)}k` : tokensUsed}
            </p>
          </div>
        </div>
      )}

      {/* Status badge */}
      {isActive && (
        <div className="mt-3 flex items-center gap-2 rounded-md bg-emerald-100 dark:bg-emerald-900 px-3 py-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-200">
            Actif
          </span>
        </div>
      )}
    </div>
  );
};
