import type { Metadata } from 'next';
import { getFramingAnalysis } from '@/lib/data';
import { PageHeader } from '@/components/ui/page-header';
import { FramingFeed } from './framing-feed';

export const metadata: Metadata = {
  title: 'Media Framing — Apatheia Observatory',
  description: 'Documented cases of selective coverage, false equivalence, suppressed narratives, and double standards in Iran war reporting.',
};

export default async function FramingPage() {
  const analyses = await getFramingAnalysis();

  const categories = Array.from(new Set(analyses.map((a) => a.category)));

  return (
    <div>
      <PageHeader
        title="Media Framing Analysis"
        description={`${analyses.length} documented cases of selective coverage, false equivalence, suppressed narratives, and double standards`}
      />
      <FramingFeed analyses={analyses} categories={categories} />
    </div>
  );
}
