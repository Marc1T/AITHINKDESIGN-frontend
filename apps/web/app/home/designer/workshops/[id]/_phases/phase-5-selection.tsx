/**
 * Phase 5 - Sélection Finale & Rapport
 * Final idea selection, workshop report generation, and prototyping option
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Badge } from '@kit/ui/badge';
import { Textarea } from '@kit/ui/textarea';
import { cn } from '@kit/ui/utils';
import { type Workshop, type SSEEvent, type Idea } from '../../_lib/types';
import { phase3Api, phase4Api, phase5Api } from '../../_lib/api';
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
  Clock,
  Wrench,
  ArrowRight,
  Lightbulb,
  Users,
  Target,
  Zap
} from '../../_lib/icons';

interface Phase5Props {
  workshop: Workshop;
  workshopId: string;
  onAdvancePhase: (phase: number) => void;
  isAdvancing: boolean;
  sseEvents: SSEEvent[];
  refetch: () => void;
}

interface WorkshopReport {
  workshop: {
    title: string;
    description: string;
    created_at: string;
  };
  phases: {
    phase1: { empathy_data?: any };
    phase2: { ideas_count: number; techniques: string[] };
    phase3: { voting_method: string; votes_count: number; selected_count: number };
    phase4: { triz_analyses_count: number };
    phase5: { final_idea: Idea | null; justification: string };
  };
  statistics: {
    total_ideas: number;
    agents_count: number;
    duration: string;
  };
}

export default function Phase5Selection({
  workshop,
  workshopId,
  refetch,
}: Phase5Props) {
  const [selectedIdeas, setSelectedIdeas] = useState<Idea[]>([]);
  const [finalIdeaId, setFinalIdeaId] = useState<string | null>(null);
  const [justification, setJustification] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<WorkshopReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<'selection' | 'choice' | 'generating-report' | 'report' | 'prototyping'>('selection');
  const [trizResults, setTrizResults] = useState<Record<string, any>>({});

  // Load data on mount
  useEffect(() => {
    loadSelectedIdeas();
    loadTrizResults();
    loadExistingReport();
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

  const loadTrizResults = async () => {
    try {
      const result = await phase4Api.getResults(workshopId);
      if (result.data && (result.data as any).analyses) {
        setTrizResults((result.data as any).analyses);
      }
    } catch (err) {
      console.error('Failed to load TRIZ results:', err);
    }
  };

  const loadExistingReport = async () => {
    try {
      const result = await phase5Api.getSummary(workshopId);
      if (result.data && (result.data as any).report) {
        setReport((result.data as any).report);
        setPhase('report');
      }
    } catch (err) {
      // No existing report, that's fine
    }
  };

  const handleSelectIdea = () => {
    if (!finalIdeaId) {
      setError('Veuillez sélectionner une idée finale');
      return;
    }
    setError(null);
    setPhase('choice');
  };

  const handleGenerateReport = async () => {
    if (!finalIdeaId) return;

    setIsGenerating(true);
    setError(null);
    setPhase('generating-report');

    try {
      // Step 1: Select final idea
      console.log('📌 Selecting final idea...');
      const selectResult = await phase5Api.selectFinal(workshopId, finalIdeaId, justification);
      if (selectResult.error) {
        throw new Error(typeof selectResult.error === 'string' ? selectResult.error : selectResult.error.message);
      }

      // Step 2: Generate report
      console.log('📄 Generating workshop report...');
      const reportResult = await phase5Api.generateReport(workshopId);
      if (reportResult.error) {
        throw new Error(typeof reportResult.error === 'string' ? reportResult.error : reportResult.error.message);
      }

      // Use report from API response
      const apiReport = (reportResult.data as any)?.report;
      const selectedIdea = selectedIdeas.find(i => i.id === finalIdeaId);
      
      // Build report from API data or fallback to local data
      const generatedReport: WorkshopReport = apiReport ? {
        workshop: {
          title: apiReport.workshop?.title || workshop.title,
          description: apiReport.workshop?.description || '',
          created_at: apiReport.workshop?.created_at || workshop.created_at,
        },
        phases: {
          phase1: { empathy_data: apiReport.phases?.phase1_empathy?.data },
          phase2: { 
            ideas_count: apiReport.phases?.phase2_ideation?.ideas_generated || 0,
            techniques: apiReport.phases?.phase2_ideation?.techniques_used || []
          },
          phase3: { 
            voting_method: apiReport.phases?.phase3_convergence?.voting_method || 'dot_voting',
            votes_count: apiReport.phases?.phase3_convergence?.total_votes || 0,
            selected_count: apiReport.phases?.phase3_convergence?.ideas_selected || selectedIdeas.length
          },
          phase4: { 
            triz_analyses_count: apiReport.phases?.phase4_triz?.analyses_count || 0
          },
          phase5: { 
            final_idea: apiReport.phases?.phase5_selection?.final_idea || selectedIdea || null,
            justification: apiReport.phases?.phase5_selection?.justification || justification
          }
        },
        statistics: {
          total_ideas: apiReport.statistics?.total_ideas_generated || 0,
          agents_count: apiReport.statistics?.agents_participated || 0,
          duration: '~1h'
        }
      } : {
        workshop: {
          title: workshop.title,
          description: '',
          created_at: workshop.created_at,
        },
        phases: {
          phase1: { empathy_data: null },
          phase2: { ideas_count: selectedIdeas.length, techniques: [] },
          phase3: { voting_method: 'dot_voting', votes_count: 0, selected_count: selectedIdeas.length },
          phase4: { triz_analyses_count: Object.keys(trizResults).length },
          phase5: { final_idea: selectedIdea || null, justification: justification }
        },
        statistics: {
          total_ideas: selectedIdeas.length,
          agents_count: 0,
          duration: '~1h'
        }
      };

      console.log('📊 Report data:', generatedReport);
      setReport(generatedReport);
      setPhase('report');
      setIsGenerating(false);
      refetch();

    } catch (err) {
      console.error('❌ Error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération');
      setIsGenerating(false);
      setPhase('choice');
    }
  };

  const handleStartPrototyping = async () => {
    if (!finalIdeaId) return;

    try {
      // Select the idea if not already done
      await phase5Api.selectFinal(workshopId, finalIdeaId, justification);
      
      // Get the selected idea data
      const selectedIdea = selectedIdeas.find(i => i.id === finalIdeaId);
      
      // Store idea data in sessionStorage for the prototyping page
      if (selectedIdea) {
        sessionStorage.setItem(`workshop_${workshopId}_idea_${finalIdeaId}`, JSON.stringify({
          id: selectedIdea.id,
          title: selectedIdea.title,
          description: selectedIdea.description,
        }));
      }
      
      // Navigate to prototyping page
      window.location.href = `/home/designer/prototyping/${workshopId}?idea=${finalIdeaId}`;
    } catch (err) {
      setError('Erreur lors du démarrage du prototypage');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      console.log('📥 Downloading PDF report...');
      const result = await phase5Api.downloadReport(workshopId);
      console.log('📥 Download result:', result);
      
      if (result.error) {
        console.error('❌ Download error:', result.error);
        setError(`Erreur: ${result.error.message || 'Téléchargement échoué'}`);
        return;
      }
      
      if (result.data) {
        const blob = new Blob([result.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport-workshop-${workshopId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log('✅ PDF downloaded successfully');
      } else {
        setError('Aucune donnée reçue pour le PDF');
      }
    } catch (err) {
      console.error('❌ Download exception:', err);
      setError('Erreur lors du téléchargement');
    }
  };

  const selectedIdea = selectedIdeas.find((i) => i.id === finalIdeaId);
  const ideaTrizData = finalIdeaId ? trizResults[finalIdeaId] : null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <CardTitle className="text-xl flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Phase 5 - Finalisation
        </CardTitle>
        <p className="text-amber-100 text-sm mt-1">
          {phase === 'selection' && 'Sélectionnez l\'idée finale pour votre projet'}
          {phase === 'choice' && 'Choisissez votre prochaine action'}
          {phase === 'generating-report' && 'Génération du rapport en cours...'}
          {phase === 'report' && 'Votre rapport est prêt !'}
          {phase === 'prototyping' && 'Préparation du prototypage...'}
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 flex items-center gap-2">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ============ SELECTION PHASE ============ */}
        {phase === 'selection' && (
          <>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Choisissez l'Idée Finale
              </h3>
              <p className="text-muted-foreground">
                Sélectionnez l'idée qui sera retenue pour le projet final
              </p>

              <div className="space-y-3">
                {selectedIdeas.map((idea, i) => {
                  const isSelected = finalIdeaId === idea.id;
                  const hasTriz = trizResults[idea.id];
                  
                  return (
                    <div
                      key={idea.id}
                      onClick={() => setFinalIdeaId(idea.id)}
                      className={cn(
                        'p-4 rounded-xl cursor-pointer transition-all duration-200 border-2',
                        isSelected
                          ? 'border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 shadow-lg'
                          : 'border-transparent bg-muted/50 hover:bg-muted hover:shadow-md'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <RankBadge rank={i + 1} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{idea.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{idea.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {hasTriz && (
                              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                <Wrench className="w-3 h-3 mr-1" /> TRIZ analysé
                              </Badge>
                            )}
                            {idea.votes_count && idea.votes_count > 0 && (
                              <Badge variant="secondary">
                                {idea.votes_count} votes
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div
                          className={cn(
                            'w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all',
                            isSelected
                              ? 'bg-amber-500 border-amber-500 text-white'
                              : 'border-gray-300 dark:border-gray-600'
                          )}
                        >
                          {isSelected && <Check className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                className="resize-none"
              />
            </div>

            <Button
              size="lg"
              onClick={handleSelectIdea}
              disabled={!finalIdeaId}
              className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              Continuer
              <ArrowRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* ============ CHOICE PHASE ============ */}
        {phase === 'choice' && selectedIdea && (
          <>
            {/* Selected Idea Summary */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500 text-white">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-amber-600 dark:text-amber-400">Idée sélectionnée</p>
                  <p className="font-semibold">{selectedIdea.title}</p>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-lg text-center">Que souhaitez-vous faire ?</h3>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Generate Report Card */}
              <div
                onClick={handleGenerateReport}
                className="p-6 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 cursor-pointer hover:shadow-lg transition-all group"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-indigo-700 dark:text-indigo-300">Générer le Rapport</h4>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                      Créer un rapport complet du workshop avec toutes les phases
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <ClipboardList className="w-3 h-3 mr-1" /> Résumé complet
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Download className="w-3 h-3 mr-1" /> Export PDF
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Prototyping Card */}
              <div
                onClick={handleStartPrototyping}
                className="p-6 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 cursor-pointer hover:shadow-lg transition-all group"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-emerald-700 dark:text-emerald-300">Prototypage</h4>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                      Continuer vers la création d'un prototype de l'idée
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <Lightbulb className="w-3 h-3 mr-1" /> Conception
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Wrench className="w-3 h-3 mr-1" /> Prototype
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setPhase('selection')}
              className="w-full"
            >
              ← Changer l'idée sélectionnée
            </Button>
          </>
        )}

        {/* ============ GENERATING REPORT PHASE ============ */}
        {phase === 'generating-report' && (
          <div className="py-12 text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-6 rounded-full bg-indigo-100 dark:bg-indigo-900 animate-pulse">
                <FileText className="w-16 h-16 text-indigo-500" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-xl">Génération du Rapport...</h3>
              <p className="text-muted-foreground mt-2">
                Compilation de toutes les données du workshop
              </p>
            </div>
            <div className="space-y-3 max-w-md mx-auto">
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-600" />
                <span className="text-sm">Phase 1 - Empathie</span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-600" />
                <span className="text-sm">Phase 2 - Idéation</span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-600" />
                <span className="text-sm">Phase 3 - Convergence</span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-600" />
                <span className="text-sm">Phase 4 - TRIZ</span>
              </div>
              <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center gap-3 animate-pulse">
                <Spinner size="sm" />
                <span className="text-sm">Compilation du rapport...</span>
              </div>
            </div>
          </div>
        )}

        {/* ============ REPORT PHASE ============ */}
        {phase === 'report' && report && (
          <>
            {/* Success Header */}
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900">
                  <PartyPopper className="w-12 h-12 text-amber-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold">Workshop Terminé !</h3>
              <p className="text-muted-foreground mt-1">
                Votre rapport a été généré avec succès
              </p>
            </div>

            {/* Final Idea Card */}
            {report.phases.phase5.final_idea && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border border-amber-200 dark:border-amber-800">
                <h4 className="font-medium mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <Trophy className="w-4 h-4" />
                  Idée Retenue
                </h4>
                <p className="font-bold text-lg">{report.phases.phase5.final_idea.title}</p>
                <p className="text-muted-foreground text-sm mt-1">{report.phases.phase5.final_idea.description}</p>
              </div>
            )}

            {/* Workshop Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-center">
                <Users className="w-6 h-6 mx-auto text-indigo-500 mb-2" />
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {report.statistics.agents_count}
                </p>
                <p className="text-xs text-muted-foreground">Agents IA</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950 text-center">
                <Lightbulb className="w-6 h-6 mx-auto text-purple-500 mb-2" />
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {report.statistics.total_ideas}
                </p>
                <p className="text-xs text-muted-foreground">Idées générées</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-center">
                <Target className="w-6 h-6 mx-auto text-emerald-500 mb-2" />
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {report.phases.phase4.triz_analyses_count}
                </p>
                <p className="text-xs text-muted-foreground">Analyses TRIZ</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950 text-center">
                <Clock className="w-6 h-6 mx-auto text-amber-500 mb-2" />
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">5</p>
                <p className="text-xs text-muted-foreground">Phases complétées</p>
              </div>
            </div>

            {/* Download Section */}
            <div className="p-6 rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 text-center">
              <FileText className="w-10 h-10 mx-auto text-indigo-500 mb-3" />
              <h4 className="font-semibold text-lg mb-1">Rapport du Workshop</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Document PDF complet avec toutes les phases et résultats
              </p>
              <Button
                size="lg"
                onClick={handleDownloadPDF}
                className="gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
              >
                <Download className="w-4 h-4" />
                Télécharger le Rapport PDF
              </Button>
            </div>

            {/* Continue to Prototyping */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500 text-white">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-700 dark:text-emerald-300">
                      Continuer vers le Prototypage ?
                    </h4>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                      Créez un prototype de votre idée finale
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleStartPrototyping}
                  className="gap-2 bg-emerald-500 hover:bg-emerald-600"
                >
                  Prototypage
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/home/designer/workshops'}
                className="flex-1 gap-2"
              >
                <Home className="w-4 h-4" />
                Retour au Dashboard
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
