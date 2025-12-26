// =============================================================================
// packages/features/generative-designer/src/components/review/parameters-editor.tsx
// Éditeur de paramètres (optionnel - pour ajustements manuels)
// =============================================================================

'use client';

import { useState } from 'react';
import { Button } from '@kit/ui/button';
import { Label } from '@kit/ui/label';
import { Select } from '@kit/ui/select';
import { Input } from '@kit/ui/input';
import { Card } from '@kit/ui/card';
import { Save, X } from 'lucide-react';
import type { IdeationParameters } from '../../types';

interface ParametersEditorProps {
  parameters: IdeationParameters;
  onSave: (parameters: IdeationParameters) => void;
  onCancel: () => void;
}

export function ParametersEditor({ parameters, onSave, onCancel }: ParametersEditorProps) {
  const [edited, setEdited] = useState<IdeationParameters>(parameters);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(edited);
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Ajuster les paramètres</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Material */}
        <div className="space-y-2">
          <Label>Matériau</Label>
          <Select
            value={edited.material}
            onValueChange={(value) => setEdited({ ...edited, material: value as any })}
          >
            <option value="aluminum_6061">Aluminium 6061</option>
            <option value="abs">ABS</option>
            <option value="pla">PLA</option>
            <option value="steel_316l">Acier Inox 316L</option>
            <option value="wood">Bois</option>
            <option value="ceramic">Céramique</option>
          </Select>
        </div>

        {/* Process */}
        <div className="space-y-2">
          <Label>Procédé de fabrication</Label>
          <Select
            value={edited.process}
            onValueChange={(value) => setEdited({ ...edited, process: value as any })}
          >
            <option value="cnc_3axis">Usinage CNC 3 axes</option>
            <option value="fdm_3d">Impression 3D FDM</option>
            <option value="injection_molding">Moulage par injection</option>
            <option value="traditional_machining">Usinage traditionnel</option>
          </Select>
        </div>

        {/* Objective */}
        <div className="space-y-2">
          <Label>Objectif prioritaire</Label>
          <Select
            value={edited.objective}
            onValueChange={(value) => setEdited({ ...edited, objective: value as any })}
          >
            <option value="minimize_cost">Minimiser le coût</option>
            <option value="maximize_strength">Maximiser la résistance</option>
            <option value="optimize_aesthetic">Optimiser l'esthétique</option>
            <option value="balance_all">Équilibrer tout</option>
          </Select>
        </div>

        {/* Max Load */}
        <div className="space-y-2">
          <Label>Charge maximale (N)</Label>
          <Input
            type="number"
            value={edited.max_load_n}
            onChange={(e) => setEdited({ ...edited, max_load_n: parseFloat(e.target.value) })}
            min={0}
            max={10000}
          />
        </div>

        {/* Dimensions */}
        <div className="space-y-2">
          <Label>Dimensions maximales (mm)</Label>
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              placeholder="Longueur"
              value={edited.max_dimensions_mm[0]}
              onChange={(e) => setEdited({
                ...edited,
                max_dimensions_mm: [parseFloat(e.target.value), edited.max_dimensions_mm[1], edited.max_dimensions_mm[2]]
              })}
            />
            <Input
              type="number"
              placeholder="Largeur"
              value={edited.max_dimensions_mm[1]}
              onChange={(e) => setEdited({
                ...edited,
                max_dimensions_mm: [edited.max_dimensions_mm[0], parseFloat(e.target.value), edited.max_dimensions_mm[2]]
              })}
            />
            <Input
              type="number"
              placeholder="Hauteur"
              value={edited.max_dimensions_mm[2]}
              onChange={(e) => setEdited({
                ...edited,
                max_dimensions_mm: [edited.max_dimensions_mm[0], edited.max_dimensions_mm[1], parseFloat(e.target.value)]
              })}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </form>
    </Card>
  );
}