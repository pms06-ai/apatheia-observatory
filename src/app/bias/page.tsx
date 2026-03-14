import { PageHeader } from '@/components/ui/page-header';

export default function BiasPage() {
  return (
    <div>
      <PageHeader
        title="Bias Spectrum"
        description="Interactive bias visualization — coming in Phase 2 with live news ingestion"
      />
      <div className="flex items-center justify-center p-16">
        <div className="rounded-lg border border-line bg-bg-elevated p-8 text-center max-w-md">
          <div className="text-4xl text-gold mb-4">⟷</div>
          <h2 className="text-lg font-serif font-semibold text-text-primary">
            Phase 2: News Ingestion
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            The bias spectrum will plot sources left-to-right by bias rating
            once live article ingestion is active. Source ratings from AllSides
            and Ad Fontes Media will provide the baseline.
          </p>
          <div className="mt-6 flex justify-center gap-1">
            {['Far Left', 'Left', 'Center-Left', 'Center', 'Center-Right', 'Right', 'Far Right'].map(
              (label, i) => (
                <div key={label} className="flex flex-col items-center">
                  <div
                    className="h-8 w-8 rounded-sm"
                    style={{
                      backgroundColor: `hsl(${210 - i * 30}, 40%, ${35 + i * 5}%)`,
                      opacity: 0.6,
                    }}
                  />
                  <span className="mt-1 text-[8px] text-text-faint">
                    {label}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
