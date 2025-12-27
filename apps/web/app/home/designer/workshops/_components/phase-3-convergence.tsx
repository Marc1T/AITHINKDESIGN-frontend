'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';

export interface Phase3ConvergenceProps {
  workshopId: string;
  data?: Record<string, any>;
  onComplete?: () => void;
}

export function Phase3Convergence({ workshopId, data, onComplete }: Phase3ConvergenceProps) {
  const [voteType, setVoteType] = React.useState('dot_voting');
  const [isVoting, setIsVoting] = React.useState(false);

  const handleInitiateVoting = async () => {
    setIsVoting(true);
    try {
      // TODO: Call API to initiate voting
      await new Promise(r => setTimeout(r, 2000));
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Phase 3: Convergence & Voting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vote Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Type de vote</label>
            <Select value={voteType} onValueChange={setVoteType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dot_voting">Dot Voting (3 dots)</SelectItem>
                <SelectItem value="now_how_wow">Now-How-Wow Matrix</SelectItem>
                <SelectItem value="impact_effort">Impact/Effort Matrix</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleInitiateVoting} 
            disabled={isVoting}
            className="w-full gap-2"
          >
            {isVoting ? '⏳ Starting voting...' : '▶️ Start Voting Session'}
          </Button>

          {/* Voting Results */}
          {data?.voting_results && (
            <div className="space-y-3">
              <h3 className="font-semibold">Top Ideas by Votes</h3>
              {data.voting_results.slice(0, 5).map((result: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded">
                  <span className="font-medium">{result.title}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600" 
                        style={{ width: `${(result.votes / (data.voting_results[0].votes || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-8">{result.votes}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Complete Phase */}
          <Button variant="outline" className="w-full mt-4" onClick={onComplete}>
            ✓ Marquer Phase 3 comme complète
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
