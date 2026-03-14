import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getEvidence, getThemes, getEvidenceFacets } from '@/lib/data';
import { PageHeader } from '@/components/ui/page-header';
import { EvidenceBrowser } from './browser';

export const metadata: Metadata = {
  title: 'Evidence Browser — Apatheia Observatory',
  description: 'Browse and filter evidence items extracted from source documents on the Iran war debate.',
};

export default async function EvidencePage() {
  const [evidence, themes, facets] = await Promise.all([
    getEvidence(),
    getThemes(),
    getEvidenceFacets(),
  ]);

  const themeNames = themes.map((t) => t.name);
  const kinds = Array.from(new Set(evidence.map((e) => e.kind)));

  return (
    <div>
      <PageHeader
        title="Evidence Browser"
        description={`${evidence.length} evidence items across ${themeNames.length} themes`}
      />
      <Suspense fallback={<div className="p-6 text-text-faint">Loading...</div>}>
        <EvidenceBrowser
          evidence={evidence}
          themes={themeNames}
          kinds={kinds}
          themeFacets={facets.themes}
          kindFacets={facets.kinds}
        />
      </Suspense>
    </div>
  );
}
