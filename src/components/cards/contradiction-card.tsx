'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { SeverityBadge } from '@/components/ui/severity-badge';
import { cn } from '@/lib/utils';
import type { Contradiction } from '@/types';

type EnrichedContradiction = Contradiction & {
  actor_name?: string;
  counterparty_name?: string | null;
  theme_names?: string[];
};

export function ContradictionCard({
  contradiction,
}: {
  contradiction: EnrichedContradiction;
}) {
  const [expanded, setExpanded] = useState(false);
  const c = contradiction;

  return (
    <div
      className={`rounded-lg border border-line bg-bg-elevated transition-all severity-${c.severity}`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 text-left cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-text-primary text-sm">
              {c.title}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-text-faint">
              <span className="text-gold">{c.actor_name || c.actor}</span>
              {(c.counterparty_name || c.counterparty) && (
                <>
                  <span>vs</span>
                  <span className="text-bronze">{c.counterparty_name || c.counterparty}</span>
                </>
              )}
              <span>·</span>
              <span>{c.type}</span>
              {c.date_range && (
                <>
                  <span>·</span>
                  <span>{c.date_range}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SeverityBadge severity={c.severity} />
            <ChevronDown
              className={cn(
                'h-4 w-4 text-text-faint transition-transform duration-200',
                expanded && 'rotate-180'
              )}
            />
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-line px-4 py-3 animate-slide-down">
          <p className="text-sm text-text-muted">{c.summary}</p>
          {c.tension && (
            <div className="mt-2">
              <p className="text-xs font-medium uppercase tracking-wider text-copper">
                Tension
              </p>
              <p className="mt-1 text-sm text-text-muted">{c.tension}</p>
            </div>
          )}
          {c.themes?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {c.themes.map((t, i) => (
                <Link
                  key={t}
                  href={`/themes/${t}`}
                  className="rounded bg-charcoal-800 px-1.5 py-0.5 text-[10px] text-text-faint hover:bg-gold/10 hover:text-gold transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {c.theme_names?.[i] || t}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
