/**
 * IdeaCard Component
 * Displays an idea with agent info, votes, and actions
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@kit/ui/utils';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Badge } from '@kit/ui/badge';
import { AgentAvatar } from './agent-card';
import { AGENT_PERSONALITIES, type Idea } from '../_lib/types';

interface IdeaCardProps {
  idea: Idea;
  rank?: number;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: (data: { title: string; description: string }) => void;
  onDelete?: () => void;
  showVotes?: boolean;
  showActions?: boolean;
  isExpanded?: boolean;
  className?: string;
}

export function IdeaCard({
  idea,
  rank,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  showVotes = true,
  showActions = true,
  isExpanded = false,
  className,
}: IdeaCardProps) {
  const [expanded, setExpanded] = useState(isExpanded);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(idea.title);
  const [editDescription, setEditDescription] = useState(idea.description);

  const agent = AGENT_PERSONALITIES[idea.agent_id];

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit({ title: editTitle, description: editDescription });
    }
    setIsEditing(false);
  };

  const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isSelected && 'ring-2 ring-primary',
        onSelect && 'cursor-pointer hover:shadow-md',
        className
      )}
      onClick={onSelect && !isEditing ? onSelect : undefined}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {rank && (
              <span className="text-lg font-bold text-muted-foreground">
                {rankEmoji || `#${rank}`}
              </span>
            )}
            {!isEditing ? (
              <CardTitle className="text-lg">{idea.title}</CardTitle>
            ) : (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-lg font-semibold bg-transparent border-b border-primary focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>

          {showVotes && (
            <div className="flex items-center gap-1 text-sm">
              <span className="text-blue-500">●</span>
              <span className="font-medium">{idea.votes_count}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Description */}
        {!isEditing ? (
          <p
            className={cn(
              'text-muted-foreground',
              !expanded && 'line-clamp-2'
            )}
          >
            {idea.description}
          </p>
        ) : (
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full p-2 text-sm bg-muted rounded-md border focus:outline-none focus:ring-2 focus:ring-primary"
            rows={4}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Meta info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AgentAvatar agentId={idea.agent_id} size="sm" />
            <span className="text-sm text-muted-foreground">
              {agent?.name || idea.agent_name}
            </span>
            {idea.technique && (
              <Badge variant="outline" className="text-xs">
                {idea.technique}
                {idea.technique_detail && `: ${idea.technique_detail}`}
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {!expanded && idea.description.length > 100 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(true)}
              >
                Voir détails
              </Button>
            )}

            {showActions && !isEditing && (
              <>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="text-red-500 hover:text-red-600"
                  >
                    🗑️
                  </Button>
                )}
              </>
            )}

            {isEditing && (
              <>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  Annuler
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                  Sauver
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Selection checkbox */}
        {onSelect && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <div
              className={cn(
                'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                isSelected
                  ? 'bg-primary border-primary text-white'
                  : 'border-gray-300 hover:border-primary'
              )}
            >
              {isSelected && '✓'}
            </div>
            <span className="text-sm text-muted-foreground">
              {isSelected ? 'Sélectionnée' : 'Sélectionner'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * IdeaCardCompact - Minimal version for lists
 */
export function IdeaCardCompact({
  idea,
  rank,
  votes,
  className,
}: {
  idea: Idea;
  rank?: number;
  votes?: number;
  className?: string;
}) {
  const agent = AGENT_PERSONALITIES[idea.agent_id];

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors',
        className
      )}
    >
      {rank && (
        <span className="text-lg font-bold text-muted-foreground w-8">
          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
        </span>
      )}
      <AgentAvatar agentId={idea.agent_id} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{idea.title}</p>
        <p className="text-sm text-muted-foreground truncate">{idea.description}</p>
      </div>
      {votes !== undefined && (
        <div className="flex items-center gap-1 text-sm">
          <span className="text-blue-500">●</span>
          <span>{votes}</span>
        </div>
      )}
    </div>
  );
}
