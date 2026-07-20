'use client';

export function HikeActions({ hike, isAuthenticated }: any) {
  return (
    <div className="p-4 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 space-y-3">
      <h3 className="font-semibold text-surface-900 dark:text-white">Actions</h3>
      {isAuthenticated ? (
        <button className="w-full px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors text-sm font-medium">
          Télécharger GPX
        </button>
      ) : (
        <a
          href="/login"
          className="block w-full px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-center transition-colors text-sm font-medium"
        >
          Se connecter pour télécharger
        </a>
      )}
    </div>
  );
}
