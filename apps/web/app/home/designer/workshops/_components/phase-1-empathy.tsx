'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';

export interface Phase1EmpathyProps {
  workshopId: string;
  data?: Record<string, any>;
  onComplete?: () => void;
}

export function Phase1Empathy({ workshopId, data, onComplete }: Phase1EmpathyProps) {
  const [activeStep, setActiveStep] = React.useState<'empathy' | 'journey' | 'hmw'>('empathy');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">❤️</span>
            Phase 1: Empathie & Framing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Steps Navigation */}
          <div className="flex gap-2 border-b">
            {(['empathy', 'journey', 'hmw'] as const).map((step) => (
              <button
                key={step}
                onClick={() => setActiveStep(step)}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeStep === step
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {step === 'empathy' && '📊 Empathy Map'}
                {step === 'journey' && '🗺️ Customer Journey'}
                {step === 'hmw' && '💭 HMW Questions'}
              </button>
            ))}
          </div>

          {/* Empathy Map Step */}
          {activeStep === 'empathy' && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Empathy Map</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Analyze what the user says, thinks, does, and feels
                </p>
                <Button className="w-full gap-2">
                  ▶️ Run Empathy Mapping Session
                </Button>
              </div>
              {data?.empathy_map && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded">
                    <p className="font-semibold text-sm">Says</p>
                    <ul className="text-xs mt-2 space-y-1">
                      {data.empathy_map.says?.slice(0, 3).map((item: string, i: number) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded">
                    <p className="font-semibold text-sm">Thinks</p>
                    <ul className="text-xs mt-2 space-y-1">
                      {data.empathy_map.thinks?.slice(0, 3).map((item: string, i: number) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded">
                    <p className="font-semibold text-sm">Does</p>
                    <ul className="text-xs mt-2 space-y-1">
                      {data.empathy_map.does?.slice(0, 3).map((item: string, i: number) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-950 rounded">
                    <p className="font-semibold text-sm">Feels</p>
                    <ul className="text-xs mt-2 space-y-1">
                      {data.empathy_map.feels?.slice(0, 3).map((item: string, i: number) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customer Journey Step */}
          {activeStep === 'journey' && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Customer Journey Map</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Map the customer's experience across all touchpoints
                </p>
                <Button className="w-full gap-2">
                  ▶️ Generate Customer Journey
                </Button>
              </div>
              {data?.customer_journey?.stages && (
                <div className="space-y-2">
                  {data.customer_journey.stages.map((stage: any, i: number) => (
                    <div key={i} className="p-3 border rounded">
                      <p className="font-semibold">{stage.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stage.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* HMW Questions Step */}
          {activeStep === 'hmw' && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">How Might We Questions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Reframe insights into actionable questions for ideation
                </p>
                <Button className="w-full gap-2">
                  ▶️ Generate HMW Questions
                </Button>
              </div>
              {data?.hmw_questions && (
                <div className="space-y-2">
                  {data.hmw_questions.map((question: string, i: number) => (
                    <div key={i} className="p-3 bg-amber-50 dark:bg-amber-950 rounded text-sm">
                      💭 {question}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Complete Phase */}
          <Button variant="outline" className="w-full mt-4" onClick={onComplete}>
            ✓ Marquer Phase 1 comme complète
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
