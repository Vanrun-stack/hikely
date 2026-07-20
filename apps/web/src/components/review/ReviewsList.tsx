export function ReviewsList({ hikeId, reviews }: any) {
  if (!reviews?.length) {
    return (
      <p className="text-surface-500 text-sm py-4">
        Aucun avis pour le moment. Soyez le premier !
      </p>
    );
  }
  return (
    <div className="space-y-4 mt-4">
      {reviews.map((r: any) => (
        <div
          key={r.id}
          className="p-4 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-brand-700 dark:text-brand-400 font-semibold text-sm">
              {(r.author.displayName ?? r.author.username)[0].toUpperCase()}
            </div>
            <div>
              <span className="font-medium text-surface-900 dark:text-white text-sm">
                {r.author.displayName ?? r.author.username}
              </span>
              <div className="text-amber-400 text-xs">
                {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
              </div>
            </div>
          </div>
          {r.content && (
            <p className="text-surface-600 dark:text-surface-400 text-sm leading-relaxed">
              {r.content}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
