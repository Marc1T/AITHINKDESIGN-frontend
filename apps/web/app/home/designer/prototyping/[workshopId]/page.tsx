// =============================================================================
// app/home/designer/prototyping/[workshopId]/page.tsx
// Page de prototypage - Génération de visuels 2D pour une idée de workshop
// =============================================================================

'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Wand2, 
  Image as ImageIcon, 
  Loader2, 
  Download, 
  RefreshCw,
  Eye,
  Palette,
  Grid3X3,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@kit/ui/radio-group';
import { Checkbox } from '@kit/ui/checkbox';

import type { Render2DPrototype, RenderStyle } from '~/api/prototyping/render-2d/types';
import type { PrototypingSession, PrototypeData } from '../types';

const VIEW_OPTIONS = [
  { id: 'front', label: 'Avant' },
  { id: 'back', label: 'Arrière' },
  { id: 'top', label: 'Dessus' },
  { id: 'bottom', label: 'Dessous' },
  { id: 'left', label: 'Gauche' },
  { id: 'right', label: 'Droite' },
] as const;

const RESULT_KEY = 'prototyping_result';
const STORAGE_KEY_PREFIX = 'prototyping_session_';

type GenerationPhase = 'config' | 'generating' | 'results';

interface IdeaData {
  id: string;
  title: string;
  description: string;
}

