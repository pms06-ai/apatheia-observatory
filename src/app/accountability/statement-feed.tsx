'use client';

import { useState, useMemo } from 'react';
import { FilterBar } from '@/components/ui/filter-bar';
import { formatDate, cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import type { Statement } from '@/types';
import Link from 'next/link';

const stanceColors: Record<string, string> = {
  hawk: 'bg-copper/20 text-copper border-copper/30',
  dove: 'bg-status-info/20 text-status-info border-status-info/30',
  moderate: 'bg-steel/20 text-steel border-steel/30',
  mixed: 'bg-gold/20 text-gold border-gold/30',
};

export function StatementFeed({
  statements,
  actors,
  themes,
  stances,
}: {
  statements: Statement[];
  actors: string[];
  themes: string[];
  stances: string[];
}) {
  const [search, setSearch] = useState('');
  const [actor, setActor] = useState('all');
  const [theme, setTheme] = useState('all');
  const [stance, setStance] = useState('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return statements
      .filter((s) => {
        if (search) {
          const q = search.toLowerCase();
          const h = `${s.text} ${s.actor} ${s.significance} ${s.media_reception} ${s.context}`.toLowerCase();
          if (!h.includes(q)) return false;
        }
        if (actor !== 'all' && s.actor !== actor) return false;
        if (theme !== 'all' && !s.themes.includes(theme)) return false;
        if (stance !== 'all' && s.stance !== stance) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [statements, search, actor, theme, stance]);

  return (
    <div className="space-y-4 p-6">
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        filters={[
          {
            name: 'Actor',
            value: actor,
            options: actors.map((a) => ({ value: a, label: a })),
            onChange: setActor,
          },
          {
            name: 'Theme',
            value: theme,
            options: themes.map((t) => ({ value: t, label: t })),
            onChange: setTheme,
          },
          {
            name: 'Stance',
            value: stance,
            options: stances.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
            onChange: setStance,
          },
        ]}
        onClearAll={() => { setSearch(''); setActor('all'); setTheme('all'); setStance('all'); }}
      />

      <p className="text-xs text-text-faint">
        {filtered.length} of {statements.length} statements
      </p>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-text-faint">
            No statements match your filters.
          </div>
        )}
        {filtered.map((s) => {
          const isOpen = expanded.has(s.id);
          return (
            <div
              key={s.id}
              className="rounded-lg border border-line bg-bg-elevated transition-all"
            >
              {/* Header */}
              <button
                onClick={() => toggle(s.id)}
                aria-expanded={isOpen}
                className="w-full px-5 py-4 text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Link
                        href={`/actors/${s.actor_id}`}
                        className="text-sm font-semibold text-gold hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {s.actor}
                      </Link>
                      <span className="text-xs text-text-faint">
                        {formatDate(s.date)}
                      </span>
                      <span
                        className={cn(
                          'rounded-full border px-2 py-0.5 text-[10px] font-medium',
                          stanceColors[s.stance] ?? 'bg-charcoal-800 text-text-faint border-line'
                        )}
                      >
                        {s.stance}
                      </span>
                      {s.type === 'historical_record' && (
                        <span className="rounded bg-charcoal-800 px-1.5 py-0.5 text-[10px] text-text-faint">
                          historical record
                        </span>
                      )}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-sm text-text-primary leading-relaxed border-l-2 border-gold/30 pl-3">
                      {s.text.length > 200 && !isOpen
                        ? s.text.slice(0, 200) + '…'
                        : s.text}
                    </blockquote>

                    <p className="mt-1.5 text-xs text-text-faint italic">
                      {s.context} — {s.source}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-text-faint shrink-0 transition-transform duration-200',
                      isOpen && 'rotate-180'
                    )}
                  />
                </div>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="border-t border-line px-5 py-4 space-y-4 animate-fade-in">
                  {/* Significance */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gold mb-1">
                      Significance
                    </p>
                    <p className="text-sm text-text-muted">{s.significance}</p>
                  </div>

                  {/* Media Reception */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-copper mb-1">
                      Media Reception
                    </p>
                    <p className="text-sm text-text-muted">{s.media_reception}</p>
                  </div>

                  {/* Themes */}
                  <div className="flex flex-wrap gap-1.5">
                    {s.themes.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-gold/10 px-2.5 py-0.5 text-[10px] text-gold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
