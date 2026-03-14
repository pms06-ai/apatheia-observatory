'use client';

import { useState } from 'react';
import { cn, formatDate } from '@/lib/utils';
import type { FramingAnalysis } from '@/types';

const categoryLabels: Record<string, string> = {
  selective_coverage: 'Selective Coverage',
  false_framing: 'False Framing',
  false_equivalence: 'False Equivalence',
  position_shift: 'Position Shift',
  double_standard: 'Double Standard',
  misplaced_priorities: 'Misplaced Priorities',
  strategic_distraction: 'Strategic Distraction',
  suppressed_narrative: 'Suppressed Narrative',
  platform_bias: 'Platform Bias',
  moral_inversion: 'Moral Inversion',
  coverage_comparison: 'Coverage Comparison',
};

const categoryColors: Record<string, string> = {
  selective_coverage: 'border-copper bg-copper/10 text-copper',
  false_framing: 'border-gold bg-gold/10 text-gold',
  false_equivalence: 'border-bronze bg-bronze/10 text-bronze',
  position_shift: 'border-status-info bg-status-info/10 text-status-info',
  double_standard: 'border-copper bg-copper/10 text-copper',
  misplaced_priorities: 'border-steel bg-steel/10 text-steel',
  strategic_distraction: 'border-gunmetal bg-gunmetal/10 text-gunmetal',
  suppressed_narrative: 'border-status-critical bg-status-critical/10 text-status-critical',
  platform_bias: 'border-bronze bg-bronze/10 text-bronze',
  moral_inversion: 'border-copper bg-copper/10 text-copper',
  coverage_comparison: 'border-steel bg-steel/10 text-steel',
};

const severityColors: Record<string, string> = {
  critical: 'text-status-critical',
  high: 'text-copper',
  medium: 'text-gold',
  low: 'text-steel',
};

