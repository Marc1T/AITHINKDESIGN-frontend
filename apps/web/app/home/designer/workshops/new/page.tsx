/**
 * Page: New Workshop Configuration
 * Configuration des agents, du nombre d'idées cibles, etc.
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Label } from '@kit/ui/label';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { Slider } from '@kit/ui/slider';
import { Badge } from '@kit/ui/badge';
import { agentPersonalities } from '../_components/workshop-theme';

const agents = Object.entries(agentPersonalities).map(([key, value]) => ({
  id: key,
  ...value,
}));

export default function NewWorkshopPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Agents, 3: Configuration
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Basic Info
  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');

  // Step 2: Agents Selection
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(
    new Set(['creative', 'pragmatic', 'technical'])
  );

  // Step 3: Configuration
  const [targetIdeas, setTargetIdeas] = useState(20);
  const [enabledTechniques, setEnabledTechniques] = useState({
    phase1: ['empathy_map', 'customer_journey', 'hmw'],
    phase2: ['scamper', 'random_word', 'worst_idea'],
    phase3: ['dot_voting', 'now_how_wow', 'impact_effort'],
    phase4: ['triz'],
    phase5: ['assumption_mapping', 'impact_effort'],
  });

  const toggleAgent = (agentId: string) => {
    const newSelected = new Set(selectedAgents);
    if (newSelected.has(agentId)) {
      newSelected.delete(agentId);
    } else {
      newSelected.add(agentId);
    }
    setSelectedAgents(newSelected);
  };

  const handleSubmit = async () => {
    if (!title || !problem || selectedAgents.size === 0) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: API call to create workshop
      // const response = await fetch('/api/generative-designer/workshops', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     title,
      //     initial_problem: problem,
      //     config: {
      //       nb_agents: selectedAgents.size,
      //       target_ideas_count: targetIdeas,
      //       enabled_techniques: enabledTechniques,
      //       agent_personalities: Array.from(selectedAgents),
      //     },
      //   }),
      // });
      // const data = await response.json();
      // router.push(`/home/designer/workshops/${data.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            ✨ Créer un Workshop
          </h1>
          <p className="text-lg text-muted-foreground">
            Configuration pas à pas
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex gap-3">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => s <= step && setStep(s)}
              className={`
                flex items-center justify-center w-10 h-10 rounded-full font-semibold
                transition-all duration-200
                ${
                  s === step
                    ? 'bg-blue-500 text-white shadow-lg'
                    : s < step
                      ? 'bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }
              `}
            >
              {s < step ? '✓' : s}
            </button>
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardTitle className="text-xl">📋 Informations de Base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Titre du Workshop *
                </Label>
                <Input
                  id="title"
                  placeholder="Ex: Redesign Application Mobile"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-base py-2 h-auto"
                />
                <p className="text-sm text-muted-foreground">
                  Un titre clair pour identifier votre projet
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="problem" className="text-base font-semibold">
                  Problème à résoudre *
                </Label>
                <Textarea
                  id="problem"
                  placeholder="Décrivez le problème en détail. Soyez spécifique et clair..."
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  rows={5}
                  className="text-base"
                />
                <p className="text-sm text-muted-foreground">
                  Décrivez le défi ou le problème que vous souhaitez résoudre
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-foreground">
                  💡 <strong>Conseil :</strong> Plus votre description est détaillée, meilleurs
                  seront les résultats. Incluez le contexte, les utilisateurs concernés et les
                  contraintes.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!title || !problem}
                  className="gap-2"
                >
                  Continuer → <span>🤖</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Agents Selection */}
        {step === 2 && (
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardTitle className="text-xl">🤖 Sélectionnez vos Agents IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Choisissez entre 2 et 6 agents ({selectedAgents.size} sélectionnés)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agents.map((agent) => {
                  const isSelected = selectedAgents.has(agent.id);
                  return (
                    <button
                      key={agent.id}
                      onClick={() => {
                        if (isSelected && selectedAgents.size === 2) {
                          alert('Minimum 2 agents requis');
                          return;
                        }
                        if (!isSelected && selectedAgents.size === 6) {
                          alert('Maximum 6 agents');
                          return;
                        }
                        toggleAgent(agent.id);
                      }}
                      className={`
                        text-left rounded-lg border-2 p-4 transition-all
                        ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-lg'
                            : 'border-border hover:border-gray-400'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex items-center justify-center w-12 h-12 rounded-full text-xl font-semibold"
                            style={{ backgroundColor: agent.color + '20', color: agent.color }}
                          >
                            {agent.emoji}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{agent.name}</p>
                            <p className="text-xs text-muted-foreground">{agent.title}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <Badge className="bg-blue-500">Sélectionné</Badge>
                        )}
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {agent.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {agent.strengths.map((strength) => (
                          <Badge
                            key={strength}
                            variant="outline"
                            className="text-xs"
                          >
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  ← Retour
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={selectedAgents.size < 2}
                  className="gap-2"
                >
                  Continuer → <span>⚙️</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Configuration */}
        {step === 3 && (
          <Card className="border-emerald-200 dark:border-emerald-800">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <CardTitle className="text-xl">⚙️ Configuration Avancée</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ideas-slider" className="text-base font-semibold">
                    Nombre d'idées cibles: <span className="text-blue-600">{targetIdeas}</span>
                  </Label>
                  <Slider
                    id="ideas-slider"
                    min={10}
                    max={100}
                    step={5}
                    value={[targetIdeas]}
                    onValueChange={(value) => setTargetIdeas(value[0])}
                    className="mt-3"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Objectif d'idées à générer pendant la phase d'idéation
                  </p>
                </div>
              </div>

              {/* Techniques Summary */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  Techniques activées par phase
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phase 1 - Empathie</span>
                    <span className="font-medium">3 techniques</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phase 2 - Idéation</span>
                    <span className="font-medium">3 techniques</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phase 3 - Convergence</span>
                    <span className="font-medium">3 techniques</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phase 4 - TRIZ</span>
                    <span className="font-medium">1 technique</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phase 5 - Sélection</span>
                    <span className="font-medium">2 techniques</span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-base">📊 Résumé Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Agents sélectionnés</span>
                    <span className="font-semibold">{selectedAgents.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cible d'idées</span>
                    <span className="font-semibold">{targetIdeas} idées</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durée estimée</span>
                    <span className="font-semibold">2-3 heures</span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                >
                  ← Retour
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="gap-2 min-w-40"
                >
                  {isSubmitting ? 'Création...' : 'Créer le Workshop'} ✨
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
