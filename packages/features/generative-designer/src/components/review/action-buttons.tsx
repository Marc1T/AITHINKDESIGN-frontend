// =============================================================================
// packages/features/generative-designer/src/components/review/action-buttons.tsx
// Boutons d'action : Continue, Generate Cahier, Apply TRIZ
// =============================================================================

'use client';

import { Button } from '@kit/ui/button';
import { FileText, Lightbulb, ChevronRight } from 'lucide-react';

interface ActionButtonsProps {
  ideationId: string;
  onContinue: () => void;
  onGenerateCahier: () => void;
  onApplyTriz: () => void;
}

export function ActionButtons({
  ideationId,
  onContinue,
  onGenerateCahier,
  onApplyTriz,
}: ActionButtonsProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Continue Button */}
        <Button
          onClick={onContinue}
          size="lg"
          className="flex items-center justify-center gap-2 h-auto py-6"
        >
          <ChevronRight className="h-5 w-5" />
          <div className="text-left">
            <div className="font-semibold">Continuer</div>
            <div className="text-xs opacity-90">Passer à l'étape suivante</div>
          </div>
        </Button>

        {/* Generate Cahier de Charge */}
        <Button
          onClick={onGenerateCahier}
          variant="outline"
          size="lg"
          className="flex items-center justify-center gap-2 h-auto py-6"
        >
          <FileText className="h-5 w-5" />
          <div className="text-left">
            <div className="font-semibold">Cahier de Charge</div>
            <div className="text-xs opacity-70">Générer le PDF (NF EN 16271)</div>
          </div>
        </Button>

        {/* Apply TRIZ */}
        <Button
          onClick={onApplyTriz}
          variant="outline"
          size="lg"
          className="flex items-center justify-center gap-2 h-auto py-6"
        >
          <Lightbulb className="h-5 w-5" />
          <div className="text-left">
            <div className="font-semibold">Analyse TRIZ</div>
            <div className="text-xs opacity-70">Résoudre les contradictions</div>
          </div>
        </Button>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>💡 Conseil :</strong> L'analyse TRIZ peut améliorer significativement votre design en résolvant les contradictions techniques. 
          Le Cahier de Charge peut être généré à tout moment.
        </p>
      </div>
    </div>
  );
}
