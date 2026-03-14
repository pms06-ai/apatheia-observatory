import type { Metadata } from 'next';
import { getContradictions, getThemes } from '@/lib/data';
import { PageHeader } from '@/components/ui/page-header';
import { ContradictionFilters } from './filters';

export const metadata: Metadata = {
  title: 'Contradictions — Apatheia Observatory',
  description: 'Tracked contradictions in political rhetoric on Iran — flip-flops, double standards, and inter-party tensions.',
};

export default async function ContradictionsPage() {
  const [contradictions, themes] = await Promise.all([
    getContradictions(),
    getThemes(),
  ]);
  const themeNameMap = new Map(themes.map((t) => [t.id ?? '', t.name]));

  // Extract unique themes for filter, showing display names
  const allThemeIds = Array.from(new Set(contradictions.flatMap((c) => c.themes)));
  const allThemes = allThemeIds
    .map((id) => themeNameMap.get(id) || id)
    .sort();

  return (
    <div>
      <PageHeader
        title="Contradiction Ledger"
        description={`${contradictions.length} contradictions tracked across political actors`}
      />
      <ContradictionFilters
        contradictions={contradictions}
        themes={allThemes}
      />
    </div>
  );
}
