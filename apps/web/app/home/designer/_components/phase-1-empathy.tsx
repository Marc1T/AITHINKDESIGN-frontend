/**
 * Composant Phase 1 - Empathie & Cadrage
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Textarea } from '@kit/ui/textarea';
import { Input } from '@kit/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@kit/ui/tabs';

interface Phase1Props {
  problemStatement: string;
  onNext: (data: Phase1Data) => void;
}

export interface Phase1Data {
  problemStatement: string;
  empathyMap: {
    says: string[];
    thinks: string[];
    does: string[];
    feels: string[];
  };
  hmwQuestions: string[];
  customerSegment: string;
}

export const Phase1Empathy: React.FC<Phase1Props> = ({
  problemStatement,
  onNext,
}) => {
  const [activeTab, setActiveTab] = useState<string>('empathy-map');
  const [formData, setFormData] = useState<Phase1Data>({
    problemStatement,
    empathyMap: {
      says: [],
      thinks: [],
      does: [],
      feels: [],
    },
    hmwQuestions: [],
    customerSegment: '',
  });

  const handleEmpathyMapChange = (
    category: keyof typeof formData.empathyMap,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      empathyMap: {
        ...prev.empathyMap,
        [category]: value.split('\n').filter((item) => item.trim()),
      },
    }));
  };

  const handleHmwChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      hmwQuestions: value.split('\n').filter((item) => item.trim()),
    }));
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          👥 Phase 1 - Empathie & Cadrage
        </h2>
        <p className="text-muted-foreground">
          Comprendre le problème et l'utilisateur avant de proposer des solutions
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="empathy-map">Empathy Map</TabsTrigger>
          <TabsTrigger value="hmw">How Might We</TabsTrigger>
          <TabsTrigger value="customer-segment">Segment Client</TabsTrigger>
        </TabsList>

        {/* Empathy Map */}
        <TabsContent value="empathy-map" className="space-y-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-lg">Empathy Map Canvas</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Remplissez chaque quadrant pour mieux comprendre l'utilisateur
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {/* SAYS */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  💬 Que dit-il/elle ?
                </label>
                <Textarea
                  placeholder="Entrez les affirmations, commentaires (une par ligne)..."
                  value={formData.empathyMap.says.join('\n')}
                  onChange={(e) => handleEmpathyMapChange('says', e.target.value)}
                  className="h-24 resize-none"
                />
              </div>

              {/* THINKS */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  🧠 Que pense-t-il/elle ?
                </label>
                <Textarea
                  placeholder="Pensées internes, préoccupations (une par ligne)..."
                  value={formData.empathyMap.thinks.join('\n')}
                  onChange={(e) => handleEmpathyMapChange('thinks', e.target.value)}
                  className="h-24 resize-none"
                />
              </div>

              {/* DOES */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  🎯 Qu'est-ce qu'il/elle fait ?
                </label>
                <Textarea
                  placeholder="Actions, comportements (une par ligne)..."
                  value={formData.empathyMap.does.join('\n')}
                  onChange={(e) => handleEmpathyMapChange('does', e.target.value)}
                  className="h-24 resize-none"
                />
              </div>

              {/* FEELS */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  ❤️ Qu'est-ce qu'il/elle ressent ?
                </label>
                <Textarea
                  placeholder="Émotions, sentiments, frustrations (une par ligne)..."
                  value={formData.empathyMap.feels.join('\n')}
                  onChange={(e) => handleEmpathyMapChange('feels', e.target.value)}
                  className="h-24 resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* How Might We Questions */}
        <TabsContent value="hmw" className="space-y-4">
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950 dark:to-amber-900/50 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-lg">Comment pourrait-on... (HMW)</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Posez des questions de reencadrage pour explorer les solutions
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Exemple: Comment pourrait-on réduire le temps de setup ?
Comment pourrait-on augmenter l'engagement utilisateur ?
(Une question par ligne)"
                value={formData.hmwQuestions.join('\n')}
                onChange={(e) => handleHmwChange(e.target.value)}
                className="h-40 resize-none"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Segment */}
        <TabsContent value="customer-segment" className="space-y-4">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950 dark:to-emerald-900/50 border-emerald-200 dark:border-emerald-800">
            <CardHeader>
              <CardTitle className="text-lg">Segment Client Cible</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Décrivez précisément qui vous ciblez
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Description du segment: démographie, comportements, motivations, frustrations..."
                value={formData.customerSegment}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customerSegment: e.target.value,
                  }))
                }
                className="h-32 resize-none"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline">← Retour</Button>
        <Button onClick={() => onNext(formData)} className="gap-2">
          Continuer → <span>💡</span>
        </Button>
      </div>
    </div>
  );
};
