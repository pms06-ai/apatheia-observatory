'use client';

import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  filters: {
    name: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
  search?: string;
  onSearchChange?: (value: string) => void;
}

export function FilterBar({ filters, search, onSearchChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {onSearchChange && (
        <input
          type="text"
          value={search ?? ''}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search…"
          aria-label="Search"
          className="rounded-md border border-line bg-bg-elevated px-3 py-1.5 text-sm text-text-primary placeholder:text-text-faint outline-none focus:border-gold/40 transition-colors w-48"
        />
      )}
      {filters.map((f) => (
        <select
          key={f.name}
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          aria-label={`Filter by ${f.name}`}
          className="rounded-md border border-line bg-bg-elevated px-3 py-1.5 text-sm text-text-muted outline-none focus:border-gold/40 transition-colors"
        >
          <option value="all">All {f.name}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}

interface PillProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function Pill({
  label,
  active,
  onClick,
  variant = 'secondary',
}: PillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1 text-xs transition-all',
        active
          ? variant === 'primary'
            ? 'bg-gold/20 text-gold glow-gold'
            : 'bg-bronze/20 text-bronze'
          : 'bg-charcoal-800 text-text-muted hover:bg-charcoal-700 hover:text-text-primary'
      )}
    >
      {label}
    </button>
  );
}
