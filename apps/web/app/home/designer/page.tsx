// =============================================================================
// apps/web/app/home/designer/page.tsx
// Page d'accueil AITHINKDESIGN
// =============================================================================

'use client';

import { useRouter } from 'next/navigation';
import { Lightbulb, Cpu, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';

export default function DesignerPage() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      {/* Welcome Header */}
      <div className="text-center mb-12 max-w-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <Sparkles className="w-12 h-12" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Bienvenue sur AITHINKDESIGN
        </h1>
        <p className="text-lg text-muted-foreground">
          Transformez vos idées en conceptions innovantes grâce à l'intelligence artificielle 
          et aux méthodologies de Design Thinking.
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
        {/* Ideation Card */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:border-blue-500 cursor-pointer"
              onClick={() => router.push('/home/designer/workshops')}>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Lightbulb className="w-8 h-8" />
              </div>
              <div>
                <CardTitle className="text-xl">Idéation</CardTitle>
                <CardDescription>Workshops créatifs multi-agents</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Lancez des sessions d'idéation collaboratives avec des agents IA aux personnalités 
              variées. Suivez le processus Design Thinking en 6 phases pour générer et affiner 
              vos concepts produits.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Empathy Mapping & Customer Journey</li>
              <li>✓ Génération d'idées multi-techniques</li>
              <li>✓ Voting & Convergence</li>
              <li>✓ Analyse TRIZ</li>
              <li>✓ Cahier des charges automatique</li>
            </ul>
            <Button className="w-full group-hover:bg-blue-600 transition-colors">
              Commencer l'idéation <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Prototypage Card */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:border-purple-500 cursor-pointer opacity-80"
              onClick={() => router.push('/home/designer/prototype')}>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Cpu className="w-8 h-8" />
              </div>
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  Prototypage
                  <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                    Bientôt
                  </span>
                </CardTitle>
                <CardDescription>Génération visuelle IA</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Transformez vos concepts en visuels concrets. Générez des rendus 2D et 3D 
              de vos produits grâce à des modèles d'IA génératifs avancés.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Génération d'images 2D</li>
              <li>✓ Modélisation 3D automatique</li>
              <li>✓ Variations et itérations</li>
              <li>✓ Export multi-formats</li>
              <li>✓ Intégration cahier des charges</li>
            </ul>
            <Button variant="outline" className="w-full group-hover:border-purple-600 group-hover:text-purple-600 transition-colors">
              Découvrir le prototypage <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer info */}
      <p className="mt-12 text-sm text-muted-foreground text-center max-w-lg">
        AITHINKDESIGN combine les méthodologies de Design Thinking avec l'intelligence 
        artificielle pour accélérer votre processus de conception produit.
      </p>
    </div>
  );
}