export function FramingFeed({
  analyses,
  categories,
}: {
  analyses: FramingAnalysis[];
  categories: string[];
}) {
  const [category, setCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered =
    category === 'all'
      ? analyses
      : analyses.filter((a) => a.category === category);

  return (
    <div className="space-y-4 p-6">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Framing categories">
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
          All ({analyses.length})
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
            {categoryLabels[c] ?? c} ({analyses.filter((a) => a.category === c).length})
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-text-faint">
            No framing analyses match your filters.
          </div>
        )}
        {filtered.map((a) => {
          const isOpen = expandedId === a.id;

          return (
            <div
              key={a.id}
              className={cn(
                'rounded-lg border bg-bg-elevated transition-all',
                a.severity === 'critical' ? 'border-copper/40' : 'border-line'
              )}
            >
              <button
                onClick={() => setExpandedId(isOpen ? null : a.id)}
                aria-expanded={isOpen}
                className="w-full px-5 py-4 text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={cn(
                          'rounded-full border px-2 py-0.5 text-[10px] font-medium',
                          categoryColors[a.category] ?? 'border-line text-text-faint'
                        )}
                      >
                        {categoryLabels[a.category] ?? a.category}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-medium uppercase',
                          severityColors[a.severity] ?? 'text-text-faint'
                        )}
                      >
                        {a.severity}
                      </span>
                      <span className="text-xs text-text-faint">
                        {formatDate(a.date)}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      {a.title}
                    </h3>
                    <p className="mt-1 text-sm text-text-muted leading-relaxed">
                      {a.summary}
                    </p>
                  </div>
                  <span className="text-text-faint text-xs shrink-0">
                    {isOpen ? '▾' : '▸'}
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-line px-5 py-5 space-y-5 animate-fade-in">
                  {/* Analysis */}
                  {a.analysis && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-gold mb-1.5">
                        Analysis
                      </p>
                      <p className="text-sm text-text-muted leading-relaxed">
                        {a.analysis}
                      </p>
                    </div>
                  )}

                  {/* Amplified vs Suppressed (selective_coverage) */}
                  {a.amplified_story && a.suppressed_story && (
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-lg border border-copper/30 bg-copper/5 p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-copper mb-2">
                          Amplified
                        </p>
                        <p className="text-sm text-text-muted">
                          {(a.amplified_story as Record<string, string>).event}
                        </p>
                        <p className="mt-1 text-xs text-text-faint">
                          Framing: {(a.amplified_story as Record<string, string>).framing}
                        </p>
                        <p className="mt-1 text-xs text-text-faint">
                          Coverage: {(a.amplified_story as Record<string, string>).coverage_hours}
                        </p>
                      </div>
                      <div className="rounded-lg border border-status-info/30 bg-status-info/5 p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-status-info mb-2">
                          Suppressed
                        </p>
                        <p className="text-sm text-text-muted">
                          {(a.suppressed_story as Record<string, string>).event}
                        </p>
                        <p className="mt-1 text-xs text-text-faint">
                          Framing: {(a.suppressed_story as Record<string, string>).framing}
                        </p>
                        <p className="mt-1 text-xs text-text-faint">
                          Coverage: {(a.suppressed_story as Record<string, string>).coverage_hours}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* What honest coverage looks like */}
                  {a.what_honest_coverage_looks_like && (
                    <div className="rounded-lg border border-status-success/30 bg-status-success/5 p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-status-success mb-1.5">
                        What Honest Coverage Looks Like
                      </p>
                      <p className="text-sm text-text-muted leading-relaxed">
                        {a.what_honest_coverage_looks_like}
                      </p>
                    </div>
                  )}

                  {/* The Contradiction (position_shift) */}
                  {a.the_contradiction && (
                    <div className="rounded-lg border border-copper/30 bg-copper/5 p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-copper mb-1.5">
                        The Contradiction
                      </p>
                      <p className="text-sm text-text-muted leading-relaxed">
                        {a.the_contradiction}
                      </p>
                    </div>
                  )}

                  {/* Timeline (position_shift) */}
                  {a.timeline && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-text-faint mb-2">
                        Position Timeline
                      </p>
                      <div className="relative space-y-0">
                        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-status-info via-gold to-copper" />
                        {a.timeline.map((t, i) => (
                          <div key={i} className="relative flex gap-4 pb-4">
                            <div className="relative z-10 mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-gold/60 bg-bg-primary" />
                            <div>
                              <p className="text-xs text-text-faint">{formatDate(t.date)}</p>
                              <p className="text-sm text-text-muted">{t.position}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Moral authority claims */}
                  {a.who_claims_moral_authority && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-copper mb-2">
                        Claims vs. Reality
                      </p>
                      <div className="space-y-2">
                        {a.who_claims_moral_authority.map((m, i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-line bg-bg-tertiary p-3"
                          >
                            <p className="text-xs font-semibold text-gold">
                              {m.actor}
                            </p>
                            <p className="text-sm text-text-primary mt-0.5">
                              &ldquo;{m.claim}&rdquo;
                            </p>
                            <p className="text-xs text-copper mt-1">
                              Ignores: {m.what_they_ignore}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* The real moral question */}
                  {a.the_real_moral_question && (
                    <div className="rounded-lg border border-gold/30 bg-gold/5 p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-gold mb-1.5">
                        The Real Question
                      </p>
                      <p className="text-sm text-text-primary leading-relaxed italic">
                        {a.the_real_moral_question}
                      </p>
                    </div>
                  )}

                  {/* Event coverage comparison */}
                  {a.event_coverage && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-text-faint mb-3">
                        Network Coverage Comparison
                      </p>
                      {a.event_coverage.map((evt, i) => (
                        <div key={i} className="mb-4">
                          <h4 className="text-sm font-semibold text-text-primary mb-2">
                            {evt.event}
                          </h4>
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(evt)
                              .filter(([k]) => k !== 'event')
                              .map(([network, coverage]) => (
                                <div
                                  key={network}
                                  className="rounded border border-line bg-bg-tertiary p-3"
                                >
                                  <p className="text-xs font-semibold text-gold uppercase">
                                    {network.replace(/_/g, ' ')}
                                  </p>
                                  <p className="mt-1 text-xs text-text-muted">
                                    {coverage}
                                  </p>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Media accountability */}
                  {a.media_accountability && (
                    <div className="rounded-lg border border-copper/30 bg-copper/5 p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-copper mb-1.5">
                        Media Accountability
                      </p>
                      <p className="text-sm text-text-muted">
                        {a.media_accountability}
                      </p>
                    </div>
                  )}

                  {/* Themes */}
                  <div className="flex flex-wrap gap-1.5">
                    {a.themes.map((t) => (
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
