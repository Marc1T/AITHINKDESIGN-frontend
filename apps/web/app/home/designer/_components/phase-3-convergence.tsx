/**
 * Composant Phase 3 - Convergence (Dot Voting & Matrices)
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { Badge } from '@kit/ui/badge';

interface Idea {
  id: string;
  title: string;
  agent_name: string;
  content: string;
}

interface Phase3Props {
  ideas: Idea[];
  onSelectIdeas?: (selectedIds: string[]) => void;
  onComplete?: (selectedIdeas: Idea[]) => void;
}

export const Phase3Convergence: React.FC<Phase3Props> = ({
  ideas = [],
  onSelectIdeas,
  onComplete,
}) => {
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [selectedIdeas, setSelectedIdeas] = useState<Set<string>>(new Set());
  const [matrixData, setMatrixData] = useState<Record<string, { impact: number; effort: number }>>({});

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
  const maxVotes = Math.max(...Object.values(votes), 0);

  const addVote = (ideaId: string) => {
    setVotes((prev) => ({
      ...prev,
      [ideaId]: (prev[ideaId] || 0) + 1,
    }));
  };

  const toggleSelection = (ideaId: string) => {
    const newSelected = new Set(selectedIdeas);
    if (newSelected.has(ideaId)) {
      newSelected.delete(ideaId);
    } else {
      newSelected.add(ideaId);
    }
    setSelectedIdeas(newSelected);
    onSelectIdeas?.([...newSelected]);
  };

  const updateMatrixPosition = (ideaId: string, impact: number, effort: number) => {
    setMatrixData((prev) => ({
      ...prev,
      [ideaId]: { impact, effort },
    }));
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          🎯 Phase 3 - Convergence
        </h2>
        <p className="text-muted-foreground">
          Sélectionner les meilleures idées pour approfondir (convergence progressive)
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dot-voting" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dot-voting">Dot Voting</TabsTrigger>
          <TabsTrigger value="impact-effort">Impact / Effort</TabsTrigger>
        </TabsList>

        {/* Dot Voting */}
        <TabsContent value="dot-voting" className="space-y-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
            <CardHeader>
              <CardTitle className="text-lg">Dot Voting</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Cliquez pour voter pour vos idées préférées (sans limite)
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {ideas.map((idea) => {
                const ideaVotes = votes[idea.id] || 0;
                const percentage = maxVotes > 0 ? (ideaVotes / maxVotes) * 100 : 0;

                return (
                  <div
                    key={idea.id}
                    className="space-y-2 rounded-lg border border-border p-4 hover:border-blue-300 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">{idea.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Par {idea.agent_name}
                        </p>
                      </div>
                      <Badge variant="default" className="text-lg font-bold">
                        {ideaVotes}
                      </Badge>
                    </div>

                    {/* Vote bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <Button
                        onClick={() => addVote(idea.id)}
                        className="gap-2 whitespace-nowrap"
                        size="sm"
                      >
                        👍 Voter
                      </Button>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground">{idea.content}</p>
                  </div>
                );
              })}

              <div className="border-t border-border pt-4 mt-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Total des votes: <span className="text-foreground font-bold">{totalVotes}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Impact / Effort Matrix */}
        <TabsContent value="impact-effort" className="space-y-4">
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
            <CardHeader>
              <CardTitle className="text-lg">Impact / Effort Matrix</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Positionnez les idées sur la matrice selon leur impact et effort
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Matrix Visual */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <div className="text-center text-sm font-semibold text-foreground">
                    ✅ Quick Wins
                  </div>
                  <div className="border-2 border-emerald-300 dark:border-emerald-700 rounded-lg p-4 min-h-32 flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20">
                    <p className="text-xs text-center text-muted-foreground">
                      High Impact, Low Effort
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-center text-sm font-semibold text-foreground">
                    🎯 Strategic
                  </div>
                  <div className="border-2 border-blue-300 dark:border-blue-700 rounded-lg p-4 min-h-32 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
                    <p className="text-xs text-center text-muted-foreground">
                      High Impact, High Effort
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-center text-sm font-semibold text-foreground">
                    💧 Fill-ins
                  </div>
                  <div className="border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4 min-h-32 flex items-center justify-center bg-gray-50 dark:bg-gray-900/20">
                    <p className="text-xs text-center text-muted-foreground">
                      Low Impact, Low Effort
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-center text-sm font-semibold text-foreground">
                    ⏰ Avoid
                  </div>
                  <div className="border-2 border-red-300 dark:border-red-700 rounded-lg p-4 min-h-32 flex items-center justify-center bg-red-50 dark:bg-red-900/20">
                    <p className="text-xs text-center text-muted-foreground">
                      Low Impact, High Effort
                    </p>
                  </div>
                </div>
              </div>

              {/* Ideas for manual positioning */}
              <div className="border-t border-border pt-4">
                <p className="text-sm font-semibold text-foreground mb-3">
                  Positionner les idées
                </p>
                {ideas.map((idea) => (
                  <div key={idea.id} className="mb-3 p-3 bg-card rounded-lg border border-border">
                    <p className="text-sm font-medium text-foreground mb-2">{idea.title}</p>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground">Impact (1-5)</label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={matrixData[idea.id]?.impact || 3}
                          onChange={(e) =>
                            updateMatrixPosition(
                              idea.id,
                              parseInt(e.target.value),
                              matrixData[idea.id]?.effort || 3
                            )
                          }
                          className="w-full cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground">Effort (1-5)</label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={matrixData[idea.id]?.effort || 3}
                          onChange={(e) =>
                            updateMatrixPosition(
                              idea.id,
                              matrixData[idea.id]?.impact || 3,
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selection Summary */}
      {selectedIdeas.size > 0 && (
        <Card className="border-emerald-500 bg-emerald-50 dark:bg-emerald-950">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              ✅ Sélection des meilleures idées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ideas
                .filter((i) => selectedIdeas.has(i.id))
                .map((idea) => (
                  <div key={idea.id} className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{idea.title}</p>
                    <button
                      onClick={() => toggleSelection(idea.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      ✕
                    </button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline">← Retour</Button>
        <Button
          onClick={() => onComplete?.(ideas.filter((i) => selectedIdeas.has(i.id)))}
          disabled={selectedIdeas.size === 0}
          className="gap-2"
        >
          Continuer avec {selectedIdeas.size} idée{selectedIdeas.size !== 1 ? 's' : ''} →{' '}
          <span>⚙️</span>
        </Button>
      </div>
    </div>
  );
};
