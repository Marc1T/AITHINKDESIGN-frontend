/**
 * Page: Workshops List
 * Affiche tous les workshops de l'utilisateur avec options CRUD
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Badge } from '@kit/ui/badge';
import { Input } from '@kit/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@kit/ui/dialog';
import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';
import { 
  useWorkshops, 
  useCreateWorkshop, 
  useDeleteWorkshop 
} from '@kit/generative-designer/hooks';

export default function WorkshopsListPage() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWorkshop, setNewWorkshop] = useState({
    title: '',
    initial_problem: '',
    agent_personalities: ['creative', 'pragmatic', 'technical'] as const,
    target_ideas_count: 20,
  });

  // Use React Query hooks
  const { data: workshops = [], isLoading } = useWorkshops();
  const { mutate: createWorkshop, isPending: isCreating } = useCreateWorkshop();
  const { mutate: deleteWorkshop } = useDeleteWorkshop();

  const handleCreateWorkshop = () => {
    if (!newWorkshop.title.trim() || !newWorkshop.initial_problem.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    createWorkshop(
      {
        title: newWorkshop.title,
        initial_problem: newWorkshop.initial_problem,
        agent_personalities: newWorkshop.agent_personalities,
        target_ideas_count: newWorkshop.target_ideas_count,
      },
      {
        onSuccess: (data) => {
          const workshopId = (data as any)?.workshop_id || (data as any)?.id;
          setIsDialogOpen(false);
          setNewWorkshop({ 
            title: '', 
            initial_problem: '',
            agent_personalities: ['creative', 'pragmatic', 'technical'],
            target_ideas_count: 20,
          });
          if (workshopId) router.push(`/home/designer/workshops/${workshopId}`);
        },
        onError: (error) => {
          alert(`Erreur: ${error.message}`);
        },
      }
    );
  };

  const handleDeleteWorkshop = (id: string, title: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${title}" ?`)) return;

    deleteWorkshop(id, {
      onError: (error) => {
        alert(`Erreur: ${error.message}`);
      },
    });
  };

  const getPhaseInfo = (phase: number) => {
    const phases = [
      { name: 'Configuration', icon: '⚙️' },
      { name: 'Empathie', icon: '❤️' },
      { name: 'Idéation', icon: '💡' },
      { name: 'Convergence', icon: '🎯' },
      { name: 'TRIZ', icon: '⚙️' },
      { name: 'Sélection', icon: '✨' },
    ];
    return phases[phase] || phases[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'archived':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      active: 'En cours',
      completed: 'Terminé',
      archived: 'Archivé',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">
            🎨 Mes Workshops de Design Thinking
          </h1>
          <p className="text-muted-foreground">
            Créez et gérez vos sessions collaboratives avec des agents IA
          </p>
        </div>

        {/* Create Workshop Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" size="lg">
              ✨ Nouveau Workshop
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un nouveau workshop</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du workshop</Label>
                <Input
                  id="title"
                  placeholder="Ex: Redesign d'une application mobile"
                  value={newWorkshop.title}
                  onChange={(e) =>
                    setNewWorkshop((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="problem">Problème initial</Label>
                <Textarea
                  id="problem"
                  placeholder="Décrivez le problème à résoudre..."
                  value={newWorkshop.initial_problem}
                  onChange={(e) =>
                    setNewWorkshop((p) => ({ ...p, initial_problem: e.target.value }))
                  }
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ideas">Nombre d'idées à générer</Label>
                <Input
                  id="ideas"
                  type="number"
                  min="10"
                  max="100"
                  value={newWorkshop.target_ideas_count}
                  onChange={(e) =>
                    setNewWorkshop((p) => ({ ...p, target_ideas_count: parseInt(e.target.value) || 20 }))
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button
                  onClick={handleCreateWorkshop}
                  disabled={isCreating || !newWorkshop.title}
                  className="gap-2"
                >
                  {isCreating ? '⏳ Création...' : '✨ Créer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error State */}
      {isLoading === false && workshops.length === 0 && (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-2xl mb-2">🎯</p>
            <p className="text-lg font-semibold text-foreground">
              Aucun workshop pour le moment
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Créez votre premier workshop de Design Thinking collaboratif
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 gap-2">✨ Créer le premier</Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Workshops Grid */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {workshops.map((workshop, index) => {
            const phaseInfo = getPhaseInfo((workshop as any).current_phase || 0);
            const id = (workshop as any).workshop_id || (workshop as any).id || index;
            return (
              <Card
                key={id}
                className="hover:shadow-lg transition-shadow cursor-pointer hover:border-blue-500 overflow-hidden group"
              >
                <CardHeader 
                  className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950"
                  onClick={() => router.push(`/home/designer/workshops/${id}`)}
                >
                  <div className="space-y-2">
                    <CardTitle className="line-clamp-2 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {workshop.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {workshop.initial_problem}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  {/* Phase Info */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-2xl">{phaseInfo.icon}</span>
                      <p className="text-xs text-muted-foreground mt-1">Phase {(workshop as any).current_phase || 0}</p>
                      <p className="text-sm font-semibold">{phaseInfo.name}</p>
                    </div>
                    <Badge className={getStatusColor((workshop as any).status || 'draft')}>
                      {getStatusLabel((workshop as any).status || 'draft')}
                    </Badge>
                  </div>

                  {/* Date */}
                  <div className="text-xs text-muted-foreground">
                    <p>Créé: {new Date((workshop as any).created_at).toLocaleDateString('fr-FR')}</p>
                    {(workshop as any).completed_at && (
                      <p>Complété: {new Date((workshop as any).completed_at).toLocaleDateString('fr-FR')}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/home/designer/workshops/${id}`);
                      }}
                    >
                      Continuer →
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWorkshop(id as string, workshop.title);
                      }}
                    >
                      🗑️
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
    </div>
  );
}