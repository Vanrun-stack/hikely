'use client';

/**
 * StatsSection — Animated counters with icons.
 */
import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Mountain, Users, Map, Star } from 'lucide-react';

const STATS = [
  { value: 12000, suffix: '+', label: 'Randonnées', icon: Mountain, color: 'text-emerald-500' },
  { value: 45000, suffix: '+', label: 'Membres actifs', icon: Users, color: 'text-sky-500' },
  { value: 28, suffix: '', label: 'Régions', icon: Map, color: 'text-amber-500' },
  { value: 4.8, suffix: '/5', label: 'Note moyenne', icon: Star, color: 'text-rose-500', decimals: 1 },
];

function AnimatedCounter({ target, decimals = 0, suffix = '' }: { target: number; decimals?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  const formatted = decimals > 0
    ? count.toFixed(decimals)
    : count >= 1000
      ? `${Math.floor(count / 1000)}\u00A0${String(Math.floor(count % 1000)).padStart(3, '0')}`
      : Math.floor(count).toString();

  return <span ref={ref}>{formatted}{suffix}</span>;
}

export function StatsSection() {
  return (
    <section className="py-16 md:py-20 border-y border-border bg-muted/30">
      <div className="container-wide">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center space-y-2"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-3xl md:text-4xl font-bold tracking-tight">
                <AnimatedCounter target={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
