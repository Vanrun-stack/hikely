'use client';

export function ReviewForm({ hikeId }: any) {
  return (
    <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-xl mb-6">
      <h4 className="font-medium mb-3 text-surface-900 dark:text-white">Ajouter un avis</h4>
      <textarea
        className="w-full p-3 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 resize-none text-sm text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
        rows={3}
        placeholder="Partagez votre expérience sur cette randonnée..."
      />
      <button className="mt-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
        Publier
      </button>
    </div>
  );
}
