export function HikeStats({ hike }: any) {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 text-sm">
      {hike.distanceKm && <span className="flex items-center gap-1"><span>📍</span>{hike.distanceKm} km</span>}
      {hike.elevationGainM && <span className="flex items-center gap-1"><span>📈</span>+{hike.elevationGainM} m</span>}
      {hike.durationMin && (
        <span className="flex items-center gap-1">
          <span>⏱️</span>
          {Math.floor(hike.durationMin / 60)}h{hike.durationMin % 60 > 0 ? String(hike.durationMin % 60).padStart(2,'0') : ''}
        </span>
      )}
    </div>
  );
}
