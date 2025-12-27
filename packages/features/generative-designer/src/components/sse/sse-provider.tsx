// packages/features/generative-designer/src/components/sse/sse-provider.tsx

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSSE } from '../../hooks/use-sse';

interface SSEContextValue {
  events: any[];
  isConnected: boolean;
  clearEvents: () => void;
  latestEvent?: any;
}

const SSEContext = createContext<SSEContextValue | null>(null);

export function SSEProvider({ workshopId, children }: { workshopId: string; children: ReactNode }) {
  const sse = useSSE(workshopId);

  return <SSEContext.Provider value={sse}>{children}</SSEContext.Provider>;
}

export function useSSEContext() {
  const context = useContext(SSEContext);
  if (!context) throw new Error('useSSEContext must be used within SSEProvider');
  return context;
}
