'use client';

import { useState, useMemo } from 'react';
import { ContradictionCard } from '@/components/cards/contradiction-card';
import { FilterBar } from '@/components/ui/filter-bar';
import type { Contradiction } from '@/types';

export function ContradictionFilters({
  contradictions,
  themes,
}: {
  contradictions: Contradiction[];
  themes: string[];
}) {
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('all');
  const [theme, setTheme] = useState('all');
  const [type, setType] = useState('all');

  const filtered = useMemo(() => {
    return contradictions.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${c.title} ${c.actor} ${c.counterparty ?? ''} ${c.summary} ${c.tension}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (severity !== 'all' && c.severity !== severity) return false;
      if (theme !== 'all' && !c.themes.includes(theme)) return false;
      if (type !== 'all' && c.type !== type) return false;
      return true;
    });
  }, [contradictions, search, severity, theme, type]);

  const types = Array.from(new Set(contradictions.map((c) => c.type)));

  return (
    <div className="space-y-4 p-6">
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        filters={[
          {
            name: 'Severity',
            value: severity,
            options: [
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ],
            onChange: setSeverity,
          },
          {
            name: 'Themes',
            value: theme,
            options: themes.map((t) => ({ value: t, label: t })),
            onChange: setTheme,
          },
          {
            name: 'Type',
            value: type,
            options: types.map((t) => ({ value: t, label: t })),
            onChange: setType,
          },
        ]}
      />

      <p className="text-xs text-text-faint">
        {filtered.length} of {contradictions.length} contradictions
      </p>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-text-faint">
            No contradictions match your filters.
          </div>
        )}
        {filtered.map((c) => (
          <ContradictionCard key={c.id} contradiction={c} />
        ))}
      </div>
    </div>
  );
}
