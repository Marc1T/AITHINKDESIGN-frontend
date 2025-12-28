/**
 * New Workshop Creation Wizard
 * URL: /home/designer/workshops/new
 * 
 * 3-step wizard:
 * 1. Problem description (title + problem)
 * 2. Agent selection (3-5 agents)
 * 3. Configuration recap + launch
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Label } from '@kit/ui/label';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { Badge } from '@kit/ui/badge';
import { cn } from '@kit/ui/utils';
import { AgentCard } from '../_components/agent-card';
import { AGENT_PERSONALITIES, PHASE_CONFIG } from '../_lib/types';
import { workshopApi } from '../_lib/api';

export default function NewWorkshopPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Basic Info
  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');

  // Step 2: Agent Selection
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(
    new Set(['creative', 'pragmatic', 'technical'])
  );

  // Step 3: Configuration
  const [targetIdeas, setTargetIdeas] = useState(20);

  // Validation
  const isStep1Valid = title.trim().length >= 5 && problem.trim().length >= 20;
  const isStep2Valid = selectedAgents.size >= 3 && selectedAgents.size <= 5;

  const toggleAgent = (agentId: string) => {
    const newSelected = new Set(selectedAgents);
    if (newSelected.has(agentId)) {
      if (newSelected.size > 3) {
        newSelected.delete(agentId);
      }
    } else {
      if (newSelected.size < 5) {
        newSelected.add(agentId);
      }
    }
    setSelectedAgents(newSelected);
  };

  const handleSubmit = async () => {
    if (!isStep1Valid || !isStep2Valid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await workshopApi.create({
        title: title.trim(),
        initial_problem: problem.trim(),
        agent_personalities: Array.from(selectedAgents),
        target_ideas_count: targetIdeas,
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      if (result.data) {
        const data = result.data as { workshop_id?: string; id?: string };
        const workshopId = data.workshop_id || data.id;
        if (workshopId) {
          router.push(`/home/designer/workshops/${workshopId}`);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  const estimatedDuration = () => {
    const agentCount = selectedAgents.size;
    const phase1 = 5;
    const phase2 = Math.ceil(targetIdeas / agentCount) * 2;
    const phase3 = 5;
    const phase4 = 5;
    const phase5 = 2;
    const phase6 = 1;
    return phase1 + phase2 + phase3 + phase4 + phase5 + phase6;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => step > 1 ? setStep(step - 1) : router.back()}
          >
            ← Retour
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">
              Créer un Workshop
            </h1>
            <p className="text-muted-foreground">Étape {step}/3</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <button
                onClick={() => s <= step && setStep(s)}
                className={cn(
                  'w-10 h-10 rounded-full font-semibold transition-all',
                  s === step && 'bg-primary text-white shadow-lg',
                  s < step && 'bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600',
                  s > step && 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                )}
              >
                {s < step ? '✓' : s}
              </button>
              {s < 3 && (
                <div
                  className={cn(
                    'flex-1 h-1 rounded-full',
                    s < step ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
            <CardContent className="pt-6">
              <p className="text-red-600 dark:text-red-400">❌ {error}</p>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Problem Description */}
        {step === 1 && (
          <Card className="border-primary/20">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle>📋 Décrivez votre problème de design</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Titre du workshop *
                </Label>
                <Input
                  id="title"
                  placeholder="Ex: Support Mural Enceinte Bluetooth"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg py-3 h-auto"
                  maxLength={200}
                />
                <p className="text-sm text-muted-foreground">
                  {title.length}/200 caractères (min. 5)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="problem" className="text-base font-semibold">
                  Problème initial * (20-500 caractères)
                </Label>
                <Textarea
                  id="problem"
                  placeholder="Concevoir un support mural minimaliste pour une enceinte Bluetooth de 2kg. L'installation doit être facile et ne pas nécessiter de perçage. Le design doit s'intégrer dans un intérieur moderne."
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  className="min-h-[150px] text-base"
                  maxLength={500}
                />
                <p className="text-sm text-muted-foreground">
                  {problem.length}/500 caractères (min. 20)
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 <strong>Astuce:</strong> Soyez spécifique sur les contraintes (poids, dimensions, budget, matériaux souhaités)
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  size="lg"
                  onClick={() => setStep(2)}
                  disabled={!isStep1Valid}
                >
                  Suivant →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Agent Selection */}
        {step === 2 && (
          <Card className="border-primary/20">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle>👥 Choisissez votre équipe d'agents IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  Sélectionnez 3 à 5 agents pour votre workshop
                </p>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {selectedAgents.size} sélectionné{selectedAgents.size > 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(AGENT_PERSONALITIES).map(([id, agent]) => (
                  <AgentCard
                    key={id}
                    agentId={id}
                    isSelected={selectedAgents.has(id)}
                    onSelect={() => toggleAgent(id)}
                    size="md"
                    showDetails={true}
                  />
                ))}
              </div>

              {/* Target Ideas Slider */}
              <div className="space-y-4 pt-4 border-t">
                <Label className="text-base font-semibold">
                  Nombre d'idées cibles: {targetIdeas}
                </Label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">10</span>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={targetIdeas}
                    onChange={(e) => setTargetIdeas(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                  />
                  <span className="text-sm text-muted-foreground">100</span>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  ← Retour
                </Button>
                <Button
                  size="lg"
                  onClick={() => setStep(3)}
                  disabled={!isStep2Valid}
                >
                  Suivant →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <Card className="border-primary/20">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-t-lg">
              <CardTitle>✅ Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Title */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">📋 Titre</p>
                <p className="text-lg font-semibold">{title}</p>
              </div>

              {/* Problem */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">📝 Problème</p>
                <p className="text-foreground">{problem}</p>
              </div>

              {/* Team */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  👥 Équipe ({selectedAgents.size} agents)
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedAgents).map((agentId) => {
                    const agent = AGENT_PERSONALITIES[agentId];
                    return agent ? (
                      <Badge key={agentId} variant="secondary" className="text-sm py-1 px-3">
                        {agent.icon} {agent.name} ({agentId})
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Target */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">🎯 Objectif</p>
                <p className="text-foreground">{targetIdeas} idées à générer en Phase 2</p>
              </div>

              {/* Duration Estimate */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">⏱️ Durée estimée</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {PHASE_CONFIG.slice(1).map((phase) => (
                    <div key={phase.number} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {phase.icon} Phase {phase.number} ({phase.name})
                      </span>
                      <span>~{phase.number === 2 ? Math.ceil(targetIdeas / selectedAgents.size) * 2 : phase.number === 6 ? 0.5 : 5} min</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total estimé</span>
                  <span>~{estimatedDuration()} minutes</span>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  ← Retour
                </Button>
                <Button
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Création...
                    </>
                  ) : (
                    <>
                      🚀 Démarrer
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
