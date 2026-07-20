'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Clock, TrendingUp, Star, ArrowUpDown } from 'lucide-react';
import { DifficultyBadge } from './DifficultyBadge';
import { cn } from '@/lib/utils';

interface HikeCardProps {
  hike: {
    id: string;
    slug: string;
    name: string;
    description?: string;
    distanceKm?: number;
    elevationGainM?: number;
    durationMin?: number;
    difficulty: string;
    avgRating: number;
    reviewCount: number;
    featuredImageUrl?: string;
    region?: { name: string; country: string };
    author?: { displayName?: string; username: string };
    _count?: { photos: number; reviews: number };
  };
  index?: number;
  variant?: 'default' | 'compact' | 'featured';
}

function formatDuration(minutes?: number): string {
  if (!minutes) return '--';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h${m > 0 ? m.toString().padStart(2, '0') : ''}` : `${m}min`;
}

export function HikeCard({ hike, index = 0, variant = 'default' }: HikeCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
      className="group"
    >
      <Link href={`/hikes/${hike.slug}`} className="block">
        <div
          className={cn(
            'hike-card bg-white dark:bg-surface-900 rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-800',
            variant === 'featured' && 'md:flex',
          )}
        >
          {/* Image */}
          <div
            className={cn(
              'relative overflow-hidden bg-surface-200 dark:bg-surface-800',
              variant === 'featured' ? 'md:w-64 h-48 md:h-auto flex-shrink-0' : 'h-48',
            )}
          >
            {hike.featuredImageUrl ? (
              <Image
                src={hike.featuredImageUrl}
                alt={hike.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-950 dark:to-brand-900">
                <span className="text-4xl">🏔️</span>
              </div>
            )}

            {/* Difficulty badge */}
            <div className="absolute top-3 left-3">
              <DifficultyBadge difficulty={hike.difficulty} />
            </div>

            {/* Rating */}
            {hike.reviewCount > 0 && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {Number(hike.avgRating).toFixed(1)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col gap-3">
            {/* Location */}
            {hike.region && (
              <div className="flex items-center gap-1 text-xs text-surface-500">
                <MapPin className="w-3 h-3" />
                <span>{hike.region.name}, {hike.region.country}</span>
              </div>
            )}

            {/* Title */}
            <h3 className="font-semibold text-surface-900 dark:text-surface-50 line-clamp-2 leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {hike.name}
            </h3>

            {/* Stats */}
            <div className="flex items-center gap-3 text-sm text-surface-500">
              {hike.distanceKm && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{hike.distanceKm} km</span>
                </div>
              )}
              {hike.elevationGainM && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+{hike.elevationGainM} m</span>
                </div>
              )}
              {hike.durationMin && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDuration(hike.durationMin)}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1 border-t border-surface-100 dark:border-surface-800">
              <span className="text-xs text-surface-400">
                {hike.reviewCount > 0
                  ? `${hike.reviewCount} avis`
                  : 'Aucun avis encore'}
              </span>
              <div className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Voir le tracé</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
