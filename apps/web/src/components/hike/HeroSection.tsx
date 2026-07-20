'use client';

/**
 * HeroSection — Premium animated hero for the landing page.
 * Features animated gradient background, floating stats, and search prompt.
 */
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, MapPin, Mountain, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

const floatingIcons = [
  { icon: '🏔️', x: '10%', y: '20%', delay: 0, duration: 6 },
  { icon: '🌲', x: '85%', y: '15%', delay: 1.5, duration: 7 },
  { icon: '🦌', x: '75%', y: '70%', delay: 0.8, duration: 5 },
  { icon: '⛺', x: '15%', y: '75%', delay: 2, duration: 8 },
  { icon: '🌅', x: '50%', y: '10%', delay: 0.5, duration: 6 },
  { icon: '🧭', x: '90%', y: '45%', delay: 1, duration: 7 },
];

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-[100svh] flex items-center overflow-hidden"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,158,11,0.1),transparent_50%)]" />

      {/* Floating nature emojis */}
      {floatingIcons.map((item, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl md:text-4xl opacity-20 pointer-events-none select-none"
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -12, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: 'easeInOut',
          }}
        >
          {item.icon}
        </motion.div>
      ))}

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Content */}
      <div className="container-wide relative z-10 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-emerald-300 text-sm font-medium mb-8">
              <Mountain className="w-4 h-4" />
              Plateforme communautaire de randonnée
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6"
          >
            Vos prochaines{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400">
              aventures
            </span>
            <br />
            commencent ici
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-emerald-200/80 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Découvrez des milliers de randonnées vérifiées par la communauté.
            Tracés GPX, cartes 3D, profils d&apos;élévation et avis détaillés.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="max-w-xl mx-auto mb-10"
          >
            <Link href="/hikes?focus=search" className="block group">
              <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 hover:border-white/25 transition-all duration-300 cursor-text">
                <Search className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                <span className="text-white/50 text-base">
                  Rechercher une randonnée, une région...
                </span>
                <div className="ml-auto hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 text-white/40 text-xs">
                  <Compass className="w-3 h-3" />
                  Ctrl+K
                </div>
              </div>
            </Link>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl px-8 py-6 text-base font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/30 transition-all"
            >
              <Link href="/hikes">
                <MapPin className="w-5 h-5 mr-2" />
                Explorer les randonnées
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-white/5 hover:bg-white/10 text-white border-white/20 hover:border-white/30 rounded-xl px-8 py-6 text-base backdrop-blur-sm transition-all"
            >
              <Link href="/register">Rejoindre la communauté</Link>
            </Button>
          </motion.div>
        </div>

        {/* Bottom stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto"
        >
          {[
            { value: '12 000+', label: 'Randonnées', icon: '🥾' },
            { value: '45 000+', label: 'Membres', icon: '👥' },
            { value: '28', label: 'Régions', icon: '🗺️' },
            { value: '4.8/5', label: 'Note moyenne', icon: '⭐' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5"
            >
              <div className="text-xl md:text-2xl font-bold text-white">
                {stat.value}
              </div>
              <div className="text-xs text-emerald-300/60 mt-0.5">
                {stat.icon} {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
