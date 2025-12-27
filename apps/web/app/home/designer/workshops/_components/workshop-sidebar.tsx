'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

export interface Agent {
  id: string;
  personality: string;
  display_name: string;
  avatar_emoji: string;
  contributions_count: number;
}

export interface WorkshopSidebarProps {
  agents: Agent[];
  workshopId: string;
}

export function WorkshopSidebar({ agents, workshopId }: WorkshopSidebarProps) {
  return (
    <div className="space-y-4">
      {/* Agents Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Agents IA ({agents.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {agents.map((agent) => (
            <div key={agent.id} className="flex items-center gap-3 p-2 border rounded hover:bg-muted transition">
              <span className="text-2xl">{agent.avatar_emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{agent.display_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{agent.personality}</p>
              </div>
              <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded whitespace-nowrap">
                {agent.contributions_count} contrib
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workshop Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Workshop ID</span>
            <code className="text-xs font-mono bg-muted px-2 py-1 rounded truncate max-w-[120px]">
              {workshopId}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
