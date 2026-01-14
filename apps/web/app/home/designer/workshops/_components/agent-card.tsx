/**
 * AgentCard Component
 * Displays an agent with avatar, name, and status
 */

'use client';

import React from 'react';
import { cn } from '@kit/ui/utils';
import { Check, X } from 'lucide-react';
import { AGENT_PERSONALITIES, type AgentPersonality } from '../_lib/types';
import { AgentAvatarIcon } from '../_lib/icons';

interface AgentCardProps {
  agentId: string;
  status?: 'idle' | 'working' | 'completed' | 'error';
  contributionsCount?: number;
  isSelected?: boolean;
  onSelect?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export function AgentCard({
  agentId,
  status = 'idle',
  contributionsCount = 0,
  isSelected = false,
  onSelect,
  size = 'md',
  showDetails = true,
  className,
}: AgentCardProps) {
  const agent = AGENT_PERSONALITIES[agentId];
  
  if (!agent) {
    return null;
  }

  const sizeClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  const iconSizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  const statusColors = {
    idle: 'bg-gray-100 dark:bg-gray-800',
    working: 'bg-blue-50 dark:bg-blue-950 ring-2 ring-blue-500 animate-pulse',
    completed: 'bg-emerald-50 dark:bg-emerald-950 ring-2 ring-emerald-500',
    error: 'bg-red-50 dark:bg-red-950 ring-2 ring-red-500',
  };

  const statusIndicator = {
    idle: null,
    working: <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />,
    completed: <span className="absolute -top-1 -right-1 text-emerald-500"><Check className="w-4 h-4" /></span>,
    error: <span className="absolute -top-1 -right-1 text-red-500"><X className="w-4 h-4" /></span>,
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        'relative rounded-xl transition-all duration-200',
        sizeClasses[size],
        statusColors[status],
        isSelected && 'ring-2 ring-primary ring-offset-2',
        onSelect && 'cursor-pointer hover:scale-105 hover:shadow-lg',
        className
      )}
    >
      {statusIndicator[status]}
      
      <div className="flex flex-col items-center text-center space-y-2">
        {/* Avatar */}
        <div className={cn('transition-transform', iconSizes[size])}>
          {agent.icon}
        </div>

        {/* Name */}
        <div className="font-semibold text-foreground">{agent.name}</div>
        
        {/* Personality */}
        <div
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${agent.color}20`, color: agent.color }}
        >
          {agentId.charAt(0).toUpperCase() + agentId.slice(1)}
        </div>

        {showDetails && (
          <>
            {/* Description */}
            <p className="text-xs text-muted-foreground">{agent.description}</p>
            
            {/* Contributions */}
            {contributionsCount > 0 && (
              <div className="text-xs text-muted-foreground">
                {contributionsCount} contribution{contributionsCount > 1 ? 's' : ''}
              </div>
            )}
          </>
        )}
      </div>

      {/* Selection indicator */}
      {onSelect && (
        <div className="absolute bottom-2 right-2">
          <div
            className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
              isSelected ? 'bg-primary border-primary text-white' : 'border-gray-300'
            )}
          >
            {isSelected && <Check className="w-3 h-3" />}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * AgentAvatar - Compact version showing just the icon
 */
export function AgentAvatar({
  agentId,
  size = 'md',
  className,
}: {
  agentId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const agent = AGENT_PERSONALITIES[agentId];
  if (!agent) return null;

  const sizes = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-lg',
    lg: 'w-12 h-12 text-2xl',
  };

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center',
        sizes[size],
        className
      )}
      style={{ backgroundColor: `${agent.color}20` }}
      title={`${agent.name} (${agentId})`}
    >
      {agent.icon}
    </div>
  );
}
