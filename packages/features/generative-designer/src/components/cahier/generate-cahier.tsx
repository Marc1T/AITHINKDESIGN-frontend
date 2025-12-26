// =============================================================================
// packages/features/generative-designer/src/components/cahier/generate-cahier.tsx
// Génération du Cahier de Charge PDF
// =============================================================================

'use client';

import { useState } from 'react';
import { Button } from '@kit/ui/button';
import { Card } from '@kit/ui/card';
import { FileText, Download, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useCahierDeCharge } from '../../hooks/use-cahier-de-charge';

interface GenerateCahierProps {
  ideationId: string;
  onBack: () => void;
}

export function GenerateCahier({ ideationId, onBack }: GenerateCahierProps) {
  const { generateCahier, loading, error, success } = useCahierDeCharge();

  const handleGenerate = async () => {
    try {
      await generateCahier(ideationId);
    } catch (err) {
      console.error('Error generating cahier:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>

      {/* Main Card */}
      <Card className="p-8">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Cahier de Charge Technique
            </h2>
            <p className="text-gray-600">
              Conforme à la norme <strong>NF EN 16271</strong>
            </p>
          </div>

          {/* Description */}
          <div className="text-left bg-gray-50 p-6 rounded-lg space-y-3">
            <h3 className="font-semibold text-lg mb-3">Le document comprend :</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Description générale</strong> du produit et de son usage</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Spécifications techniques</strong> détaillées (matériaux, procédés, dimensions)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Contraintes de fabrication</strong> et tolérances (ISO 2768)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Objectifs de conception</strong> et critères de pondération</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Schéma de référence</strong> (si image fournie)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Analyse TRIZ</strong> (si appliquée)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Notes et recommandations</strong> pour la production</span>
              </li>
            </ul>
          </div>

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">
                ✅ Cahier de Charge téléchargé avec succès !
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading}
            size="lg"
            className="w-full flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Générer le Cahier de Charge (PDF)
              </>
            )}
          </Button>

          {/* Info Note */}
          <p className="text-xs text-gray-500">
            Le PDF sera automatiquement téléchargé. Durée estimée : 5-10 secondes.
          </p>
        </div>
      </Card>
    </div>
  );
}