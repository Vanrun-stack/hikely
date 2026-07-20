'use client';

/**
 * CommunitySection — Testimonials with animated avatars.
 */
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const TESTIMONIALS = [
  {
    name: 'Sophie Martin',
    role: 'Randonneuse passionnée',
    avatar: 'SM',
    rating: 5,
    text: 'Hikely a changé ma façon de préparer mes randonnées. Les tracés GPX en 3D et les avis de la communauté sont incroyablement utiles.',
    color: 'bg-emerald-500',
  },
  {
    name: 'Thomas Dubois',
    role: 'Guide de montagne',
    avatar: 'TD',
    rating: 5,
    text: 'En tant que professionnel, j\'utilise Hikely pour recommander des itinéraires à mes clients. La précision des données est remarquable.',
    color: 'bg-sky-500',
  },
  {
    name: 'Marie Leroy',
    role: 'Trail runner',
    avatar: 'ML',
    rating: 5,
    text: 'Le mode hors-ligne est parfait pour mes sessions trail en montagne. Je télécharge les cartes avant de partir et tout fonctionne sans réseau.',
    color: 'bg-amber-500',
  },
];

export function CommunitySection() {
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
            Communauté
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">
            Ce que disent nos membres
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Rejoignez plus de 45 000 passionnés de randonnée et de nature.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="relative p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300"
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-muted/20" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-sm leading-relaxed text-muted-foreground mb-6">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className={`${t.color} text-white text-xs font-bold`}>
                    {t.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
