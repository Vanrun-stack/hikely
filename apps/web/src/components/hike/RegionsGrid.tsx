'use client';

/**
 * RegionsGrid — Explore by region with animated cards.
 */
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, ChevronRight } from 'lucide-react';

const REGIONS = [
  { name: 'Alpes du Nord', count: 2840, emoji: '🏔️', gradient: 'from-blue-600 to-cyan-500', slug: 'alpes-du-nord' },
  { name: 'Pyrénées', count: 1560, emoji: '⛰️', gradient: 'from-emerald-600 to-green-500', slug: 'pyrenees' },
  { name: 'Corse', count: 890, emoji: '🏝️', gradient: 'from-amber-600 to-orange-500', slug: 'corse' },
  { name: 'Bretagne', count: 720, emoji: '🌊', gradient: 'from-slate-600 to-blue-500', slug: 'bretagne' },
  { name: 'Massif Central', count: 1120, emoji: '🌿', gradient: 'from-green-700 to-emerald-500', slug: 'massif-central' },
  { name: 'Provence', count: 960, emoji: '☀️', gradient: 'from-violet-600 to-purple-500', slug: 'provence' },
];

export function RegionsGrid() {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-primary tracking-wide uppercase">
            Toute la France
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">
            Explorer par région
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {REGIONS.map((region, i) => (
            <motion.div
              key={region.slug}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Link
                href={`/regions/${region.slug}`}
                className="group block relative overflow-hidden rounded-2xl aspect-[4/3] md:aspect-[3/2]"
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${region.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />

                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                }} />

                {/* Emoji */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl md:text-6xl opacity-40 group-hover:scale-125 transition-transform duration-500">
                    {region.emoji}
                  </span>
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
                  <h3 className="text-white font-bold text-lg md:text-xl leading-tight">
                    {region.name}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-white/70 text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {region.count.toLocaleString()} randonnées
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
