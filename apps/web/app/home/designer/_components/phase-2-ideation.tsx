/**
 * Composant Phase 2 - Idéation
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Badge } from '@kit/ui/badge';
import { Textarea } from '@kit/ui/textarea';
import { agentPersonalities } from './workshop-theme';

interface Idea {
  id: string;
  agent_name: string;
  agent_personality: string;
  content: string;
  technique: string;
  timestamp: Date;
}

interface Phase2Props {
  ideas: Idea[];
  isGenerating?: boolean;
  onGenerateIdeas?: (technique: string) => void;
  onComplete?: (selectedIdeas: Idea[]) => void;
}

const techniques = [
  {
    id: 'scamper',
    label: 'SCAMPER',
    description: 'Substituer, Combiner, Adapter, Modifier, Utiliser autrement, Éliminer, Réordonner',
    icon: '🔄',
  },
  {
    id: 'random_word',
    label: 'Random Word Injection',
    description: 'Injecter des mots aléatoires pour créer des associations inattendues',
    icon: '🎲',
  },
  {
    id: 'worst_idea',
    label: 'Worst Possible Idea',
    description: 'Générer la pire idée possible, puis l\'inverser',
    icon: '❌',
  },
];

export const Phase2Ideation: React.FC<Phase2Props> = ({
  ideas = [],
  isGenerating = false,
  onGenerateIdeas,
  onComplete,
}) => {
  const [selectedIdeas, setSelectedIdeas] = useState<Set<string>>(new Set());
  const [manualIdea, setManualIdea] = useState('');

  const toggleIdeaSelection = (ideaId: string) => {
    const newSelected = new Set(selectedIdeas);
    if (newSelected.has(ideaId)) {
      newSelected.delete(ideaId);
    } else {
      newSelected.add(ideaId);
    }
    setSelectedIdeas(newSelected);
  };

  const getAgentColor = (personality: string) => {
    const agent = agentPersonalities[personality as keyof typeof agentPersonalities];
    return agent?.color || '#3b82f6';
  };

  const addManualIdea = () => {
    if (manualIdea.trim()) {
      // TODO: Appel API pour ajouter une idée manuelle
      setManualIdea('');
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          💡 Phase 2 - Idéation Explosive
        </h2>
        <p className="text-muted-foreground">
          Générer un maximum d'idées sans jugement (divergence maximale)
        </p>
      </div>

      {/* Techniques Selector */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardHeader>
          <CardTitle className="text-lg">Techniques d'Idéation</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {techniques.map((technique) => (
            <button
              key={technique.id}
              onClick={() => onGenerateIdeas?.(technique.id)}
              disabled={isGenerating}
              className="group rounded-lg border-2 border-border p-4 text-left transition-all hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 disabled:opacity-50"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{technique.icon}</span>
                    <p className="font-semibold text-foreground">{technique.label}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{technique.description}</p>
                </div>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Ideas Stream */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Idées générées ({ideas.length})
          </h3>
          <Badge variant="outline">{selectedIdeas.size} sélectionnées</Badge>
        </div>

        {isGenerating && (
          <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="animate-spin">🔄</div>
              <p className="text-sm text-foreground">
                Les agents IA réfléchissent à de meilleures idées...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Ideas List */}
        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {ideas.map((idea) => {
            const agent = agentPersonalities[idea.agent_personality as keyof typeof agentPersonalities];
            const isSelected = selectedIdeas.has(idea.id);

            return (
              <button
                key={idea.id}
                onClick={() => toggleIdeaSelection(idea.id)}
                className={`
                  text-left rounded-lg border-2 p-4 transition-all
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-md'
                      : 'border-border hover:border-border-hover'
                  }
                `}
              >
                {/* Agent header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{agent?.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {idea.agent_name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        Technique: {idea.technique.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-5 h-5 rounded cursor-pointer"
                    style={{
                      borderColor: getAgentColor(idea.agent_personality),
                      accentColor: getAgentColor(idea.agent_personality),
                    }}
                  />
                </div>

                {/* Idea content */}
                <p className="text-foreground">{idea.content}</p>
              </button>
            );
          })}
        </div>

        {ideas.length === 0 && !isGenerating && (
          <Card className="border-dashed border-2 border-muted">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-lg text-muted-foreground">💭 Aucune idée générée encore</p>
              <p className="text-sm text-muted-foreground">
                Lancez une technique pour que les agents génèrent des idées
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Manual Input */}
      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
        <CardHeader>
          <CardTitle className="text-lg">Ajouter votre propre idée</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Décrivez votre idée innovante ici..."
            value={manualIdea}
            onChange={(e) => setManualIdea(e.target.value)}
            className="h-20 resize-none"
          />
          <Button onClick={addManualIdea} className="w-full">
            + Ajouter mon idée
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline">← Retour</Button>
        <Button
          onClick={() => onComplete?.(ideas.filter((i) => selectedIdeas.has(i.id)))}
          disabled={selectedIdeas.size === 0}
          className="gap-2"
        >
          Continuer avec {selectedIdeas.size} idée{selectedIdeas.size !== 1 ? 's' : ''} →{' '}
          <span>🎯</span>
        </Button>
      </div>
    </div>
  );
};
