'use client';

/**
 * HowItWorks — 3-step guide with animated cards.
 */
import { motion } from 'framer-motion';
import { Search, MapPinned, Camera } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    title: 'Découvrez',
    desc: 'Parcourez des milliers de randonnées filtrées par difficulté, durée, dénivelé et région.',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20',
    number: '01',
  },
  {
    icon: MapPinned,
    title: 'Planifiez',
    desc: 'Consultez les tracés GPX en 3D, profils altimétriques et avis détaillés de la communauté.',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20',
    number: '02',
  },
  {
    icon: Camera,
    title: 'Partagez',
    desc: 'Publiez vos photos, rédigez vos avis et contribuez à enrichir la communauté.',
    color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    border: 'border-sky-500/20',
    number: '03',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary tracking-wide uppercase">
            Simple & rapide
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">
            Comment ça marche
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className={`relative p-8 rounded-2xl bg-card border ${step.border} hover:shadow-lg transition-all duration-300 group`}
            >
              {/* Step number */}
              <div className="absolute top-4 right-4 text-5xl font-black text-muted/30 select-none">
                {step.number}
              </div>

              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <step.icon className="w-7 h-7" />
              </div>

              <h3 className="font-semibold text-xl mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
