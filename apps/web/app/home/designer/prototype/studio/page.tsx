// =============================================================================
// apps/web/app/home/designer/prototype/studio/page.tsx
// Studio de prototypage autonome - Sans besoin de workshop
// =============================================================================

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Wand2,
  Loader2,
  Download,
  RefreshCw,
  Eye,
  Palette,
  Grid3X3,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@kit/ui/radio-group';
import { Checkbox } from '@kit/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';

// Types
type RenderStyle = 'realistic' | 'sketch';
type GenerationPhase = 'config' | 'generating' | 'results';

interface PrototypeResult {
  index: number;
  imageUrl: string;
  prompt: string;
  style: RenderStyle;
  status: 'ok' | 'failed';
}

interface NomenclatureItem {
  reference: string;
  designation: string;
  quantity: number;
  material: string;
  type: string;
  comment: string;
}

const VIEW_OPTIONS = [
  { id: 'front', label: 'Avant' },
  { id: 'back', label: 'Arrière' },
  { id: 'top', label: 'Dessus' },
  { id: 'bottom', label: 'Dessous' },
  { id: 'left', label: 'Gauche' },
  { id: 'right', label: 'Droite' },
] as const;

const SESSION_KEY = 'prototype_studio_session';

export default function PrototypeStudioPage() {
  const router = useRouter();

  // Phase state
  const [phase, setPhase] = useState<GenerationPhase>('config');
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [prompt, setPrompt] = useState('');
  const [renderStyle, setRenderStyle] = useState<RenderStyle>('realistic');
  const [numPrototypes, setNumPrototypes] = useState(3);
  const [selectedViews, setSelectedViews] = useState<string[]>([]);

  // Generation state
  const [generationProgress, setGenerationProgress] = useState(0);

  // Results state
  const [prototypes, setPrototypes] = useState<PrototypeResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [nomenclature, setNomenclature] = useState<NomenclatureItem[] | null>(null);

  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // BOM state
  const [bomLoading, setBomLoading] = useState(false);

  const selected = prototypes[selectedIndex] || null;

  const toggleView = (viewId: string) => {
    setSelectedViews((prev) =>
      prev.includes(viewId) ? prev.filter((v) => v !== viewId) : [...prev, viewId]
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
    setNomenclature(null);

    try {
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => Math.min(prev + 10, 90));
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

      const generatedPrototypes: PrototypeResult[] = (data.outputs?.prototypes || [])
        .filter((p: any) => p.status === 'ok' && p.imageUrl)
        .map((p: any, idx: number) => ({
          index: idx + 1,
          imageUrl: p.imageUrl,
          prompt: p.finalPrompt || prompt,
          style: renderStyle,
          status: 'ok' as const,
        }));

      setPrototypes(generatedPrototypes);
      setGenerationProgress(100);
      setSelectedIndex(0);

      // Save to session storage
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          prototypes: generatedPrototypes,
          timestamp: new Date().toISOString(),
        })
      );

      setTimeout(() => {
        setPhase('results');
      }, 500);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération');
      setPhase('config');
    }
  };

  const handleDownload = async (prototype: PrototypeResult) => {
    if (!prototype.imageUrl) return;

    try {
      const response = await fetch(prototype.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prototype-${prototype.index}-${prototype.style}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleEdit = async () => {
    if (!selected || !editPrompt.trim()) return;

    setEditLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/prototyping/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: selected.imageUrl,
          prompt: editPrompt.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error?.message || "Échec de l'édition");
      }

      const json = await res.json();

      if (json.status !== 'succeeded' || !json.exports?.images?.[0]?.url) {
        throw new Error("L'édition n'a pas produit d'image");
      }

      const newImageUrl = json.exports.images[0].url;

      const newPrototype: PrototypeResult = {
        index: prototypes.length + 1,
        imageUrl: newImageUrl,
        prompt: editPrompt.trim(),
        style: selected.style,
        status: 'ok',
      };

      const updatedPrototypes = [...prototypes, newPrototype];
      setPrototypes(updatedPrototypes);
      setSelectedIndex(updatedPrototypes.length - 1);
      setEditPrompt('');
      setEditDialogOpen(false);

      // Update session storage
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          prototypes: updatedPrototypes,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (err) {
      console.error('Edit error:', err);
      setError(err instanceof Error ? err.message : 'Erreur inattendue');
    } finally {
      setEditLoading(false);
    }
  };

  const handleGenerateBOM = async () => {
    if (!selected) return;

    setBomLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/prototyping/bom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: selected.imageUrl,
          prompt: selected.prompt,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error?.message || 'Échec de la génération BOM');
      }

      const json = await res.json();

      if (json.status !== 'succeeded' || !json.outputs?.nomenclature) {
        throw new Error('Nomenclature invalide');
      }

      setNomenclature(json.outputs.nomenclature);
    } catch (err) {
      console.error('BOM error:', err);
      setError(err instanceof Error ? err.message : 'Erreur inattendue');
    } finally {
      setBomLoading(false);
    }
  };

  const handleReset = () => {
    setPhase('config');
    setPrototypes([]);
    setGenerationProgress(0);
    setNomenclature(null);
    setSelectedIndex(0);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const goToPrevious = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      setNomenclature(null);
    }
  };

  const goToNext = () => {
    if (selectedIndex < prototypes.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setNomenclature(null);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/home/designer/prototype')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Studio de Prototypage</h1>
          <p className="text-muted-foreground">
            Générez des visuels 2D de vos concepts produits
          </p>
        </div>
      </div>

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
                <CardDescription>Générez plusieurs variantes (1-5)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={numPrototypes}
                    onChange={(e) =>
                      setNumPrototypes(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))
                    }
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
            <Button onClick={handleGenerate} size="lg" className="w-full" disabled={!prompt.trim()}>
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
                  Création de {numPrototypes} prototype{numPrototypes > 1 ? 's' : ''}{' '}
                  {renderStyle === 'realistic' ? 'réaliste' : 'technique'}
                  {numPrototypes > 1 ? 's' : ''}
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-muted-foreground">
              {prototypes.length} prototype{prototypes.length > 1 ? 's' : ''} généré
              {prototypes.length > 1 ? 's' : ''}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Nouvelle Génération
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Image Display */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardContent className="p-4">
                  {selected && (
                    <div className="space-y-4">
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={selected.imageUrl}
                          alt={`Prototype ${selected.index}`}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>

                      {/* Navigation */}
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={goToPrevious}
                          disabled={selectedIndex === 0}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {selectedIndex + 1} / {prototypes.length}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={goToNext}
                          disabled={selectedIndex === prototypes.length - 1}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Prompt */}
                      <div className="rounded-lg bg-muted p-3">
                        <p className="text-sm font-medium">Prompt:</p>
                        <p className="text-sm text-muted-foreground">{selected.prompt}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Éditer
                        </Button>
                        <Button variant="outline" onClick={handleGenerateBOM} disabled={bomLoading}>
                          {bomLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <FileText className="mr-2 h-4 w-4" />
                          )}
                          Générer BOM
                        </Button>
                        <Button variant="outline" onClick={() => handleDownload(selected)}>
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* BOM Table */}
              {nomenclature && nomenclature.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Nomenclature (BOM)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Réf.</th>
                            <th className="text-left p-2">Désignation</th>
                            <th className="text-center p-2">Qté</th>
                            <th className="text-left p-2">Matériau</th>
                            <th className="text-left p-2">Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {nomenclature.map((item, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="p-2 font-mono">{item.reference}</td>
                              <td className="p-2">{item.designation}</td>
                              <td className="p-2 text-center">{item.quantity}</td>
                              <td className="p-2">{item.material}</td>
                              <td className="p-2">
                                <span className="rounded bg-muted px-2 py-1 text-xs">
                                  {item.type}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Thumbnail Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tous les prototypes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {prototypes.map((proto, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedIndex(idx);
                          setNomenclature(null);
                        }}
                        className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                          idx === selectedIndex
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-transparent hover:border-muted-foreground/30'
                        }`}
                      >
                        <Image
                          src={proto.imageUrl}
                          alt={`Prototype ${proto.index}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
                          {idx + 1}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Éditer le prototype</DialogTitle>
            <DialogDescription>
              Décrivez les modifications à apporter à l'image. Une nouvelle version sera générée.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Ex: Changer la couleur en bleu, ajouter des roues..."
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              disabled={editLoading}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={editLoading}>
              Annuler
            </Button>
            <Button onClick={handleEdit} disabled={!editPrompt.trim() || editLoading}>
              {editLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Édition en cours...
                </>
              ) : (
                <>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Éditer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
