import type { Metadata } from 'next';
import { getExplainers } from '@/lib/data';
import { PageHeader } from '@/components/ui/page-header';
import { ExplainerGrid } from './explainer-grid';

export const metadata: Metadata = {
  title: 'Explainers — Apatheia Observatory',
  description: 'Definitive reference entries on legal frameworks, military concepts, nuclear policy, and media rhetoric tactics.',
};

export default async function ExplainersPage() {
  const explainers = await getExplainers();

  const categories = Array.from(new Set(explainers.map((e) => e.category)));

  return (
    <div>
      <PageHeader
        title="Explainers"
        description={`${explainers.length} definitive reference entries — the foundational knowledge to understand what you're reading`}
      />
      <ExplainerGrid explainers={explainers} categories={categories} />
    </div>
  );
}
