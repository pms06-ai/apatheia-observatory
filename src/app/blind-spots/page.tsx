import type { Metadata } from 'next';
import Link from 'next/link';
import fs from 'fs/promises';
import path from 'path';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = {
  title: 'Coverage Blind Spots — Apatheia Observatory',
  description: 'Identify which themes are covered by which political factions — and which are ignored.',
};

interface ThemeCoverageEntry {
  themeId: string;
  themeName: string;
  actors: { id: string; name: string; count: number; party: string | null }[];
}

async function getThemeCoverage(): Promise<ThemeCoverageEntry[]> {
  const raw = await fs.readFile(
    path.join(process.cwd(), 'data', 'generated', 'aggregations', 'theme-coverage.json'),
    'utf-8',
  );
  return JSON.parse(raw);
}

function groupByParty(actors: ThemeCoverageEntry['actors']) {
  const groups: Record<string, { count: number; actors: string[] }> = {};
  for (const a of actors) {
    const party = a.party || 'Unknown';
    if (!groups[party]) groups[party] = { count: 0, actors: [] };
    groups[party].count += a.count;
    groups[party].actors.push(a.name);
  }
  return groups;
}

export default async function BlindSpotsPage() {
  const coverage = await getThemeCoverage();

  // Identify themes with one-sided coverage
  const analyzed = coverage.map((t) => {
    const groups = groupByParty(t.actors);
    const totalEvidence = t.actors.reduce((sum, a) => sum + a.count, 0);
    const demCount = groups['Democrat']?.count || 0;
    const repCount = groups['Republican']?.count || 0;
    const totalPartisan = demCount + repCount;
    const demPct = totalPartisan > 0 ? Math.round((demCount / totalPartisan) * 100) : 0;
    const repPct = totalPartisan > 0 ? Math.round((repCount / totalPartisan) * 100) : 0;

    let skew: 'balanced' | 'left-heavy' | 'right-heavy' | 'left-only' | 'right-only' = 'balanced';
    if (repCount === 0 && demCount > 0) skew = 'left-only';
    else if (demCount === 0 && repCount > 0) skew = 'right-only';
    else if (demPct > 80) skew = 'left-heavy';
    else if (repPct > 80) skew = 'right-heavy';

    return {
      ...t,
      groups,
      totalEvidence,
      demPct,
      repPct,
      skew,
    };
  }).sort((a, b) => {
    // Show most skewed first
    const skewOrder = { 'left-only': 0, 'right-only': 0, 'left-heavy': 1, 'right-heavy': 1, balanced: 2 };
    return (skewOrder[a.skew] ?? 2) - (skewOrder[b.skew] ?? 2) || b.totalEvidence - a.totalEvidence;
  });

  const blindSpots = analyzed.filter((t) => t.skew !== 'balanced');
  const balanced = analyzed.filter((t) => t.skew === 'balanced');

  return (
    <div>
      <PageHeader
        title="Coverage Blind Spots"
        description={`${blindSpots.length} themes with one-sided coverage out of ${coverage.length} total`}
      />

      <div className="space-y-8 p-6">
        {/* Blind spots */}
        {blindSpots.length > 0 && (
          <div>
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-copper">
              One-Sided Coverage
            </h2>
            <div className="space-y-3">
              {blindSpots.map((t) => (
                <div key={t.themeId} className="rounded-lg border border-line bg-bg-elevated p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        href={`/themes/${t.themeId}`}
                        className="font-medium text-text-primary hover:text-gold transition-colors"
                      >
                        {t.themeName}
                      </Link>
                      <p className="mt-0.5 text-xs text-text-faint">
                        {t.totalEvidence} evidence items ·{' '}
                        <span className={t.skew.includes('left') ? 'text-status-info' : 'text-copper'}>
                          {t.skew === 'left-only'
                            ? 'Covered only by Democrats'
                            : t.skew === 'right-only'
                              ? 'Covered only by Republicans'
                              : t.skew === 'left-heavy'
                                ? `${t.demPct}% Democrat`
                                : `${t.repPct}% Republican`}
                        </span>
                      </p>
                    </div>
                  </div>
                  {/* Coverage bar */}
                  <div className="mt-3 flex h-3 overflow-hidden rounded-full">
                    {t.demPct > 0 && (
                      <div
                        className="bg-status-info transition-all"
                        style={{ width: `${t.demPct}%` }}
                      />
                    )}
                    {t.repPct > 0 && (
                      <div
                        className="bg-copper transition-all"
                        style={{ width: `${t.repPct}%` }}
                      />
                    )}
                    {100 - t.demPct - t.repPct > 0 && (
                      <div
                        className="bg-charcoal-700 transition-all"
                        style={{ width: `${100 - t.demPct - t.repPct}%` }}
                      />
                    )}
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-text-faint">
                    <span>D {t.demPct}%</span>
                    <span>R {t.repPct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Balanced themes */}
        {balanced.length > 0 && (
          <div>
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-status-success">
              Balanced Coverage
            </h2>
            <div className="space-y-3">
              {balanced.map((t) => (
                <div key={t.themeId} className="rounded-lg border border-line bg-bg-elevated p-4">
                  <div className="flex items-start justify-between gap-4">
                    <Link
                      href={`/themes/${t.themeId}`}
                      className="font-medium text-text-primary hover:text-gold transition-colors"
                    >
                      {t.themeName}
                    </Link>
                    <span className="text-xs text-text-faint">{t.totalEvidence} items</span>
                  </div>
                  <div className="mt-3 flex h-3 overflow-hidden rounded-full">
                    {t.demPct > 0 && (
                      <div className="bg-status-info" style={{ width: `${t.demPct}%` }} />
                    )}
                    {t.repPct > 0 && (
                      <div className="bg-copper" style={{ width: `${t.repPct}%` }} />
                    )}
                    {100 - t.demPct - t.repPct > 0 && (
                      <div className="bg-charcoal-700" style={{ width: `${100 - t.demPct - t.repPct}%` }} />
                    )}
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-text-faint">
                    <span>D {t.demPct}%</span>
                    <span>R {t.repPct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-text-faint">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-status-info" />
            <span>Democrat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-copper" />
            <span>Republican</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-charcoal-700" />
            <span>Independent / Foreign</span>
          </div>
        </div>
      </div>
    </div>
  );
}
