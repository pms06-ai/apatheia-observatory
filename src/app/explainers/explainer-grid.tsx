'use client';

import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { ExplainerEntry, ExplainerCategory } from '@/types';

const categoryLabels: Record<ExplainerCategory, string> = {
  legal: 'Legal & Constitutional',
  military: 'Military & Intelligence',
  nuclear: 'Nuclear',
  iranian: 'Iranian Context',
  media: 'Media & Rhetoric',
  geopolitical: 'Geopolitical',
  fallacies: 'Logical Fallacies',
  strategy: 'Strategy & Doctrine',
};

const categoryColors: Record<ExplainerCategory, string> = {
  legal: 'border-gold bg-gold/10 text-gold',
  military: 'border-steel bg-steel/10 text-steel',
  nuclear: 'border-status-critical bg-status-critical/10 text-status-critical',
  iranian: 'border-copper bg-copper/10 text-copper',
  media: 'border-bronze bg-bronze/10 text-bronze',
  geopolitical: 'border-status-info bg-status-info/10 text-status-info',
  fallacies: 'border-gunmetal bg-gunmetal/10 text-gunmetal',
  strategy: 'border-silver bg-silver/10 text-silver',
};

export function ExplainerGrid({
  explainers,
  categories,
}: {
  explainers: ExplainerEntry[];
  categories: string[];
}) {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Handle hash-based navigation (e.g. /explainers#war-powers-act)
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const entry = explainers.find((e) => e.id === hash);
      if (entry) {
        // Use requestAnimationFrame to avoid setState-in-effect lint warning
        requestAnimationFrame(() => {
          setExpandedId(hash);
          setTimeout(() => {
            document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        });
      }
    }
  }, [explainers]);

  const filtered = useMemo(() => {
    let result = explainers;

    if (category !== 'all') {
      result = result.filter((e) => e.category === category);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.term.toLowerCase().includes(q) ||
          e.definition.toLowerCase().includes(q) ||
          e.how_it_works.toLowerCase().includes(q) ||
          e.also_known_as.some((a) => a.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => a.term.localeCompare(b.term));
  }, [explainers, category, search]);

  const scrollToEntry = (id: string) => {
    setExpandedId(id);
    // Find the entry's category to ensure it's visible
    const entry = explainers.find((e) => e.id === id);
    if (entry && category !== 'all' && entry.category !== category) {
      setCategory('all');
    }
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="space-y-4 p-6">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search terms, definitions, concepts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search explainers"
          className="w-full rounded-lg border border-line bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-faint outline-none focus:border-gold/40 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-primary text-xs"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Explainer categories">
        <button
          role="tab"
          aria-selected={category === 'all'}
          onClick={() => setCategory('all')}
          className={cn(
            'rounded-full px-3 py-1 text-xs transition-all',
            category === 'all'
              ? 'bg-gold/20 text-gold'
              : 'bg-charcoal-800 text-text-muted hover:text-text-primary'
          )}
        >
          All ({explainers.length})
        </button>
        {categories.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={category === c}
            onClick={() => setCategory(c)}
            className={cn(
              'rounded-full px-3 py-1 text-xs transition-all',
              category === c
                ? 'bg-gold/20 text-gold'
                : 'bg-charcoal-800 text-text-muted hover:text-text-primary'
            )}
          >
            {categoryLabels[c as ExplainerCategory] ?? c} (
            {explainers.filter((e) => e.category === c).length})
          </button>
        ))}
      </div>

      {/* Results count */}
      {search && (
        <p className="text-xs text-text-faint">
          {filtered.length} {filtered.length === 1 ? 'result' : 'results'} for &ldquo;{search}&rdquo;
        </p>
      )}

      {/* Card grid */}
      <div className="space-y-3">
        {filtered.map((entry) => {
          const isOpen = expandedId === entry.id;

          return (
            <div
              key={entry.id}
              id={entry.id}
              className="rounded-lg border border-line bg-bg-elevated transition-all"
            >
              {/* Card header — always visible */}
              <button
                onClick={() => setExpandedId(isOpen ? null : entry.id)}
                aria-expanded={isOpen}
                className="w-full px-5 py-4 text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={cn(
                          'rounded-full border px-2 py-0.5 text-[10px] font-medium',
                          categoryColors[entry.category] ?? 'border-line text-text-faint'
                        )}
                      >
                        {categoryLabels[entry.category] ?? entry.category}
                      </span>
                      {entry.also_known_as.length > 0 && (
                        <span className="text-[10px] text-text-faint">
                          aka {entry.also_known_as[0]}
                          {entry.also_known_as.length > 1 && ` +${entry.also_known_as.length - 1}`}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      {entry.term}
                    </h3>
                    <p className="mt-1 text-sm text-text-muted leading-relaxed line-clamp-2">
                      {entry.definition}
                    </p>
                  </div>
                  <span className="text-text-faint text-xs shrink-0 mt-1">
                    {isOpen ? '▾' : '▸'}
                  </span>
                </div>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="border-t border-line px-5 py-5 space-y-5 animate-fade-in">
                  {/* Definition */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gold mb-1.5">
                      Definition
                    </p>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {entry.definition}
                    </p>
                  </div>

                  {/* How It Works */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gold mb-1.5">
                      How It Works
                    </p>
                    <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line">
                      {entry.how_it_works}
                    </p>
                  </div>

                  {/* Why It Matters */}
                  <div className="rounded-lg border border-copper/30 bg-copper/5 p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-copper mb-1.5">
                      Why It Matters
                    </p>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {entry.why_it_matters}
                    </p>
                  </div>

                  {/* Common Misconceptions */}
                  {entry.common_misconceptions.length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-bronze mb-2">
                        Common Misconceptions
                      </p>
                      <div className="space-y-2">
                        {entry.common_misconceptions.map((m, i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-line bg-bg-tertiary p-3"
                          >
                            <p className="text-sm text-text-muted leading-relaxed">
                              {m}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* In Context */}
                  <div className="rounded-lg border border-gold/30 bg-gold/5 p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-gold mb-1.5">
                      In Context
                    </p>
                    <p className="text-sm text-text-primary leading-relaxed">
                      {entry.in_context}
                    </p>
                  </div>

                  {/* Related Terms */}
                  {entry.related_terms.length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-text-faint mb-2">
                        Related Terms
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.related_terms.map((rt) => {
                          const related = explainers.find((e) => e.id === rt);
                          return (
                            <button
                              key={rt}
                              onClick={(e) => {
                                e.stopPropagation();
                                scrollToEntry(rt);
                              }}
                              className="rounded-full bg-gold/10 px-2.5 py-0.5 text-[10px] text-gold hover:bg-gold/20 transition-colors cursor-pointer"
                            >
                              {related?.term ?? rt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sources */}
                  {entry.sources.length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-text-faint mb-1.5">
                        Sources
                      </p>
                      <ul className="space-y-0.5">
                        {entry.sources.map((s, i) => (
                          <li key={i} className="text-xs text-text-faint">
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-text-faint">
            No explainer entries match your search.
          </div>
        )}
      </div>
    </div>
  );
}
