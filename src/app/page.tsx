import type { Metadata } from 'next';
import { getDashboard, getThemes, getParties, getContradictions, getProfiles } from '@/lib/data';

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

export default async function DashboardPage() {
  const [dashboard, themes, parties, contradictions, profiles] = await Promise.all([
    getDashboard(),
    getThemes(),
    getParties(),
    getContradictions(),
    getProfiles(),
  ]);

  const politicians = profiles.filter((p) => p.type === 'politician');
  const outlets = profiles.filter((p) => p.type === 'outlet');
  const journalists = profiles.filter((p) => p.type === 'journalist');

  const { manifest, top_insights, timeline } = dashboard;

  const themeChartData = themes
    .map((t) => ({ name: t.name, count: t.evidence_count }))
    .sort((a, b) => b.count - a.count);

  const topContradictions = contradictions
    .filter((c) => c.severity === 'high')
    .slice(0, 3);

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-semibold text-text-primary">
          Political Rhetoric Observatory
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Iran War 2026 — Tracking {manifest.actor_count} actors across{' '}
          {manifest.theme_count} analytical themes
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Evidence Items"
          value={manifest.evidence_count}
          detail={`From ${manifest.document_count} source documents`}
          accent="gold"
        />
        <MetricCard
          label="Actors Tracked"
          value={profiles.length}
          detail={`${politicians.length} officials · ${outlets.length} outlets · ${journalists.length} journalists`}
          accent="steel"
        />
        <MetricCard
          label="Themes"
          value={manifest.theme_count}
          detail="Analytical lenses"
          accent="bronze"
        />
        <MetricCard
          label="Contradictions"
          value={contradictions.length}
          detail={`${contradictions.filter((c) => c.severity === 'high').length} high severity`}
          accent="copper"
        />
      </div>

      {/* Insights */}
      <div className="rounded-lg border border-gold/20 bg-bg-elevated p-5">
        <h2 className="text-sm font-medium uppercase tracking-wider text-gold">
          Key Insights
        </h2>
        <div className="mt-3 space-y-3">
          {top_insights.slice(0, 3).map((insight, i) => (
            <div key={i}>
              <h3 className="text-sm font-medium text-text-primary">
                {insight.title}
              </h3>
              <p className="mt-0.5 text-xs text-text-muted">{insight.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts + Timeline */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Theme Distribution */}
        <div className="rounded-lg border border-line bg-bg-elevated p-5">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-text-faint">
            Theme Distribution
          </h2>
          <ChartErrorBoundary>
            <ThemeChart data={themeChartData} />
          </ChartErrorBoundary>
        </div>

        {/* Party Coverage */}
        <div className="rounded-lg border border-line bg-bg-elevated p-5">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-text-faint">
            Party Coverage
          </h2>
          <ChartErrorBoundary>
            <PartyChart data={parties} />
          </ChartErrorBoundary>
        </div>
      </div>

      {/* Timeline + Contradictions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Timeline */}
        <div className="rounded-lg border border-line bg-bg-elevated p-5">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-text-faint">
            Escalation Timeline
          </h2>
          <TimelineCard events={timeline} />
        </div>

        {/* Top Contradictions */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-text-faint">
            High-Severity Contradictions
          </h2>
          {topContradictions.map((c) => (
            <ContradictionCard key={c.id} contradiction={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
