import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getThemes, getThemePageData } from '@/lib/data';
import { PageHeader } from '@/components/ui/page-header';
import { EvidenceCard } from '@/components/cards/evidence-card';
import { ContradictionCard } from '@/components/cards/contradiction-card';
import { MetricCard } from '@/components/ui/metric-card';
import { BackToTop } from '@/components/ui/back-to-top';
import { formatDate } from '@/lib/utils';

export async function generateStaticParams() {
  const themes = await getThemes();
  return themes.map((t) => ({ slug: t.id ?? '' }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getThemePageData(slug);
  if (!data) {
    return { title: 'Theme Not Found — Apatheia Observatory' };
  }
  return {
    title: `${data.theme.name} — Apatheia Observatory`,
    description: `Evidence, actors, and contradictions related to the "${data.theme.name}" analytical theme.`,
  };
}

export default async function ThemeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getThemePageData(slug);
  if (!data) notFound();

  const { theme, evidence, actors, contradictions, statements, relatedThemes } = data;

  return (
    <div>
      <PageHeader title={theme.name} description={theme.description || 'Analytical theme'} />

      <div className="space-y-8 p-6">
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard label="Evidence Items" value={evidence.length} accent="gold" />
          <MetricCard label="Actors" value={actors.length} accent="steel" />
          <MetricCard label="Contradictions" value={contradictions.length} accent="copper" />
          <MetricCard label="Statements" value={statements.length} accent="bronze" />
        </div>

        {/* Top Actors */}
        {actors.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-text-faint">
              Actors ({actors.length})
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {actors.slice(0, 12).map((a) => (
                <Link
                  key={a.id}
                  href={`/actors/${a.id}`}
                  className="flex items-center justify-between rounded-lg border border-line bg-bg-elevated p-3 transition-colors hover:border-gold/30"
                >
                  <span className="text-sm font-medium text-text-primary">{a.name}</span>
                  <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs text-gold">
                    {a.evidenceCount}
                  </span>
                </Link>
              ))}
            </div>
            {actors.length > 12 && (
              <p className="mt-2 text-center text-xs text-text-faint">
                + {actors.length - 12} more actors
              </p>
            )}
          </div>
        )}

        {/* Related Themes */}
        {relatedThemes.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-text-faint">
              Related Themes
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedThemes.map((rt) => (
                <Link
                  key={rt.id}
                  href={`/themes/${rt.id}`}
                  className="rounded-full bg-gold/10 px-3 py-1 text-xs text-gold transition-colors hover:bg-gold/20"
                >
                  {rt.name} ({rt.overlap})
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Contradictions */}
        {contradictions.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-text-faint">
              Contradictions ({contradictions.length})
            </h2>
            <div className="space-y-3">
              {contradictions.map((c) => (
                <ContradictionCard key={c.id} contradiction={c} />
              ))}
            </div>
          </div>
        )}

        {/* Statements */}
        {statements.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-text-faint">
              Statements ({statements.length})
            </h2>
            <div className="space-y-3">
              {statements.slice(0, 10).map((s) => (
                <div
                  key={s.id}
                  className="rounded-lg border border-line bg-bg-elevated p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-text-faint">{formatDate(s.date)}</span>
                    <Link
                      href={`/actors/${s.actor_id}`}
                      className="text-xs font-medium text-gold hover:underline"
                    >
                      {(s as unknown as { actor?: string }).actor || s.actor_id}
                    </Link>
                  </div>
                  <blockquote className="text-sm text-text-primary leading-relaxed border-l-2 border-gold/30 pl-3">
                    {s.text}
                  </blockquote>
                </div>
              ))}
              {statements.length > 10 && (
                <p className="text-center text-xs text-text-faint">
                  Showing 10 of {statements.length} statements
                </p>
              )}
            </div>
          </div>
        )}

        {/* Evidence */}
        {evidence.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-text-faint">
              Evidence ({evidence.length})
            </h2>
            <div className="grid gap-3 lg:grid-cols-2">
              {evidence.slice(0, 20).map((e, i) => (
                <EvidenceCard key={e.id ?? i} evidence={e} />
              ))}
            </div>
            {evidence.length > 20 && (
              <p className="mt-4 text-center text-xs text-text-faint">
                Showing 20 of {evidence.length} items
              </p>
            )}
          </div>
        )}
      </div>

      <BackToTop />
    </div>
  );
}
