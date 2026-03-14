import type { Metadata } from 'next';
import { getEvidence, getThemes } from '@/lib/data';
import { PageHeader } from '@/components/ui/page-header';
import { EvidenceBrowser } from './browser';

export const metadata: Metadata = {
  title: 'Evidence Browser — Apatheia Observatory',
  description: 'Browse and filter evidence items extracted from source documents on the Iran war debate.',
};

export default async function EvidencePage() {
  const [evidence, themes] = await Promise.all([getEvidence(), getThemes()]);

  const themeNames = themes.map((t) => t.name);
  const kinds = Array.from(new Set(evidence.map((e) => e.kind)));

  return (
    <div>
      <PageHeader
        title="Evidence Browser"
        description={`${evidence.length} evidence items across ${themeNames.length} themes`}
      />
      <EvidenceBrowser
        evidence={evidence}
        themes={themeNames}
        kinds={kinds}
      />
    </div>
  );
}
