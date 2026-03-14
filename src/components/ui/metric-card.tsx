import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: number | string;
  detail?: string;
  accent?: 'gold' | 'bronze' | 'copper' | 'steel';
}

const accentMap = {
  gold: 'border-gold/30 hover:border-gold/50',
  bronze: 'border-bronze/30 hover:border-bronze/50',
  copper: 'border-copper/30 hover:border-copper/50',
  steel: 'border-steel/30 hover:border-steel/50',
};

const glowMap = {
  gold: 'text-gold',
  bronze: 'text-bronze',
  copper: 'text-copper',
  steel: 'text-steel',
};

export function MetricCard({
  label,
  value,
  detail,
  accent = 'gold',
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-bg-elevated p-4 transition-colors',
        accentMap[accent]
      )}
    >
      <p className="text-xs uppercase tracking-wider text-text-faint">
        {label}
      </p>
      <p className={cn('mt-1 text-2xl font-semibold', glowMap[accent])}>
        {value}
      </p>
      {detail && <p className="mt-1 text-xs text-text-muted">{detail}</p>}
    </div>
  );
}
