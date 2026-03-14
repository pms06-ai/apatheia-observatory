'use client';

import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Tags,
  FileText,
  GitCompareArrows,
  Frame,
  Library,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SearchDoc {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  href: string;
  searchable: string;
}

const sections = [
  { name: 'Overview', href: '/' },
  { name: 'Actors', href: '/actors' },
  { name: 'Themes', href: '/themes' },
  { name: 'Accountability', href: '/accountability' },
  { name: 'Contradictions', href: '/contradictions' },
  { name: 'Evidence', href: '/evidence' },
  { name: 'Explainers', href: '/explainers' },
  { name: 'Framing', href: '/framing' },
  { name: 'Sources', href: '/sources' },
  { name: 'Bias Spectrum', href: '/bias' },
  { name: 'Blind Spots', href: '/blind-spots' },
];

const typeIcons: Record<string, LucideIcon> = {
  actor: Users,
  theme: Tags,
  explainer: BookOpen,
  contradiction: GitCompareArrows,
  document: Library,
  framing: Frame,
  evidence: FileText,
};

const typeLabels: Record<string, string> = {
  actor: 'Actor',
  theme: 'Theme',
  explainer: 'Explainer',
  contradiction: 'Contradiction',
  document: 'Document',
  framing: 'Framing',
  evidence: 'Evidence',
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState<SearchDoc[] | null>(null);
  const [fuse, setFuse] = useState<Fuse<SearchDoc> | null>(null);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Load search index on first open
  useEffect(() => {
    if (open && !searchIndex) {
      fetch('/api/search-index')
        .then((r) => r.json())
        .then((data: SearchDoc[]) => {
          setSearchIndex(data);
          setFuse(new Fuse(data, {
            keys: ['title', 'subtitle', 'searchable'],
            threshold: 0.4,
            includeScore: true,
          }));
        })
        .catch(() => {
          setSearchIndex([]);
        });
    }
  }, [open, searchIndex]);

  const results = useMemo(() => {
    if (!query || !fuse) return [];
    return fuse.search(query, { limit: 20 }).map((r) => r.item);
  }, [query, fuse]);

  // Group results by type
  const grouped = useMemo(() => {
    const groups: Record<string, SearchDoc[]> = {};
    for (const r of results) {
      if (!groups[r.type]) groups[r.type] = [];
      groups[r.type].push(r);
    }
    return groups;
  }, [results]);

  const navigate = (href: string) => {
    router.push(href);
    setOpen(false);
    setQuery('');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <Command
        className="relative w-full max-w-lg rounded-lg border border-line bg-bg-secondary shadow-2xl"
        label="Command palette"
        shouldFilter={!query} // Let Fuse handle filtering when there's a query
      >
        <Command.Input
          placeholder="Search actors, themes, explainers, contradictions…"
          value={query}
          onValueChange={setQuery}
          className="w-full border-b border-line bg-transparent px-4 py-3 text-sm text-text-primary placeholder:text-text-faint outline-none"
        />
        <Command.List className="max-h-72 overflow-y-auto p-2">
          <Command.Empty className="px-4 py-6 text-center text-sm text-text-faint">
            {searchIndex ? 'No results found.' : 'Loading search index...'}
          </Command.Empty>

          {/* Show sections when no query */}
          {!query && (
            <Command.Group
              heading={
                <span className="flex items-center gap-1.5 text-xs text-text-faint">
                  <LayoutDashboard className="h-3 w-3" /> Sections
                </span>
              }
              className="mb-2"
            >
              {sections.map((s) => (
                <Command.Item
                  key={s.href}
                  value={s.name}
                  onSelect={() => navigate(s.href)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-text-muted data-[selected=true]:bg-gold/10 data-[selected=true]:text-gold"
                >
                  {s.name}
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {/* Show fuzzy search results when query exists */}
          {query && Object.entries(grouped).map(([type, items]) => {
            const Icon = typeIcons[type] || FileText;
            return (
              <Command.Group
                key={type}
                heading={
                  <span className="flex items-center gap-1.5 text-xs text-text-faint">
                    <Icon className="h-3 w-3" /> {typeLabels[type] || type}
                  </span>
                }
                className="mb-2"
              >
                {items.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={item.title}
                    onSelect={() => navigate(item.href)}
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-text-muted data-[selected=true]:bg-gold/10 data-[selected=true]:text-gold"
                  >
                    <span className="truncate">{item.title}</span>
                    <span className="shrink-0 text-[10px] text-text-faint">
                      {item.subtitle}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            );
          })}
        </Command.List>
      </Command>
    </div>
  );
}
