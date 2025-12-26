// =============================================================================
// apps/web/app/home/designer/page.tsx
// Page principale du Generative Designer (Étapes 1-5, 6.b, 6.c)
// =============================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ModeToggle,
  FormMode,
  ChatMode,
  BriefDisplay,
  ActionButtons,
  TRIZChat,
  GenerateCahier,
} from '@kit/generative-designer/components';
import type { IdeationResponse } from '@kit/generative-designer/types';

// Flow steps
type FlowStep = 
  | 'mode-selection'    // Étape 1-2: Choose Form or Chat
  | 'ideation'          // Étape 3: Create ideation
  | 'review'            // Étape 5: Review brief + action buttons
  | 'triz'              // Étape 6.c: TRIZ analysis
  | 'cahier';           // Étape 6.b: Generate Cahier de Charge

type IdeationMode = 'form' | 'chat';

export default function DesignerPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FlowStep>('mode-selection');
  const [mode, setMode] = useState<IdeationMode>('form');
  const [ideation, setIdeation] = useState<IdeationResponse | null>(null);

  // ========== Handlers ==========

  const handleModeChange = (newMode: IdeationMode) => {
    setMode(newMode);
    setCurrentStep('ideation');
  };

  const handleIdeationSuccess = (result: IdeationResponse) => {
    setIdeation(result);
    setCurrentStep('review');
  };

  const handleContinue = () => {
    // TODO: Navigate to prototype generation (Étape 6.a - not implemented yet)
    alert('Étape 6.a (Génération Prototype) sera implémentée plus tard');
  };

  const handleGenerateCahier = () => {
    setCurrentStep('cahier');
  };

  const handleApplyTriz = () => {
    setCurrentStep('triz');
  };

  const handleTrizComplete = (enrichedBrief: string) => {
    // Update ideation with enriched brief from TRIZ
    if (ideation) {
      setIdeation({
        ...ideation,
        detailed_brief: enrichedBrief,
      });
    }
    setCurrentStep('review');
  };

  const handleBackToReview = () => {
    setCurrentStep('review');
  };

  const handleReset = () => {
    setCurrentStep('mode-selection');
    setIdeation(null);
  };

  // ========== Render ==========

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">
            Generative Designer
          </h1>
          <p className="text-lg text-gray-600">
            Transformez vos idées en conceptions techniques avec l'IA
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={currentStep} />

        {/* Content based on current step */}
        <div className="mt-8">
          {currentStep === 'mode-selection' && (
            <div>
              <ModeToggle onModeChange={handleModeChange} />
              <div className="text-center mt-6 text-gray-500">
                <p>Choisissez votre mode d'interaction</p>
              </div>
            </div>
          )}

          {currentStep === 'ideation' && mode === 'form' && (
            <FormMode onSuccess={handleIdeationSuccess} />
          )}

          {currentStep === 'ideation' && mode === 'chat' && (
            <ChatMode onSuccess={handleIdeationSuccess} />
          )}

          {currentStep === 'review' && ideation && (
            <div className="space-y-8">
              <BriefDisplay ideation={ideation} />
              <ActionButtons
                ideationId={ideation.ideation_id}
                onContinue={handleContinue}
                onGenerateCahier={handleGenerateCahier}
                onApplyTriz={handleApplyTriz}
              />
            </div>
          )}

          {currentStep === 'triz' && ideation && (
            <TRIZChat
              ideationId={ideation.ideation_id}
              onComplete={handleTrizComplete}
              onBack={handleBackToReview}
            />
          )}

          {currentStep === 'cahier' && ideation && (
            <GenerateCahier
              ideationId={ideation.ideation_id}
              onBack={handleBackToReview}
            />
          )}
        </div>

        {/* Reset Button (always visible) */}
        {currentStep !== 'mode-selection' && (
          <div className="mt-12 text-center">
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Recommencer avec une nouvelle idée
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Progress Indicator Component
// =============================================================================

interface ProgressIndicatorProps {
  currentStep: FlowStep;
}

function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const steps = [
    { id: 'mode-selection', label: 'Mode' },
    { id: 'ideation', label: 'Idéation' },
    { id: 'review', label: 'Révision' },
    { id: 'triz', label: 'TRIZ (opt.)' },
    { id: 'cahier', label: 'Cahier (opt.)' },
  ];

  const stepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => {
        const isActive = index <= stepIndex;
        const isCurrent = step.id === currentStep;

        return (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                isCurrent
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : isActive
                  ? 'bg-blue-100 border-blue-600 text-blue-600'
                  : 'bg-gray-100 border-gray-300 text-gray-400'
              )}
            >
              <span className="text-sm font-semibold">{index + 1}</span>
            </div>
            <span
              className={cn(
                'ml-2 text-sm font-medium',
                isCurrent ? 'text-blue-600' : isActive ? 'text-gray-700' : 'text-gray-400'
              )}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-8 h-0.5 mx-3',
                  index < stepIndex ? 'bg-blue-600' : 'bg-gray-300'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Utility function (should be in @kit/ui/utils)
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
