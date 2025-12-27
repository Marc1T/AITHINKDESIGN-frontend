// packages/features/generative-designer/src/components/sse/activity-feed.tsx

'use client';

import React from 'react';
import { cn } from '../../lib/utils';
import { formatDistance } from 'date-fns';
import { useSSEContext } from './sse-provider';

export function ActivityFeed() {
  const { events, isConnected } = useSSEContext();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'h-2 w-2 rounded-full',
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400',
          )}
        />
        <span className="text-xs text-muted-foreground">{isConnected ? 'Live' : 'Disconnected'}</span>
      </div>

      <div className="space-y-1 max-h-96 overflow-y-auto">
        {events.map((event, i) => (
          <ActivityItem key={i} event={event} />
        ))}
      </div>
    </div>
  );
}

function ActivityItem({ event }: { event: any }) {
  const getIcon = () => {
    switch (event.event) {
      case 'agent_started':
        return '🤖';
      case 'idea_generated':
        return '💡';
      case 'vote_cast':
        return '🗳️';
      default:
        return '📢';
    }
  };

  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
      <span className="text-lg">{getIcon()}</span>
      <div className="flex-1">
        <p className="text-sm">{event.data?.message || event.event}</p>
        <time className="text-xs text-muted-foreground">
          {formatDistance(new Date(event.timestamp || Date.now()), new Date(), { addSuffix: true })}
        </time>
      </div>
    </div>
  );
}
