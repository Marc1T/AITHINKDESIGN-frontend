// =============================================================================
// apps/web/app/home/designer/prototype/page.tsx
// Page Prototypage (Coming Soon)
// =============================================================================

'use client';

import { useRouter } from 'next/navigation';
import { Cpu, ArrowLeft, Construction } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

export default function PrototypePage() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600">
              <Construction className="w-12 h-12" />
            </div>
          </div>
          <CardTitle className="text-2xl">Prototypage IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Cette fonctionnalité est en cours de développement. Bientôt, vous pourrez 
            générer des visuels 2D et des modèles 3D de vos concepts produits directement 
            depuis vos cahiers des charges.
          </p>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Fonctionnalités à venir
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li>• Génération d'images 2D avec Stable Diffusion / DALL-E</li>
              <li>• Modélisation 3D automatique</li>
              <li>• Variations et affinement itératif</li>
              <li>• Export PNG, SVG, OBJ, GLTF</li>
              <li>• Historique des générations</li>
            </ul>
          </div>

          <Button 
            variant="outline" 
            onClick={() => router.push('/home/designer')}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour à l'accueil
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
