import { PageHeader } from '@/components/ui/page-header';

export default function BlindSpotsPage() {
  return (
    <div>
      <PageHeader
        title="Coverage Blind Spots"
        description="Detect what stories each side of the spectrum ignores — coming in Phase 3"
      />
      <div className="flex items-center justify-center p-16">
        <div className="rounded-lg border border-line bg-bg-elevated p-8 text-center max-w-md">
          <div className="text-4xl text-steel mb-4">◌</div>
          <h2 className="text-lg font-serif font-semibold text-text-primary">
            Phase 3: Coverage Analysis
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Two-column display showing stories covered by left-leaning sources
            but ignored by right-leaning sources, and vice versa. Requires
            story clustering from Phase 2.
          </p>
        </div>
      </div>
    </div>
  );
}
