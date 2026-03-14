import { PageHeader } from '@/components/ui/page-header';

export default function StoryComparisonPage() {
  return (
    <div>
      <PageHeader
        title="Story Comparison"
        description="Side-by-side article comparison grouped by bias lean — coming in Phase 3"
      />
      <div className="flex items-center justify-center p-16">
        <div className="rounded-lg border border-line bg-bg-elevated p-8 text-center max-w-md">
          <div className="text-4xl text-bronze mb-4">◫</div>
          <h2 className="text-lg font-serif font-semibold text-text-primary">
            Phase 3: Story Comparison
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Each story cluster will show a synthesized neutral headline,
            side-by-side article cards grouped by bias lean, and framing
            analysis highlighting word choice differences.
          </p>
        </div>
      </div>
    </div>
  );
}
