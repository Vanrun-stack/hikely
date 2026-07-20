import { cn } from '@/lib/utils';

const DIFFICULTY_CONFIG = {
  very_easy: { label: 'Très facile', class: 'badge-very-easy' },
  easy:      { label: 'Facile',      class: 'badge-easy' },
  moderate:  { label: 'Modéré',      class: 'badge-moderate' },
  hard:      { label: 'Difficile',   class: 'badge-hard' },
  expert:    { label: 'Expert',      class: 'badge-expert' },
} as const;

interface Props {
  difficulty: string;
  size?: 'sm' | 'md';
}

export function DifficultyBadge({ difficulty, size = 'sm' }: Props) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] ?? {
    label: difficulty,
    class: 'bg-surface-100 text-surface-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        config.class,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      )}
    >
      {config.label}
    </span>
  );
}
