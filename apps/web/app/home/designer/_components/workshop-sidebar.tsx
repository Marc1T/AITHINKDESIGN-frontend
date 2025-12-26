/**
 * Composant Workshop Sidebar - Affiche les agents et navigation
 */

'use client';

import React from 'react';
import { AgentCard } from './agent-card';
import { agentPersonalities } from './workshop-theme';

interface Agent {
  id: string;
  personality: string;
  display_name: string;
  contributions_count: number;
  total_tokens_used: number;
  is_active: boolean;
}

interface WorkshopSidebarProps {
  agents: Agent[];
  selectedAgentId?: string;
  onSelectAgent?: (agentId: string) => void;
  workshopTitle: string;
}

export const WorkshopSidebar: React.FC<WorkshopSidebarProps> = ({
  agents,
  selectedAgentId,
  onSelectAgent,
  workshopTitle,
}) => {
  // Trier par contributions décroissantes
  const sortedAgents = [...agents].sort(
    (a, b) => b.contributions_count - a.contributions_count
  );

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="border-b border-border p-4 space-y-2">
        <h2 className="text-lg font-bold text-foreground truncate">
          {workshopTitle}
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {agents.length} AGENTS IA
          </span>
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Agents List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {sortedAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-sm text-muted-foreground">Aucun agent</p>
          </div>
        ) : (
          sortedAgents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onSelectAgent?.(agent.id)}
              className="w-full text-left transition-opacity hover:opacity-75"
            >
              <AgentCard
                personality={agent.personality}
                isActive={selectedAgentId === agent.id}
                contributions={agent.contributions_count}
                tokensUsed={agent.total_tokens_used}
                variant="compact"
              />
            </button>
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="border-t border-border p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total contributions</span>
          <span className="font-semibold text-foreground">
            {agents.reduce((acc, a) => acc + a.contributions_count, 0)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tokens utilisés</span>
          <span className="font-semibold text-foreground">
            {(() => {
              const total = agents.reduce((acc, a) => acc + a.total_tokens_used, 0);
              return total > 1000 ? `${(total / 1000).toFixed(1)}k` : total;
            })()}
          </span>
        </div>
      </div>
    </div>
  );
};
