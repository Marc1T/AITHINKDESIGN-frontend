/**
 * Workshop List Page
 * Main entry point for the workshop system
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, Sparkles } from 'lucide-react';

import { PageBody, PageHeader } from '@kit/ui/page';
import { Button } from '@kit/ui/button';

import { WorkshopListContent } from './_components/workshop-list-content';
import { WorkshopListSkeleton } from './_components/workshop-list-skeleton';

export const metadata = {
  title: 'Workshops | Générateur de Design',
  description: 'Gérez vos workshops de Design Thinking avec IA',
};

export default function WorkshopPage() {
  return (
    <>
      <PageHeader
        title="Workshops IA"
        description="Créez et gérez vos workshops de Design Thinking assistés par intelligence artificielle"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/home/workshop/templates">
              <Sparkles className="mr-2 h-4 w-4" />
              Templates
            </Link>
          </Button>

          <Button asChild>
            <Link href="/home/workshop/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Workshop
            </Link>
          </Button>
        </div>
      </PageHeader>

      <PageBody>
        <Suspense fallback={<WorkshopListSkeleton />}>
          <WorkshopListContent />
        </Suspense>
      </PageBody>
    </>
  );
}