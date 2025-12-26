// =============================================================================
// packages/features/generative-designer/src/components/ideation/mode-toggle.tsx
// Composant pour choisir entre Form et Chat
// =============================================================================

'use client';

import { useState } from 'react';
import { Button } from '@kit/ui/button';
import { FileText, MessageSquare } from 'lucide-react';

type IdeationMode = 'form' | 'chat';

interface ModeToggleProps {
  onModeChange: (mode: IdeationMode) => void;
}

export function ModeToggle({ onModeChange }: ModeToggleProps) {
  const [activeMode, setActiveMode] = useState<IdeationMode>('form');

  const handleModeChange = (mode: IdeationMode) => {
    setActiveMode(mode);
    onModeChange(mode);
  };

  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <Button
        variant={activeMode === 'form' ? 'default' : 'outline'}
        onClick={() => handleModeChange('form')}
        className="flex items-center gap-2"
      >
        <FileText className="h-5 w-5" />
        Mode Formulaire
      </Button>
      
      <Button
        variant={activeMode === 'chat' ? 'default' : 'outline'}
        onClick={() => handleModeChange('chat')}
        className="flex items-center gap-2"
      >
        <MessageSquare className="h-5 w-5" />
        Mode Conversationnel
      </Button>
    </div>
  );
}