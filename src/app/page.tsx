import type { Metadata } from 'next';
import Link from 'next/link';
import { getDashboardPageData } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Dashboard — Apatheia Observatory',
  description: 'Overview of political rhetoric tracking: key metrics, theme distribution, party coverage, and escalation timeline.',
};
import { MetricCard } from '@/components/ui/metric-card';
import { TimelineCard } from '@/components/cards/timeline-card';
import { ThemeChart } from '@/components/charts/theme-chart';
import { PartyChart } from '@/components/charts/party-chart';
import { ChartErrorBoundary } from '@/components/charts/chart-error-boundary';
import { ContradictionCard } from '@/components/cards/contradiction-card';
import { RhetoricTrendsChart } from '@/components/charts/rhetoric-trends';

export default async function DashboardPage() {
  const data = await getDashboardPageData();

  const { manifest, topInsights, timeline, themeDistribution, partySummary, topContradictions, mostContradictoryActors, rhetoricTrends } = data;

  const themeChartData = themeDistribution.map((t) => ({ name: t.name, count: t.count }));

  const parties = partySummary.map((p) => ({
    party: p.party,
    actors: p.actorCount,
    evidence: p.evidenceCount,
  }));

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-semibold text-text-primary">
          Political Rhetoric Observatory
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Iran War 2026 — Tracking {manifest.actorCount} actors across{' '}
          {manifest.themeCount} analytical themes
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Evidence Items"
          value={manifest.evidenceCount}
          detail={`From ${manifest.documentCount} source documents`}
          accent="gold"
        />
        <MetricCard
          label="Actors Tracked"
          value={manifest.actorCount}
          detail={`Across ${partySummary.length} affiliations`}
          accent="steel"
        />
        <MetricCard
          label="Themes"
          value={manifest.themeCount}
          detail="Analytical lenses"
          accent="bronze"
        />
        <MetricCard
          label="Contradictions"
          value={manifest.contradictionCount}
          detail={`${manifest.highSeverityCount} high severity`}
          accent="copper"
        />
      </div>

      {/* Insights */}
      <div className="rounded-lg border border-gold/20 bg-bg-elevated p-5">
        <h2 className="font-serif text-base font-semibold text-gold">
          Key Insights
        </h2>
        <div className="mt-3 space-y-3">
          {topInsights.slice(0, 3).map((insight, i) => (
            <div key={i}>
              <h3 className="text-sm font-medium text-text-primary">
                {insight.title}
              </h3>
              <p className="mt-0.5 text-xs text-text-muted">{insight.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rhetoric Trends */}
      {rhetoricTrends.length > 0 && (
        <div className="rounded-lg border border-line bg-bg-elevated p-5">
          <h2 className="mb-4 font-serif text-base font-semibold text-text-faint">
            Rhetoric Trends
          </h2>
          <ChartErrorBoundary>
            <RhetoricTrendsChart data={rhetoricTrends} />
          </ChartErrorBoundary>
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-line bg-bg-elevated p-5">
          <h2 className="mb-4 font-serif text-base font-semibold text-text-faint">
            Theme Distribution
          </h2>
          <ChartErrorBoundary>
            <ThemeChart data={themeChartData} />
          </ChartErrorBoundary>
        </div>
        <div className="rounded-lg border border-line bg-bg-elevated p-5">
          <h2 className="mb-4 font-serif text-base font-semibold text-text-faint">
            Party Coverage
          </h2>
          <ChartErrorBoundary>
            <PartyChart data={parties} />
          </ChartErrorBoundary>
        </div>
      </div>

      {/* Contradiction Leaderboard + Timeline */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Most Contradictory Actors */}
        {mostContradictoryActors.length > 0 && (
          <div className="rounded-lg border border-line bg-bg-elevated p-5">
            <h2 className="mb-4 font-serif text-base font-semibold text-text-faint">
              Most Contradictory Actors
            </h2>
            <div className="space-y-2">
              {mostContradictoryActors.slice(0, 8).map((a, i) => (
                <Link
                  key={a.id}
                  href={`/actors/${a.id}`}
                  className="flex items-center justify-between rounded-md px-3 py-2 transition-colors hover:bg-bg-tertiary"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-right text-xs font-medium text-text-faint">
                      {i + 1}
                    </span>
                    <span className="text-sm text-text-primary">{a.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-faint">
                    <span>
                      <strong className="text-copper">{a.contradictionCount}</strong> contradictions
                    </span>
                    <span>
                      <strong className="text-steel">{a.evidenceCount}</strong> evidence
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="rounded-lg border border-line bg-bg-elevated p-5">
          <h2 className="mb-4 font-serif text-base font-semibold text-text-faint">
            Escalation Timeline
          </h2>
          <TimelineCard events={timeline} />
        </div>
      </div>

      {/* Top Contradictions */}
      {topContradictions.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-serif text-base font-semibold text-text-faint">
            High-Severity Contradictions
          </h2>
          {topContradictions.map((c) => (
            <ContradictionCard key={c.id} contradiction={c} />
          ))}
        </div>
      )}
    </div>
  );
}
