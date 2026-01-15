// =============================================================================
// apps/web/app/home/designer/prototype/page.tsx
// Page Prototypage - Hub de prototypage IA
// =============================================================================

'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Cpu, ArrowLeft, Wand2, Edit3, FileText, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@kit/ui/card';

export default function PrototypePage() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8 max-w-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <Wand2 className="w-12 h-12" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Prototypage IA
        </h1>
        <p className="text-muted-foreground">
          Générez des visuels 2D de vos concepts produits avec l'intelligence artificielle
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-4 max-w-4xl w-full mb-8">
        <Card className="group hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">Génération 2D</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Créez des images réalistes ou techniques de vos produits avec jusqu'à 5 variantes.
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950 text-green-600">
                <Edit3 className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">Édition IA</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Modifiez vos prototypes avec des instructions en langage naturel grâce à Qwen.
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600">
                <FileText className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">Nomenclature BOM</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Générez automatiquement la liste des composants et matériaux de votre prototype.
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">Assistant IA</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Discutez de vos prototypes avec un assistant IA expert en conception produit.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <div className="grid md:grid-cols-2 gap-4 max-w-4xl w-full">
        {/* Studio Direct */}
        <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
                <Wand2 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Démarrer Maintenant</h3>
              <p className="text-sm text-muted-foreground">
                Créez des prototypes directement sans passer par un workshop.
              </p>
            </div>
            
            <Button 
              onClick={() => router.push('/home/designer/prototype/studio')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Ouvrir le Studio
            </Button>
          </CardContent>
        </Card>

        {/* Workshop */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                <Cpu className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Depuis un Workshop</h3>
              <p className="text-sm text-muted-foreground">
                Prototypez une idée issue d'un workshop de Design Thinking.
              </p>
            </div>
            
            <Button 
              onClick={() => router.push('/home/designer/workshops')}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Voir mes Workshops
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/home/designer')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour à l'accueil
        </Button>
      </div>
    </div>
  );
}
