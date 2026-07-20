'use client';

/**
 * FeaturedHikes — Grid of top-rated hikes with animated cards.
 * Displays mock data for now; connects to getFeaturedHikes action.
 */
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, MapPin, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Mock data — will be replaced by Server Component fetching
const FEATURED_HIKES = [
  {
    id: '1',
    slug: 'tour-du-mont-blanc',
    name: 'Tour du Mont-Blanc',
    description: 'Le tour mythique du plus haut sommet des Alpes',
    distanceKm: 170,
    elevationGainM: 10040,
    durationMin: 7200,
    difficulty: 'hard',
    avgRating: 4.9,
    reviewCount: 342,
    region: { name: 'Haute-Savoie', country: 'France' },
    gradient: 'from-emerald-500 to-teal-600',
    emoji: '🏔️',
  },
  {
    id: '2',
    slug: 'gr20-corse',
    name: 'GR20 — Corse',
    description: 'Le sentier de grande randonnée le plus dur d\'Europe',
    distanceKm: 180,
    elevationGainM: 12500,
    durationMin: 9600,
    difficulty: 'expert',
    avgRating: 4.8,
    reviewCount: 198,
    region: { name: 'Corse', country: 'France' },
    gradient: 'from-orange-500 to-red-600',
    emoji: '🔥',
  },
  {
    id: '3',
    slug: 'sentier-des-douaniers-cap-frehel',
    name: 'Sentier des Douaniers — Cap Fréhel',
    description: 'Randonnée côtière le long des falaises de grès rose',
    distanceKm: 14.5,
    elevationGainM: 320,
    durationMin: 300,
    difficulty: 'easy',
    avgRating: 4.7,
    reviewCount: 156,
    region: { name: 'Côtes-d\'Armor', country: 'France' },
    gradient: 'from-sky-500 to-blue-600',
    emoji: '🌊',
  },
  {
    id: '4',
    slug: 'lac-blanc-aiguilles-rouges',
    name: 'Lac Blanc — Aiguilles Rouges',
    description: 'Vue imprenable sur le massif du Mont-Blanc',
    distanceKm: 9.2,
    elevationGainM: 780,
    durationMin: 300,
    difficulty: 'moderate',
    avgRating: 4.9,
    reviewCount: 420,
    region: { name: 'Haute-Savoie', country: 'France' },
    gradient: 'from-amber-500 to-orange-600',
    emoji: '💎',
  },
  {
    id: '5',
    slug: 'cirque-de-gavarnie',
    name: 'Cirque de Gavarnie',
    description: 'L\'amphithéâtre naturel classé UNESCO',
    distanceKm: 12,
    elevationGainM: 680,
    durationMin: 330,
    difficulty: 'moderate',
    avgRating: 4.8,
    reviewCount: 280,
    region: { name: 'Hautes-Pyrénées', country: 'France' },
    gradient: 'from-purple-500 to-violet-600',
    emoji: '🏛️',
  },
  {
    id: '6',
    slug: 'calanques-marseille-cassis',
    name: 'Calanques — Marseille à Cassis',
    description: 'Criques turquoise et falaises calcaires',
    distanceKm: 28,
    elevationGainM: 1450,
    durationMin: 600,
    difficulty: 'hard',
    avgRating: 4.7,
    reviewCount: 225,
    region: { name: 'Bouches-du-Rhône', country: 'France' },
    gradient: 'from-cyan-500 to-emerald-600',
    emoji: '🏝️',
  },
];

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h${m > 0 ? m.toString().padStart(2, '0') : ''}` : `${m}min`;
}

const difficultyLabels: Record<string, string> = {
  very_easy: 'Très facile',
  easy: 'Facile',
  moderate: 'Modéré',
  hard: 'Difficile',
  expert: 'Expert',
};

export function FeaturedHikes() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-wide">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-semibold text-primary tracking-wide uppercase mb-2"
            >
              Les plus populaires
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold"
            >
              Randonnées incontournables
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button variant="ghost" asChild className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-primary">
              <Link href="/hikes">
                Tout voir <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_HIKES.map((hike, i) => (
            <motion.article
              key={hike.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group"
            >
              <Link href={`/hikes/${hike.slug}`} className="block">
                <div className="hike-card rounded-2xl overflow-hidden border border-border bg-card">
                  {/* Image area with gradient */}
                  <div className={`relative h-48 bg-gradient-to-br ${hike.gradient} flex items-center justify-center`}>
                    <span className="text-6xl opacity-50 group-hover:scale-110 transition-transform duration-500">
                      {hike.emoji}
                    </span>

                    {/* Difficulty badge */}
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className={`badge-${hike.difficulty.replace('_', '-')} text-xs font-medium`}>
                        {difficultyLabels[hike.difficulty]}
                      </Badge>
                    </div>

                    {/* Rating */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {hike.avgRating.toFixed(1)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Location */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{hike.region.name}, {hike.region.country}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {hike.name}
                    </h3>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{hike.distanceKm} km</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>+{hike.elevationGainM.toLocaleString()} m</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDuration(hike.durationMin)}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        {hike.reviewCount} avis
                      </span>
                      <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        Voir le tracé <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="flex justify-center mt-8 md:hidden">
          <Button variant="outline" asChild>
            <Link href="/hikes">
              Voir toutes les randonnées <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
