'use client';

import { useState, useMemo } from 'react';
import { EvidenceCard } from '@/components/cards/evidence-card';
import { FilterBar } from '@/components/ui/filter-bar';
import { Button } from '@/components/ui/button';
import { useFilters } from '@/lib/use-filters';
import type { Evidence } from '@/types';

interface FacetItem {
  value: string;
  label: string;
  count: number;
}

const PAGE_SIZE = 15;

export function EvidenceBrowser({
  evidence,
  themes,
  kinds,
  themeFacets,
  kindFacets,
}: {
  evidence: Evidence[];
  themes: string[];
  kinds: string[];
  themeFacets?: { id: string; name: string; count: number }[];
  kindFacets?: { value: string; count: number }[];
}) {
  const { get, setFilter, clearAll } = useFilters();
  const [page, setPage] = useState(1);

  const search = get('search');
  const theme = get('theme') || 'all';
  const kind = get('kind') || 'all';

  const filtered = useMemo(() => {
    return evidence.filter((e) => {
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${e.title} ${e.text} ${e.actors.join(' ')} ${e.themes.join(' ')}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (theme !== 'all' && !e.themes.includes(theme)) return false;
      if (kind !== 'all' && e.kind !== kind) return false;
      return true;
    });
  }, [evidence, search, theme, kind]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(1, totalPages));
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Build faceted options with counts
  const themeOptions: FacetItem[] = themeFacets
    ? themeFacets.map((t) => ({ value: t.id || t.name, label: `${t.name} (${t.count})`, count: t.count }))
    : themes.map((t) => ({ value: t, label: t, count: 0 }));

  const kindOptions: FacetItem[] = kindFacets
    ? kindFacets.map((k) => ({ value: k.value, label: `${k.value} (${k.count})`, count: k.count }))
    : kinds.map((k) => ({ value: k, label: k, count: 0 }));

  return (
    <div className="space-y-4 p-6">
      <FilterBar
        search={search}
        onSearchChange={(v) => { setFilter('search', v); setPage(1); }}
        filters={[
          {
            name: 'Themes',
            value: theme,
            options: themeOptions,
            onChange: (v: string) => { setFilter('theme', v === 'all' ? '' : v); setPage(1); },
          },
          {
            name: 'Kind',
            value: kind,
            options: kindOptions,
            onChange: (v: string) => { setFilter('kind', v === 'all' ? '' : v); setPage(1); },
          },
        ]}
        onClearAll={() => { clearAll(); setPage(1); }}
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage(Math.max(1, safePage - 1))}
            disabled={safePage === 1}
          >
            Previous
          </Button>
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
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage(Math.min(totalPages, safePage + 1))}
            disabled={safePage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
