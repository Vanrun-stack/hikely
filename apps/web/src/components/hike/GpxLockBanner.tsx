'use client';

import { motion } from 'framer-motion';
import { Lock, MapPin, Download } from 'lucide-react';
import Link from 'next/link';

export function GpxLockBanner() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex items-end pointer-events-auto z-10"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-surface-900/90 via-surface-900/30 to-transparent" />

      {/* Banner */}
      <div className="relative w-full p-4 md:p-6">
        <div className="glass-card rounded-2xl p-4 md:p-6 max-w-lg mx-auto text-center">
          {/* Icon */}
          <div className="w-12 h-12 bg-brand-600/20 border border-brand-600/30 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-brand-400" />
          </div>

          <h3 className="font-bold text-white text-lg mb-1">
            Tracé GPX complet
          </h3>
          <p className="text-surface-300 text-sm mb-4">
            Connectez-vous pour débloquer le tracé complet, le profil altimétrique et le téléchargement GPX.
          </p>

          <div className="flex items-center gap-3 justify-center">
            <Link
              href="/login"
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition-colors text-sm"
            >
              <MapPin className="w-4 h-4" />
              Voir le tracé complet
            </Link>
            <Link
              href="/register"
              className="px-4 py-2.5 text-surface-300 hover:text-white text-sm transition-colors"
            >
              Créer un compte
            </Link>
          </div>

          {/* Features list */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-surface-400">
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" /> Téléchargement GPX
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Profil altimétrique
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
