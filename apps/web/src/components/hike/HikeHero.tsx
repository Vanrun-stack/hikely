export function HikeHero({ hike }: any) {
  return (
    <div className="relative h-64 md:h-[420px] bg-surface-800 overflow-hidden">
      {hike.featuredImageUrl && (
        <img
          src={hike.featuredImageUrl}
          alt={hike.name}
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 container-wide pb-8 text-white">
        <h1 className="text-3xl md:text-5xl font-bold drop-shadow-lg">{hike.name}</h1>
      </div>
    </div>
  );
}
