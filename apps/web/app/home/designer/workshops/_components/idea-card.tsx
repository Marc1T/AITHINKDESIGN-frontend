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
import { Trash2, Pencil, Check, Lightbulb, AlertTriangle, ArrowRight, Shuffle, RefreshCw } from 'lucide-react';
import { AgentAvatar } from './agent-card';
import { RankBadge } from '../_lib/icons';
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
            {rank && <RankBadge rank={rank} />}
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

        {/* Technique-specific enrichment */}
        {expanded && idea.technique === 'worst_idea' && idea.worst_idea_original && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border border-red-200 dark:border-red-800 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase">Pire idée originale</p>
                <p className="text-sm text-red-700 dark:text-red-300 italic">"{idea.worst_idea_original}"</p>
              </div>
            </div>
            {idea.inversion_insight && (
              <div className="flex items-start gap-2 pt-2 border-t border-red-200 dark:border-red-700">
                <ArrowRight className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Insight d'inversion</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">{idea.inversion_insight}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {expanded && idea.technique === 'scamper' && idea.scamper_type && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-500" />
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">Principe SCAMPER</p>
              <Badge variant="secondary" className="text-xs">{idea.scamper_type}</Badge>
            </div>
          </div>
        )}

        {expanded && idea.technique === 'random_word' && idea.random_word && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-purple-500" />
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase">Mot déclencheur</p>
              <Badge variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900">{idea.random_word}</Badge>
            </div>
          </div>
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
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
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
              {isSelected && <Check className="w-3 h-3" />}
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
      {rank && <RankBadge rank={rank} />}
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
