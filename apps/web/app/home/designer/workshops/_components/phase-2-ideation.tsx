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

export interface Phase2IdeationProps {
  workshopId: string;
  ideas?: any[];
  onComplete?: () => void;
}

export function Phase2Ideation({ workshopId, ideas = [], onComplete }: Phase2IdeationProps) {
  const [technique, setTechnique] = React.useState('scamper');
  const [mode, setMode] = React.useState('parallel');
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerateIdeas = async () => {
    setIsGenerating(true);
    try {
      // TODO: Call API to generate ideas
      await new Promise(r => setTimeout(r, 2000));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Phase 2: Idéation Créative
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Technique Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Technique</label>
              <Select value={technique} onValueChange={setTechnique}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scamper">SCAMPER</SelectItem>
                  <SelectItem value="random_word">Random Word</SelectItem>
                  <SelectItem value="worst_idea">Worst Idea</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mode</label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parallel">Parallel</SelectItem>
                  <SelectItem value="sequence">Sequence</SelectItem>
                  <SelectItem value="discussion">Discussion</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleGenerateIdeas} 
            disabled={isGenerating}
            className="w-full gap-2"
          >
            {isGenerating ? '⏳ Generating ideas...' : '▶️ Generate Ideas'}
          </Button>

          {/* Ideas List */}
          {ideas.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Generated Ideas ({ideas.length})</h3>
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {ideas.map((idea, i) => (
                  <div key={i} className="p-3 border rounded hover:bg-muted transition">
                    <p className="font-medium">{idea.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{idea.description}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                        {idea.technique}
                      </span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                        by {idea.agent_name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complete Phase */}
          <Button variant="outline" className="w-full mt-4" onClick={onComplete}>
            ✓ Marquer Phase 2 comme complète
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
