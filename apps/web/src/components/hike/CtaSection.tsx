'use client';

/**
 * CtaSection — Final call to action with gradient background.
 */
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Smartphone, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CtaSection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-stone-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.1),transparent_60%)]" />

      <div className="container-wide relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Prêt pour votre prochaine{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-emerald-400">
              aventure ?
            </span>
          </h2>
          <p className="text-lg text-emerald-200/70 mb-10 leading-relaxed">
            Créez votre compte gratuitement et commencez à explorer des milliers de randonnées.
            Disponible en mode hors-ligne.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              asChild
              size="lg"
              className="bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl px-8 py-6 text-base font-semibold shadow-xl transition-all"
            >
              <Link href="/register">
                Créer mon compte gratuit
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Features mini */}
          <div className="flex items-center justify-center gap-8 text-emerald-300/60 text-sm">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span>PWA Mobile</span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              <span>Mode hors-ligne</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