export default function PrototypingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const workshopId = params.workshopId as string;
  const ideaId = searchParams.get('idea');

  // State
  const [phase, setPhase] = useState<GenerationPhase>('config');
  const [idea, setIdea] = useState<IdeaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [prompt, setPrompt] = useState('');
  const [renderStyle, setRenderStyle] = useState<RenderStyle>('realistic');
  const [numPrototypes, setNumPrototypes] = useState(3);
  const [selectedViews, setSelectedViews] = useState<string[]>([]);
  
  // Results state
  const [prototypes, setPrototypes] = useState<Render2DPrototype[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedPrototype, setSelectedPrototype] = useState<number>(0);

  // Charger les données de l'idée
  useEffect(() => {
    const loadIdeaData = async () => {
      if (!ideaId) {
        setLoading(false);
        return;
      }

      try {
        // Essayer de charger depuis le sessionStorage
        const storedData = sessionStorage.getItem(`workshop_${workshopId}_idea_${ideaId}`);
        if (storedData) {
          const parsed = JSON.parse(storedData);
          setIdea(parsed);
          setPrompt(parsed.description || parsed.title || '');
        }
        
        // Charger aussi les résultats précédents s'ils existent
        const storedResults = sessionStorage.getItem(RESULT_KEY);
        if (storedResults) {
          const results = JSON.parse(storedResults);
          if (results.workshopId === workshopId && results.ideaId === ideaId) {
            setPrototypes(results.prototypes || []);
            if (results.prototypes?.length > 0) {
              setPhase('results');
            }
          }
        }
      } catch (err) {
        console.error('Failed to load idea data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadIdeaData();
  }, [workshopId, ideaId]);

  const toggleView = (viewId: string) => {
    setSelectedViews(prev => 
      prev.includes(viewId) 
        ? prev.filter(v => v !== viewId)
        : [...prev, viewId]
    );
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Veuillez entrer une description du prototype');
      return;
    }

    setError(null);
    setPhase('generating');
    setGenerationProgress(0);
    setPrototypes([]);

    try {
      // Simulation de progression pendant la génération
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 2000);

      const response = await fetch('/api/prototyping/render-2d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: prompt,
          renderStyle,
          numPrototypes,
          views: selectedViews,
          referenceType: 'none',
          workshopId,
          ideaId,
          ideaTitle: idea?.title,
          ideaDescription: idea?.description,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Erreur lors de la génération');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Erreur de génération');
      }

      const generatedPrototypes = data.outputs?.prototypes || [];
      setPrototypes(generatedPrototypes);
      setGenerationProgress(100);
      
      // Créer la session pour la page de résultats
      const runId = crypto.randomUUID();
      const prototypeDataList: PrototypeData[] = generatedPrototypes
        .filter((p: Render2DPrototype) => p.status === 'ok' && p.imageUrl)
        .map((p: Render2DPrototype, idx: number) => ({
          index: idx + 1,
          imageUrl: p.imageUrl,
          finalPrompt: p.finalPrompt || prompt,
          branch: 'original' as const,
          referenceType: 'generate' as const,
        }));

      const sessionData: PrototypingSession = {
        workshopId,
        runId,
        style: renderStyle,
        prototypes: prototypeDataList,
        createdAt: new Date().toISOString(),
      };

      // Sauvegarder la session
      sessionStorage.setItem(STORAGE_KEY_PREFIX + workshopId, JSON.stringify(sessionData));

      // Sauvegarder les résultats (ancien format pour compatibilité)
      sessionStorage.setItem(RESULT_KEY, JSON.stringify({
        workshopId,
        ideaId,
        prototypes: generatedPrototypes,
        timestamp: new Date().toISOString(),
      }));

      setTimeout(() => {
        // Rediriger vers la page de résultats enrichie
        router.push(`/home/designer/prototyping/${workshopId}/results`);
      }, 500);

    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération');
      setPhase('config');
    }
  };

  const handleDownload = async (prototype: Render2DPrototype) => {
    if (!prototype.imageUrl) return;
    
    try {
      const response = await fetch(prototype.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prototype-${prototype.index}-${renderStyle}.webp`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleReset = () => {
    setPhase('config');
    setPrototypes([]);
    setGenerationProgress(0);
    sessionStorage.removeItem(RESULT_KEY);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.push(`/home/designer/workshops/${workshopId}`)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Prototypage IA</h1>
          <p className="text-muted-foreground">
            Générez des visuels 2D de votre concept produit
          </p>
        </div>
      </div>

      {/* Idea Context */}
      {idea && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">{idea.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {idea.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Card className="mb-6 border-destructive/50 bg-destructive/10">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Phase */}
      {phase === 'config' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Description du Prototype
                </CardTitle>
                <CardDescription>
                  Décrivez le produit que vous souhaitez visualiser
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Une lampe de bureau moderne avec un bras articulé, une base en bois naturel et un abat-jour en métal brossé..."
                  rows={5}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Style de Rendu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={renderStyle}
                  onValueChange={(value) => setRenderStyle(value as RenderStyle)}
                  className="grid grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="realistic"
                    className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      renderStyle === 'realistic' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="realistic" id="realistic" className="sr-only" />
                    <ImageIcon className="w-8 h-8" />
                    <div className="text-center">
                      <div className="font-medium">Réaliste</div>
                      <div className="text-xs text-muted-foreground">Photo produit 3D</div>
                    </div>
                  </Label>
                  <Label
                    htmlFor="sketch"
                    className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      renderStyle === 'sketch' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="sketch" id="sketch" className="sr-only" />
                    <Grid3X3 className="w-8 h-8" />
                    <div className="text-center">
                      <div className="font-medium">Technique</div>
                      <div className="text-xs text-muted-foreground">Dessin industriel</div>
                    </div>
                  </Label>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Options */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Vues (optionnel)
                </CardTitle>
                <CardDescription>
                  Sélectionnez les angles de vue souhaités
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {VIEW_OPTIONS.map((view) => (
                    <Label
                      key={view.id}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedViews.includes(view.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <Checkbox
                        checked={selectedViews.includes(view.id)}
                        onCheckedChange={() => toggleView(view.id)}
                      />
                      <span className="text-sm">{view.label}</span>
                    </Label>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nombre de Prototypes</CardTitle>
                <CardDescription>
                  Générez plusieurs variantes (1-5)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={numPrototypes}
                    onChange={(e) => setNumPrototypes(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-20"
                  />
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Button
                        key={n}
                        variant={numPrototypes === n ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNumPrototypes(n)}
                      >
                        {n}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button 
              onClick={handleGenerate} 
              size="lg" 
              className="w-full"
              disabled={!prompt.trim()}
            >
              <Wand2 className="w-5 h-5 mr-2" />
              Générer {numPrototypes} Prototype{numPrototypes > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}

      {/* Generating Phase */}
      {phase === 'generating' && (
        <Card className="max-w-xl mx-auto">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-muted" />
                <div 
                  className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"
                  style={{ animationDuration: '1.5s' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{generationProgress}%</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Génération en cours...</h3>
                <p className="text-muted-foreground">
                  Création de {numPrototypes} prototype{numPrototypes > 1 ? 's' : ''} {renderStyle === 'realistic' ? 'réaliste' : 'technique'}{numPrototypes > 1 ? 's' : ''}
                </p>
              </div>

              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>

              <p className="text-sm text-muted-foreground">
                ⏱️ Temps estimé: ~{numPrototypes * 15} secondes
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Phase */}
      {phase === 'results' && prototypes.length > 0 && (
        <div className="space-y-6">
          {/* Actions Bar */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {prototypes.filter(p => p.status === 'ok').length} / {prototypes.length} prototypes générés
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Nouvelle Génération
              </Button>
              <Button onClick={() => router.push(`/home/designer/prototyping/${workshopId}/results`)}>
                <ArrowRight className="w-4 h-4 mr-2" />
                Édition & BOM
              </Button>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {prototypes.map((prototype, index) => (
              <Card 
                key={index}
                className={`overflow-hidden cursor-pointer transition-all ${
                  selectedPrototype === index ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedPrototype(index)}
              >
                <div className="aspect-square relative bg-muted">
                  {prototype.status === 'ok' && prototype.imageUrl ? (
                    <img
                      src={prototype.imageUrl}
                      alt={`Prototype ${prototype.index}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <AlertCircle className="w-12 h-12" />
                    </div>
                  )}
                  
                  {/* Overlay with actions */}
                  {prototype.status === 'ok' && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(prototype);
                        }}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Télécharger
                      </Button>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Prototype {prototype.index}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      prototype.status === 'ok' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {prototype.status === 'ok' ? 'Succès' : 'Échec'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Prototype Details */}
          {prototypes[selectedPrototype] && prototypes[selectedPrototype].status === 'ok' && (
            <Card>
              <CardHeader>
                <CardTitle>Prototype {prototypes[selectedPrototype].index} - Détails</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img
                      src={prototypes[selectedPrototype].imageUrl}
                      alt={`Prototype ${prototypes[selectedPrototype].index}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Style de rendu</Label>
                      <p className="font-medium capitalize">{prototypes[selectedPrototype].renderStyle}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Prompt utilisé</Label>
                      <p className="text-sm">{prototypes[selectedPrototype]?.finalPrompt?.substring(0, 200)}...</p>
                    </div>
                    <div className="pt-4">
                      <Button onClick={() => prototypes[selectedPrototype] && handleDownload(prototypes[selectedPrototype])} className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger l'image
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Back to Workshop */}
          <div className="flex justify-center pt-4">
            <Button 
              variant="outline"
              onClick={() => router.push(`/home/designer/workshops/${workshopId}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au Workshop
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
