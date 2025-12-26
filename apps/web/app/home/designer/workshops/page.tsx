/**
 * Page: Workshops List
 * Affiche tous les workshops de l'utilisateur avec options CRUD
 */

'use client';

import React, { useState, useEffect } from 'react';
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

interface Workshop {
  id: string;
  title: string;
  initial_problem: string;
  current_phase: number;
  status: string;
  created_at: string;
  completed_at?: string;
}

export const WorkshopsListPage = () => {
  const router = useRouter();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkshop, setNewWorkshop] = useState({
    title: '',
    initial_problem: '',
  });

  useEffect(() => {
    // TODO: Fetch workshops from API
    setIsLoading(false);
  }, []);

  const handleCreateWorkshop = async () => {
    setIsCreating(true);
    try {
      // TODO: API call to create workshop
      // const response = await fetch('/api/generative-designer/workshops', {
      //   method: 'POST',
      //   body: JSON.stringify(newWorkshop),
      // });
      // const workshop = await response.json();
      // router.push(`/home/designer/workshops/${workshop.id}/config`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteWorkshop = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce workshop ?')) return;
    // TODO: API call to delete
  };

  const getPhaseInfo = (phase: number) => {
    const phases = ['Configuration', 'Empathie', 'Idéation', 'Convergence', 'TRIZ', 'Sélection', 'Prototype'];
    return phases[phase] || 'Inconnu';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <Dialog>
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

              <div className="flex justify-end gap-3 pt-4 border-t">
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button
                  onClick={handleCreateWorkshop}
                  disabled={isCreating || !newWorkshop.title}
                >
                  {isCreating ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workshops Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Chargement des workshops...</p>
        </div>
      ) : workshops.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-2xl mb-2">🎯</p>
            <p className="text-lg font-semibold text-foreground">
              Aucun workshop pour le moment
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Créez votre premier workshop de Design Thinking collaboratif
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-4 gap-2">✨ Créer le premier</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                {/* Same dialog content */}
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {workshops.map((workshop) => (
            <Card
              key={workshop.id}
              className="hover:shadow-lg transition-shadow cursor-pointer hover:border-blue-500"
              onClick={() => router.push(`/home/designer/workshops/${workshop.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg leading-tight">
                      {workshop.title}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={`mt-2 ${getStatusColor(workshop.status)}`}
                    >
                      {workshop.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-2xl">{workshop.current_phase >= 6 ? '✅' : '⏳'}</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Phase actuelle</p>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-foreground">
                      {getPhaseInfo(workshop.current_phase)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ({workshop.current_phase}/6)
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Problème</p>
                  <p className="text-sm text-foreground line-clamp-2">
                    {workshop.initial_problem}
                  </p>
                </div>

                <div className="pt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/home/designer/workshops/${workshop.id}`);
                    }}
                    className="flex-1"
                  >
                    Continuer →
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWorkshop(workshop.id);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    🗑️
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
