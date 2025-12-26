// =============================================================================
// packages/features/generative-designer/src/components/ideation/form-mode.tsx
// Formulaire classique avec upload d'image
// =============================================================================

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';
import { Upload, Loader2, Sparkles } from 'lucide-react';
import { useIdeation } from '../../hooks/use-ideation';
import type { IdeationResponse } from '../../types';

const formSchema = z.object({
  prompt: z.string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(1000, 'La description ne peut pas dépasser 1000 caractères'),
  image: z.instanceof(File).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface FormModeProps {
  onSuccess: (ideation: IdeationResponse) => void;
}

export function FormMode({ onSuccess }: FormModeProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { createIdeation, loading, error } = useIdeation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image (PNG ou JPEG)');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image ne doit pas dépasser 5MB');
        return;
      }

      setValue('image', file);
      
      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const result = await createIdeation(data.prompt, data.image);
      onSuccess(result);
    } catch (err) {
      console.error('Error creating ideation:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Prompt Input */}
        <div className="space-y-2">
          <Label htmlFor="prompt">
            Décrivez votre idée de produit
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Textarea
            id="prompt"
            placeholder="Ex: Support mural pour enceinte Bluetooth de 2kg maximum, style minimaliste..."
            rows={6}
            {...register('prompt')}
            disabled={loading}
            className={errors.prompt ? 'border-red-500' : ''}
          />
          {errors.prompt && (
            <p className="text-sm text-red-500">{errors.prompt.message}</p>
          )}
          <p className="text-sm text-gray-500">
            {watch('prompt')?.length || 0} / 1000 caractères
          </p>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <Label htmlFor="image">
            Image de référence (optionnel)
          </Label>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('image-input')?.click()}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Choisir une image
            </Button>
            <input
              id="image-input"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview && (
              <span className="text-sm text-gray-600">
                Image sélectionnée ✓
              </span>
            )}
          </div>
          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-xs rounded-lg border shadow-sm"
              />
            </div>
          )}
          <p className="text-sm text-gray-500">
            PNG ou JPEG, max 5MB
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Enrichissement en cours...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Enrichir mon idée avec l'IA
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
