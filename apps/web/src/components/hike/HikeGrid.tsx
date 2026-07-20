'use client';

export function HikeGrid({ searchParams }: any) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      <p className="col-span-full text-surface-500 text-sm py-8 text-center">
        Grille de randonnées — À connecter avec TanStack Query
      </p>
    </div>
  );
}
