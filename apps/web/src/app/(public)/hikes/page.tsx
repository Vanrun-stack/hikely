import type { Metadata } from 'next';
import { HikeGrid } from '@/components/hike/HikeGrid';
import { HikeFiltersPanel } from '@/components/hike/HikeFiltersPanel';
import { HikeMapSidebar } from '@/components/map/HikeMapSidebar';

export const metadata: Metadata = {
  title: 'Toutes les randonnées',
  description:
    'Explorez des milliers de randonnées filtrées par région, difficulté, distance et dénivelé. Téléchargez les tracés GPX et consultez les avis.',
};

interface Props {
  searchParams: Promise<{
    search?: string;
    region?: string;
    difficulty?: string;
    practice?: string;
    minDist?: string;
    maxDist?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export default async function HikesPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="container-wide py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-50">
          Découvrez nos randonnées
        </h1>
        <p className="text-surface-500 mt-2">
          {params.search
            ? `Résultats pour "${params.search}"`
            : 'Des milliers de sentiers vous attendent'}
        </p>
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <HikeFiltersPanel initialFilters={params} />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            {/* Mobile filter button + sort */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-surface-500">
                {/* Count shown by client */}
              </span>
            </div>
          </div>

          <HikeGrid searchParams={params} />
        </div>

        {/* Map sidebar (desktop only) */}
        <aside className="hidden xl:block w-80 flex-shrink-0">
          <div className="sticky top-24">
            <HikeMapSidebar />
          </div>
        </aside>
      </div>
    </div>
  );
}
