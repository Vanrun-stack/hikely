import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HikeHero } from '@/components/hike/HikeHero';
import { HikeStats } from '@/components/hike/HikeStats';
import { HikeMap } from '@/components/map/HikeMap';
import { ElevationProfile } from '@/components/map/ElevationProfile';
import { GpxLockBanner } from '@/components/hike/GpxLockBanner';
import { PhotoGallery } from '@/components/hike/PhotoGallery';
import { ReviewsList } from '@/components/review/ReviewsList';
import { ReviewForm } from '@/components/review/ReviewForm';
import { NearbyHikes } from '@/components/hike/NearbyHikes';
import { HikeActions } from '@/components/hike/HikeActions';
import { apiServer } from '@/lib/api-server';
import { currentUser } from '@/lib/auth-server';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const hike = await apiServer.hikes.getBySlug(slug);
    if (!hike) return { title: 'Randonnée introuvable' };

    return {
      title: hike.metaTitle ?? hike.name,
      description: hike.metaDescription ?? hike.description?.slice(0, 160),
      openGraph: {
        title: hike.name,
        description: hike.description?.slice(0, 200),
        images: hike.featuredImageUrl ? [{ url: hike.featuredImageUrl }] : [],
        type: 'article',
      },
    };
  } catch {
    return { title: 'Randonnée' };
  }
}

export default async function HikeDetailPage({ params }: Props) {
  const { slug } = await params;
  const user = await currentUser();

  let hike;
  try {
    hike = await apiServer.hikes.getBySlug(slug);
  } catch {
    notFound();
  }

  // notFound() throws, so hike is always defined here
  const hikeData = hike!;
  const isAuthenticated = !!user;

  return (
    <article>
      {/* Hero with featured image */}
      <HikeHero hike={hikeData} />

      <div className="container-wide py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats bar */}
            <HikeStats hike={hikeData} />

            {/* Description */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <div className="prose prose-stone dark:prose-invert max-w-none">
                <p>{hikeData.description}</p>
              </div>
            </section>

            {/* Map */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Carte</h2>
              <div className="rounded-2xl overflow-hidden h-96 relative">
                <HikeMap />
                {!isAuthenticated && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-20">
                    <div className="bg-card p-6 rounded-xl shadow-lg border border-border text-center max-w-sm">
                      <h3 className="font-semibold text-lg mb-2">Tracé GPX réservé aux membres</h3>
                      <p className="text-muted-foreground text-sm mb-4">Connectez-vous gratuitement pour visualiser la carte détaillée en 3D et télécharger le tracé.</p>
                      <a href="/login" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">Se connecter</a>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Elevation profile (auth only) */}
            {isAuthenticated && hikeData.gpxFile?.elevationProfile && (
              <section>
                <h2 className="text-xl font-semibold mb-3">Profil altimétrique</h2>
                <ElevationProfile data={hikeData.gpxFile.elevationProfile as any} />
              </section>
            )}

            {/* Photos */}
            {hikeData.photos.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-3">Photos ({hikeData.photoCount})</h2>
                <PhotoGallery photos={hikeData.photos} />
              </section>
            )}

            {/* Reviews */}
            <section>
              <h2 className="text-xl font-semibold mb-3">
                Avis ({hikeData.reviewCount})
              </h2>
              {isAuthenticated && <ReviewForm hikeId={hikeData.id} />}
              {/* Reviews disabled for now until we update the component */}
              <div className="text-sm text-muted-foreground">Avis temporairement désactivés</div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <HikeActions hike={hikeData} isAuthenticated={isAuthenticated} />

            {/* Nearby hikes */}
            <div>
              <h3 className="font-semibold mb-3">Randonnées proches</h3>
              <NearbyHikes hikeId={hikeData.id} />
            </div>
          </aside>
        </div>
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ExerciseAction',
            name: hikeData.name,
            description: hikeData.description,
            exerciseType: 'Hiking',
            distance: {
              '@type': 'QuantitativeValue',
              value: hikeData.distanceKm,
              unitCode: 'KMT',
            },
            location: {
              '@type': 'Place',
              name: hikeData.region?.name,
              address: { '@type': 'PostalAddress', addressCountry: hikeData.region?.country },
            },
            aggregateRating: hikeData.reviewCount > 0
              ? {
                  '@type': 'AggregateRating',
                  ratingValue: hikeData.avgRating,
                  reviewCount: hikeData.reviewCount,
                  bestRating: 5,
                  worstRating: 1,
                }
              : undefined,
          }),
        }}
      />
    </article>
  );
}
