// =============================================================================
// packages/features/generative-designer/src/components/review/brief-display.tsx
// Affichage du brief enrichi avec paramètres
// =============================================================================

'use client';

import { Card } from '@kit/ui/card';
import { Badge } from '@kit/ui/badge';
import { CheckCircle2, Package, Cog, Target, Ruler, Weight } from 'lucide-react';
import type { IdeationResponse } from '../../types';

interface BriefDisplayProps {
  ideation: IdeationResponse;
}

const materialLabels: Record<string, string> = {
  aluminum_6061: 'Aluminium 6061',
  abs: 'ABS',
  pla: 'PLA',
  steel_316l: 'Acier Inox 316L',
  wood: 'Bois',
  ceramic: 'Céramique',
};

const processLabels: Record<string, string> = {
  cnc_3axis: 'Usinage CNC 3 axes',
  fdm_3d: 'Impression 3D FDM',
  injection_molding: 'Moulage par injection',
  traditional_machining: 'Usinage traditionnel',
};

const objectiveLabels: Record<string, string> = {
  minimize_cost: 'Minimiser le coût',
  maximize_strength: 'Maximiser la résistance',
  optimize_aesthetic: 'Optimiser l\'esthétique',
  balance_all: 'Équilibrer tout',
};

export function BriefDisplay({ ideation }: BriefDisplayProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Banner */}
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-green-900">
            Idée enrichie avec succès !
          </h3>
          <p className="text-sm text-green-700">
            Votre brief technique a été généré en {ideation.processing_time_ms}ms
          </p>
        </div>
      </div>

      {/* Detailed Brief */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Brief Technique Détaillé</h2>
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
            {ideation.detailed_brief}
          </pre>
        </div>
      </Card>

      {/* Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Material */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <Package className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Matériau</h3>
          </div>
          <Badge variant="secondary" className="text-base">
            {materialLabels[ideation.parameters.material] || ideation.parameters.material}
          </Badge>
        </Card>

        {/* Process */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <Cog className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold">Procédé</h3>
          </div>
          <Badge variant="secondary" className="text-base">
            {processLabels[ideation.parameters.process] || ideation.parameters.process}
          </Badge>
        </Card>

        {/* Objective */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <Target className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">Objectif</h3>
          </div>
          <Badge variant="secondary" className="text-base">
            {objectiveLabels[ideation.parameters.objective] || ideation.parameters.objective}
          </Badge>
        </Card>

        {/* Constraints */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <Ruler className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold">Contraintes</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-gray-500" />
              <span>Charge max: <strong>{ideation.parameters.max_load_n}N</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-gray-500" />
              <span>
                Dimensions: <strong>
                  {ideation.parameters.max_dimensions_mm[0]} × {ideation.parameters.max_dimensions_mm[1]} × {ideation.parameters.max_dimensions_mm[2]} mm
                </strong>
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Reference Image (if available) */}
      {ideation.input_image_url && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Image de référence</h3>
          <img
            src={ideation.input_image_url}
            alt="Reference"
            className="max-w-md rounded-lg border shadow-sm"
          />
        </Card>
      )}
    </div>
  );
}
