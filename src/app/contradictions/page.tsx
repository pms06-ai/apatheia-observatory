import type { Metadata } from 'next';
import { getContradictions } from '@/lib/data';
import { PageHeader } from '@/components/ui/page-header';
import { ContradictionFilters } from './filters';

export const metadata: Metadata = {
  title: 'Contradictions — Apatheia Observatory',
  description: 'Tracked contradictions in political rhetoric on Iran — flip-flops, double standards, and inter-party tensions.',
};

export default async function ContradictionsPage() {
  const contradictions = await getContradictions();

  // Extract unique themes for filter
  const allThemes = Array.from(
    new Set(contradictions.flatMap((c) => c.themes))
  ).sort();

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
