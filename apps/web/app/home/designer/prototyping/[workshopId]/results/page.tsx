"use client";

// =============================================================================
// Page de résultats du prototypage
// Affichage, édition, BOM et téléchargement des prototypes générés
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Download,
  Edit3,
  FileText,
  MessageSquare,
  Loader2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@kit/ui/button";
import { Input } from "@kit/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@kit/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kit/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@kit/ui/dialog";
import type { PrototypeData, NomenclatureItem, PrototypingSession } from "../../types";

const STORAGE_KEY_PREFIX = "prototyping_session_";

export default function PrototypingResultsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const workshopId = params.workshopId as string;

  // State
  const [session, setSession] = useState<PrototypingSession | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // BOM state
  const [bomLoading, setBomLoading] = useState(false);
  const [bomError, setBomError] = useState<string | null>(null);

  const selected = session?.prototypes[selectedIndex] || null;

  // Load session from storage
  useEffect(() => {
    const storageKey = STORAGE_KEY_PREFIX + workshopId;
    const stored = sessionStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as PrototypingSession;
        setSession(parsed);
      } catch (e) {
        console.error("Failed to parse session:", e);
        setError("Session invalide");
      }
    } else {
      setError("Aucune session trouvée. Générez d'abord des prototypes.");
    }
    setLoading(false);
  }, [workshopId]);

  // Save session to storage
  const saveSession = useCallback((updatedSession: PrototypingSession) => {
    const storageKey = STORAGE_KEY_PREFIX + workshopId;
    sessionStorage.setItem(storageKey, JSON.stringify(updatedSession));
    setSession(updatedSession);
  }, [workshopId]);

  // Navigate between prototypes
  const goToPrevious = () => {
    if (session && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (session && selectedIndex < session.prototypes.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  // Download image
  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Échec du téléchargement");
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `prototype-${workshopId}-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      setError("Impossible de télécharger l'image.");
    }
  };

  // Edit image with Qwen
  const handleEdit = async () => {
    if (!selected || !editPrompt.trim()) return;

    setEditLoading(true);
    setEditError(null);

    try {
      const res = await fetch("/api/prototyping/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      
      if (json.status !== "succeeded" || !json.exports?.images?.[0]?.url) {
        throw new Error("L'édition n'a pas produit d'image");
      }

      const newImageUrl = json.exports.images[0].url;

      // Add edited prototype
      const newPrototype: PrototypeData = {
        index: session!.prototypes.length + 1,
        imageUrl: newImageUrl,
        finalPrompt: editPrompt.trim(),
        branch: "edit",
        referenceType: "edit",
      };

      const updatedSession: PrototypingSession = {
        ...session!,
        prototypes: [...session!.prototypes, newPrototype],
      };

      saveSession(updatedSession);
      setSelectedIndex(updatedSession.prototypes.length - 1);
      setEditPrompt("");
      setEditDialogOpen(false);
    } catch (err) {
      console.error("Edit error:", err);
      setEditError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setEditLoading(false);
    }
  };

  // Generate BOM
  const handleGenerateBOM = async () => {
    if (!selected) return;

    setBomLoading(true);
    setBomError(null);

    try {
      const res = await fetch("/api/prototyping/bom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: selected.imageUrl,
          prompt: selected.finalPrompt,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error?.message || "Échec de la génération BOM");
      }

      const json = await res.json();
      
      if (json.status !== "succeeded" || !json.outputs?.nomenclature) {
        throw new Error("Nomenclature invalide");
      }

      // Update prototype with BOM
      const updatedPrototypes = session!.prototypes.map((p: PrototypeData, idx: number) =>
        idx === selectedIndex
          ? { ...p, nomenclature: json.outputs.nomenclature }
          : p
      );

      saveSession({
        ...session!,
        prototypes: updatedPrototypes,
      });
    } catch (err) {
      console.error("BOM error:", err);
      setBomError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setBomLoading(false);
    }
  };

  // Navigate to assistant
  const goToAssistant = () => {
    router.push(`/home/designer/prototyping/${workshopId}/assistant`);
  };

  // Go back to generation
  const goBack = () => {
    router.push(`/home/designer/prototyping/${workshopId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">{error || "Session non trouvée"}</p>
            <Button onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la génération
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Résultats du Prototypage</h1>
            <p className="text-muted-foreground">
              {session.prototypes.length} prototype{session.prototypes.length > 1 ? "s" : ""} • 
              Style {session.style === "realistic" ? "réaliste" : "sketch"}
            </p>
          </div>
        </div>
        <Button onClick={goToAssistant} variant="outline">
          <MessageSquare className="mr-2 h-4 w-4" />
          Assistant IA
        </Button>
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
                    {selected.branch === "edit" && (
                      <div className="absolute top-2 left-2 rounded bg-blue-500 px-2 py-1 text-xs text-white">
                        Édité
                      </div>
                    )}
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
                      {selectedIndex + 1} / {session.prototypes.length}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={goToNext}
                      disabled={selectedIndex === session.prototypes.length - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Prompt */}
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm font-medium">Prompt:</p>
                    <p className="text-sm text-muted-foreground">{selected.finalPrompt}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditDialogOpen(true)}
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      Éditer
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleGenerateBOM}
                      disabled={bomLoading}
                    >
                      {bomLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <FileText className="mr-2 h-4 w-4" />
                      )}
                      Générer BOM
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDownload(selected.imageUrl, selected.index)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </Button>
                  </div>

                  {bomError && (
                    <p className="text-sm text-red-500">{bomError}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* BOM Table */}
          {selected?.nomenclature && selected.nomenclature.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Nomenclature (BOM)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Réf.</TableHead>
                        <TableHead>Désignation</TableHead>
                        <TableHead className="text-center">Qté</TableHead>
                        <TableHead>Matériau</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Remarques</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selected.nomenclature.map((item: NomenclatureItem, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-sm">
                            {item.reference}
                          </TableCell>
                          <TableCell>{item.designation}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell>{item.material}</TableCell>
                          <TableCell>
                            <span className="rounded bg-muted px-2 py-1 text-xs">
                              {item.type}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {item.comment}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                {session.prototypes.map((proto: PrototypeData, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      idx === selectedIndex
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-muted-foreground/30"
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
                    {proto.branch === "edit" && (
                      <div className="absolute top-1 left-1 rounded bg-blue-500 p-0.5">
                        <Edit3 className="h-3 w-3 text-white" />
                      </div>
                    )}
                    {proto.nomenclature && proto.nomenclature.length > 0 && (
                      <div className="absolute top-1 right-1 rounded bg-green-500 p-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" onClick={goBack}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Nouvelle génération
              </Button>
              <Button className="w-full" onClick={goToAssistant}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Discuter avec l'IA
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

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
            {editError && (
              <p className="text-sm text-red-500">{editError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={editLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleEdit}
              disabled={!editPrompt.trim() || editLoading}
            >
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
