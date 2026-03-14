import type { Metadata } from 'next';
import Link from 'next/link';
import { getThemes } from '@/lib/data';
import { getEvidenceFacets } from '@/lib/data';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = {
  title: 'Themes — Apatheia Observatory',
  description: 'Analytical themes and lenses used to categorize evidence in the Iran war rhetoric observatory.',
};

export default async function ThemesPage() {
  const [themes, facets] = await Promise.all([getThemes(), getEvidenceFacets()]);

  // Build a map of theme evidence counts from facets
  const countMap = new Map(facets.themes.map((t) => [t.id, t.count]));

  // Sort themes by evidence count
  const sorted = [...themes].sort(
    (a, b) => (countMap.get(b.id ?? '') ?? b.evidence_count) - (countMap.get(a.id ?? '') ?? a.evidence_count),
  );

  return (
    <div>
      <PageHeader
        title="Analytical Themes"
        description={`${themes.length} themes — the lenses through which we track rhetoric, contradiction, and coverage`}
      />

      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((theme) => {
          const count = countMap.get(theme.id ?? '') ?? theme.evidence_count;
          const slug = theme.id ?? '';

          return (
            <Link
              key={slug}
              href={`/themes/${slug}`}
              className="group rounded-lg border border-line bg-bg-elevated p-5 transition-colors hover:border-gold/30"
            >
              <h3 className="font-serif text-base font-semibold text-text-primary group-hover:text-gold transition-colors">
                {theme.name}
              </h3>
              <div className="mt-2 flex items-center gap-3">
                <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
                  {count} evidence
                </span>
              </div>
              {theme.description && (
                <p className="mt-2 text-xs text-text-muted line-clamp-2">
                  {theme.description}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
