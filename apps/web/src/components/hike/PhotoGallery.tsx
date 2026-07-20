'use client';

export function PhotoGallery({ photos }: any) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {photos.map((p: any) => (
        <div
          key={p.id}
          className="aspect-square bg-surface-200 dark:bg-surface-800 rounded-xl overflow-hidden"
        >
          <img
            src={p.storageKey}
            alt={p.caption ?? ''}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      ))}
    </div>
  );
}
