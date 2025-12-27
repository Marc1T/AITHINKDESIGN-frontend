// packages/features/generative-designer/src/hooks/use-sse.ts

'use client';

import { useEffect, useState, useCallback } from 'react';
import { SSEClient, SSEEvent } from '../lib/sse-client';

export function useSSE(workshopId?: string) {
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [client, setClient] = useState<SSEClient | null>(null);

  useEffect(() => {
    if (!workshopId) return;

    const sseClient = new SSEClient(workshopId);

    sseClient.onConnect(() => setIsConnected(true));
    sseClient.onDisconnect(() => setIsConnected(false));
    sseClient.onEvent((event) => {
      setEvents((prev) => [...prev, event]);
    });

    sseClient.connect();
    setClient(sseClient);

    return () => {
      sseClient.disconnect();
    };
  }, [workshopId]);

  const clearEvents = useCallback(() => setEvents([]), []);

  return {
    events,
    isConnected,
    clearEvents,
    latestEvent: events[events.length - 1],
  };
}

export function useSSEProgress(workshopId?: string) {
  const { events } = useSSE(workshopId);

  const progress = events.filter((e) =>
    ['agent_started', 'agent_complete', 'idea_generated', 'vote_cast'].includes(e.event),
  );

  return {
    totalEvents: events.length,
    progressEvents: progress,
    lastActivity: events[events.length - 1],
  };
}
