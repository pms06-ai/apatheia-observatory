'use client';

import { useState, useMemo } from 'react';
import { ActorCard } from '@/components/cards/actor-card';
import type { Profile } from '@/types';
import { cn } from '@/lib/utils';
import { LayoutGrid, User, Newspaper, Pen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type TabKey = 'all' | 'politicians' | 'outlets' | 'journalists';

const tabs: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: 'all', label: 'All', icon: LayoutGrid },
  { key: 'politicians', label: 'Officials', icon: User },
  { key: 'outlets', label: 'Outlets', icon: Newspaper },
  { key: 'journalists', label: 'Journalists', icon: Pen },
];

const stanceOptions = ['all', 'hawk', 'dove', 'moderate', 'mixed', 'evolving'];
const partyOptions = ['all', 'Democrat', 'Republican', 'Independent'];
const chamberOptions = ['all', 'Senate', 'House', 'Executive', 'Media'];

export function ActorsGrid({
  politicians,
  outlets,
  journalists,
}: {
  politicians: Profile[];
  outlets: Profile[];
  journalists: Profile[];
}) {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [search, setSearch] = useState('');
  const [stance, setStance] = useState('all');
  const [party, setParty] = useState('all');
  const [chamber, setChamber] = useState('all');
  const [sort, setSort] = useState<'name' | 'evidence' | 'bias'>('evidence');

  const allProfiles = useMemo(
    () => [...politicians, ...outlets, ...journalists],
    [politicians, outlets, journalists]
  );

  const filtered = useMemo(() => {
    let pool: Profile[];
    switch (activeTab) {
      case 'politicians':
        pool = politicians;
        break;
      case 'outlets':
        pool = outlets;
        break;
      case 'journalists':
        pool = journalists;
        break;
      default:
        pool = allProfiles;
    }

    return pool
      .filter((p) => {
        if (search) {
          const q = search.toLowerCase();
          const haystack = `${p.name} ${p.role ?? ''} ${p.summary ?? ''} ${p.bio ?? ''} ${p.outlet ?? ''} ${p.tags?.join(' ') ?? ''}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        if (stance !== 'all' && p.stance_on_iran !== stance) return false;
        if (party !== 'all' && p.party !== party) return false;
        if (chamber !== 'all' && p.chamber !== chamber) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === 'name') return a.name.localeCompare(b.name);
        if (sort === 'evidence') return b.evidence_count - a.evidence_count;
        if (sort === 'bias') return Math.abs(b.bias_rating) - Math.abs(a.bias_rating);
        return 0;
      });
  }, [allProfiles, politicians, outlets, journalists, activeTab, search, stance, party, chamber, sort]);

  return (
    <div className="p-6 space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-line pb-3" role="tablist" aria-label="Actor types">
        {tabs.map((tab) => {
          const count =
            tab.key === 'all'
              ? allProfiles.length
              : tab.key === 'politicians'
                ? politicians.length
                : tab.key === 'outlets'
                  ? outlets.length
                  : journalists.length;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors',
                activeTab === tab.key
                  ? 'bg-gold/10 text-gold'
                  : 'text-text-muted hover:bg-charcoal-850 hover:text-text-primary'
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              <span className="text-[10px] text-text-faint">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search actors…"
          aria-label="Search actors"
          className="rounded-md border border-line bg-bg-elevated px-3 py-1.5 text-sm text-text-primary placeholder:text-text-faint outline-none focus:border-gold/40 transition-colors w-52"
        />

        {(activeTab === 'all' || activeTab === 'politicians') && (
          <>
            <select
              value={party}
              onChange={(e) => setParty(e.target.value)}
              aria-label="Filter by party"
              className="rounded-md border border-line bg-bg-elevated px-3 py-1.5 text-sm text-text-muted outline-none focus:border-gold/40"
            >
              {partyOptions.map((o) => (
                <option key={o} value={o}>
                  {o === 'all' ? 'All Parties' : o}
                </option>
              ))}
            </select>
            <select
              value={chamber}
              onChange={(e) => setChamber(e.target.value)}
              aria-label="Filter by chamber"
              className="rounded-md border border-line bg-bg-elevated px-3 py-1.5 text-sm text-text-muted outline-none focus:border-gold/40"
            >
              {chamberOptions.map((o) => (
                <option key={o} value={o}>
                  {o === 'all' ? 'All Chambers' : o}
                </option>
              ))}
            </select>
          </>
        )}

        <select
          value={stance}
          onChange={(e) => setStance(e.target.value)}
          aria-label="Filter by stance"
          className="rounded-md border border-line bg-bg-elevated px-3 py-1.5 text-sm text-text-muted outline-none focus:border-gold/40"
        >
          {stanceOptions.map((o) => (
            <option key={o} value={o}>
              {o === 'all' ? 'All Stances' : o.charAt(0).toUpperCase() + o.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'name' | 'evidence' | 'bias')}
          aria-label="Sort by"
          className="rounded-md border border-line bg-bg-elevated px-3 py-1.5 text-sm text-text-muted outline-none focus:border-gold/40"
        >
          <option value="evidence">Sort: Evidence</option>
          <option value="name">Sort: Name</option>
          <option value="bias">Sort: Bias</option>
        </select>
      </div>

      {/* Count */}
      <p className="text-xs text-text-faint">
        {filtered.length} results
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-text-faint">
          No actors match your filters.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((profile) => (
            <ActorCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
}
