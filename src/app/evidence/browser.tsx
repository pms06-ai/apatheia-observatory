'use client';

import { useState, useMemo } from 'react';
import { EvidenceCard } from '@/components/cards/evidence-card';
import { FilterBar } from '@/components/ui/filter-bar';
import type { Evidence } from '@/types';

const PAGE_SIZE = 15;

export function EvidenceBrowser({
  evidence,
  themes,
  kinds,
}: {
  evidence: Evidence[];
  themes: string[];
  kinds: string[];
}) {
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState('all');
  const [kind, setKind] = useState('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return evidence.filter((e) => {
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${e.title} ${e.text} ${e.doc_title} ${e.actors.join(' ')} ${e.themes.join(' ')}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (theme !== 'all' && !e.themes.includes(theme)) return false;
      if (kind !== 'all' && e.kind !== kind) return false;
      return true;
    });
  }, [evidence, search, theme, kind]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  // Clamp page to valid range when filters reduce results
  const safePage = Math.min(page, Math.max(1, totalPages));
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4 p-6">
      <FilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        filters={[
          {
            name: 'Themes',
            value: theme,
            options: themes.map((t) => ({ value: t, label: t })),
            onChange: (v: string) => { setTheme(v); setPage(1); },
          },
          {
            name: 'Kind',
            value: kind,
            options: kinds.map((k) => ({ value: k, label: k })),
            onChange: (v: string) => { setKind(v); setPage(1); },
          },
        ]}
      />

      <p className="text-xs text-text-faint">
        {filtered.length} items · Page {safePage} of {totalPages}
      </p>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-text-faint">
          No evidence items match your filters.
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {pageItems.map((e, i) => (
            <EvidenceCard key={e.id ?? `${e.doc_id}-${i}`} evidence={e} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(Math.max(1, safePage - 1))}
            disabled={safePage === 1}
            className="rounded-md border border-line bg-bg-elevated px-3 py-1.5 text-xs text-text-muted disabled:opacity-30"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`rounded-md px-2.5 py-1 text-xs ${
                  p === safePage
                    ? 'bg-gold/20 text-gold'
                    : 'text-text-muted hover:bg-charcoal-800'
                }`}
              >
                {p}
              </button>
            );
          })}
          {totalPages > 7 && (
            <span className="text-xs text-text-faint">…</span>
          )}
          <button
            onClick={() => setPage(Math.min(totalPages, safePage + 1))}
            disabled={safePage === totalPages}
            className="rounded-md border border-line bg-bg-elevated px-3 py-1.5 text-xs text-text-muted disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
