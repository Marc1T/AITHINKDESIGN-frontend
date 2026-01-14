/**
 * Phase 5 - Selection Finale ancienne version
 * Final idea selection and cahier de charge generation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Badge } from '@kit/ui/badge';
import { Textarea } from '@kit/ui/textarea';
import { cn } from '@kit/ui/utils';
import { type Workshop, type SSEEvent, type Idea, type CahierDeCharge } from '../../_lib/types';
import { phase3Api, phase5Api } from '../../_lib/api';
import { 
  Spinner, 
  RankBadge,
  Trophy, 
  XCircle, 
  Check, 
  MessageSquare, 
  FileText, 
  Download,
  Home,
  BarChart2,
  ClipboardList,
  PartyPopper,
  Clock
} from '../../_lib/icons';

interface Phase5Props {
  workshop: Workshop;
  workshopId: string;
  onAdvancePhase: (phase: number) => void;
  isAdvancing: boolean;
  sseEvents: SSEEvent[];
  refetch: () => void;
}

export default function Phase5Selection({
  workshop,
  workshopId,
}: Phase5Props) {
  const [selectedIdeas, setSelectedIdeas] = useState<Idea[]>([]);
  const [finalIdeaId, setFinalIdeaId] = useState<string | null>(null);
  const [justification, setJustification] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [cahierDeCharge, setCahierDeCharge] = useState<CahierDeCharge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<'selection' | 'generating' | 'result'>('selection');

  // Load selected ideas on mount
  useEffect(() => {
    loadSelectedIdeas();
  }, [workshopId]);

  const loadSelectedIdeas = async () => {
    try {
      const result = await phase3Api.getSelectedIdeas(workshopId);
      if (result.data && Array.isArray(result.data)) {
        setSelectedIdeas(result.data as Idea[]);
      }
    } catch (err) {
      console.error('Failed to load selected ideas:', err);
    }
  };

  const handleConfirmSelection = async () => {
    if (!finalIdeaId) {
      setError('Veuillez sélectionner une idée finale');
      return;
    }

    setIsConfirming(true);
    setError(null);
    setPhase('generating');

    try {
      // Step 1: Select final idea
      console.log('📌 Step 1: Selecting final idea...');
      const selectResult = await phase5Api.selectFinal(workshopId, finalIdeaId, justification);
      if (selectResult.error) {
        const errorMsg = typeof selectResult.error === 'string' 
          ? selectResult.error 
          : selectResult.error.message || 'Erreur lors de la sélection';
        setError(errorMsg);
        setIsConfirming(false);
        setPhase('selection');
        return;
      }
      console.log('✅ Final idea selected');

      // Step 2: Generate cahier de charge
      console.log('📄 Step 2: Generating cahier de charge...');
      const cahierResult = await phase5Api.generateCahier(workshopId);
      if (cahierResult.error) {
        const errorMsg = typeof cahierResult.error === 'string' 
          ? cahierResult.error 
          : cahierResult.error.message || 'Erreur lors de la génération';
        setError(errorMsg);
        setIsConfirming(false);
        setPhase('generating'); // Stay on generating to show error
        return;
      }
      console.log('✅ Cahier de charge generated:', cahierResult.data);

      // Set the result and transition
      // The backend returns { status, workshop_id, ideation_id, message }
      // We create a minimal CahierDeCharge object for display
      const cahier: CahierDeCharge = {
        id: `cahier-${workshop.id}`,
        title: workshop.title,
        content: 'Cahier de charge généré avec succès',
        context: workshop.problem_description,
        objectives: ['Cahier de charge généré avec succès'],
        functional_specs: [],
        constraints: [],
        timeline: 'À définir',
        budget: 'À définir',
        created_at: new Date().toISOString()
      };
      setCahierDeCharge(cahier);
      setPhase('result');
      setIsConfirming(false);
      
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err instanceof Error ? err.message : 'Erreur');
      setIsConfirming(false);
      setPhase('selection');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const result = await phase5Api.downloadCahierCharge(workshopId);
      if (result.data) {
        // Create blob and download
        const blob = new Blob([result.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cahier-de-charge-${workshopId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('Erreur lors du téléchargement');
    }
  };

  const selectedIdea = selectedIdeas.find((i) => i.id === finalIdeaId);

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-t-lg">
        <CardTitle className="text-xl flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Phase 5 - Sélection Finale
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg text-red-600 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Selection Phase */}
        {phase === 'selection' && (
          <>
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Choisissez l'Idée Finale
              </h3>
              <p className="text-muted-foreground">
                Sélectionnez l'idée qui sera développée dans le Cahier de Charge
              </p>

              <div className="space-y-3">
                {selectedIdeas.map((idea, i) => (
                  <div
                    key={idea.id}
                    onClick={() => setFinalIdeaId(idea.id)}
                    className={cn(
                      'p-4 rounded-lg cursor-pointer transition-all border-2',
                      finalIdeaId === idea.id
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent bg-muted/50 hover:bg-muted'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold w-8 flex items-center justify-center">
                        <RankBadge rank={i + 1} />
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">{idea.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{idea.description}</p>
                        {idea.triz_enrichment && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {idea.triz_principles?.slice(0, 3).map((p, j) => (
                              <Badge key={j} variant="secondary" className="text-xs">
                                TRIZ: {p}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                          finalIdeaId === idea.id ? 'bg-primary border-primary text-white' : 'border-gray-300'
                        )}
                      >
                        {finalIdeaId === idea.id && <Check className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Justification */}
            <div className="space-y-2">
              <label className="font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Justification (optionnel)
              </label>
              <Textarea
                placeholder="Expliquez pourquoi cette idée a été choisie..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              size="lg"
              onClick={handleConfirmSelection}
              disabled={!finalIdeaId || isConfirming}
              className="w-full gap-2"
            >
              {isConfirming ? (
                <>
                  <Spinner size="sm" />
                  Génération...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Générer le Cahier de Charge
                </>
              )}
            </Button>
          </>
        )}

        {/* Generating Phase */}
        {phase === 'generating' && (
          <>
            <div className="text-center py-8">
              <div className="text-6xl mb-4 animate-bounce flex items-center justify-center">
                <FileText className="w-16 h-16 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Génération en cours...</h3>
              <p className="text-muted-foreground">
                Création du Cahier de Charge Technique
              </p>
            </div>

            {/* Selected Idea Summary */}
            {selectedIdea && (
              <div className="p-4 rounded-lg border bg-primary/5">
                <p className="font-medium">{selectedIdea.title}</p>
                <p className="text-sm text-muted-foreground">{selectedIdea.description}</p>
              </div>
            )}

            {/* Progress Steps */}
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-600" />
                <span>Idée finale sélectionnée</span>
              </div>
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900 animate-pulse flex items-center gap-3">
                <Spinner size="sm" />
                <span>Génération du document PDF...</span>
              </div>
              <div className="p-3 rounded-lg bg-muted flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span>Préparation du téléchargement</span>
              </div>
            </div>
          </>
        )}

        {/* Result Phase */}
        {phase === 'result' && (
          <>
            <div className="text-center py-6">
              <div className="text-6xl mb-4 flex items-center justify-center">
                <PartyPopper className="w-16 h-16 text-amber-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Workshop Terminé !</h3>
              <p className="text-muted-foreground">
                Le Cahier de Charge a été généré avec succès
              </p>
            </div>

            {/* Final Idea */}
            {selectedIdea && (
              <div className="p-4 rounded-lg border bg-primary/5">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Idée Retenue
                </h4>
                <p className="font-bold text-lg">{selectedIdea.title}</p>
                <p className="text-muted-foreground">{selectedIdea.description}</p>
              </div>
            )}

            {/* Download Section */}
            <div className="p-6 rounded-lg border bg-card text-center">
              <div className="text-5xl mb-4 flex items-center justify-center">
                <FileText className="w-12 h-12 text-primary" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Cahier de Charge Technique</h4>
              <p className="text-muted-foreground mb-4">
                Document PDF conforme à la norme NF EN 16271
              </p>
              <Button
                size="lg"
                onClick={handleDownloadPDF}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Télécharger le PDF
              </Button>
            </div>

            {/* Workshop Summary */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Résumé du Workshop
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg border">
                  <h5 className="font-medium mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Contexte
                  </h5>
                  <p className="text-sm text-muted-foreground">
                    {workshop.problem_description || 'Contexte du projet'}
                  </p>
                </div>

                <div className="p-4 rounded-lg border">
                  <h5 className="font-medium mb-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Concept Final
                  </h5>
                  <p className="text-sm text-muted-foreground">
                    {selectedIdea?.title || 'Concept sélectionné'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.location.href = '/home/designer/workshops'}
                className="flex-1 gap-2"
              >
                <Home className="w-4 h-4" />
                Retour au Dashboard
              </Button>
            </div>

            {/* Workshop Stats */}
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <BarChart2 className="w-4 h-4" />
                Statistiques du Workshop
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{workshop.agent_personalities?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Agents</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{workshop.total_ideas || 0}</p>
                  <p className="text-xs text-muted-foreground">Idées générées</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">5</p>
                  <p className="text-xs text-muted-foreground">Phases complétées</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{workshop.duration || '~1h'}</p>
                  <p className="text-xs text-muted-foreground">Durée totale</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
