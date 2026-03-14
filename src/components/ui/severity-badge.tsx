import { cn } from '@/lib/utils';
import type { Severity } from '@/types';

const colorMap: Record<Severity, string> = {
  high: 'bg-copper/20 text-copper',
  medium: 'bg-gold/20 text-gold',
  low: 'bg-steel/20 text-steel',
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
        colorMap[severity]
      )}
    >
      {severity}
    </span>
  );
}
