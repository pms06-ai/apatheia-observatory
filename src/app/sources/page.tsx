import type { Metadata } from 'next';
import { getDocuments, getActors } from '@/lib/data';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = {
  title: 'Sources — Apatheia Observatory',
  description: 'Source document register and actor directory powering the observatory\'s evidence base.',
};

export default async function SourcesPage() {
  const [documents, actors] = await Promise.all([
    getDocuments(),
    getActors(),
  ]);

  return (
    <div>
      <PageHeader
        title="Sources"
        description={`${documents.length} source documents and ${actors.length} tracked actors`}
      />

      <div className="space-y-8 p-6">
        {/* Document Register */}
        <div>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-text-faint">
            Document Register
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-text-faint">
                  <th className="pb-2 pr-4 font-medium">Title</th>
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 pr-4 font-medium text-right">Words</th>
                  <th className="pb-2 pr-4 font-medium text-right">Sections</th>
                  <th className="pb-2 pr-4 font-medium text-right">Quotes</th>
                  <th className="pb-2 font-medium">Themes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-bg-elevated transition-colors">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-text-primary">
                        {doc.title}
                      </p>
                      <p className="text-xs text-text-faint">{doc.label}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded bg-charcoal-800 px-1.5 py-0.5 text-xs text-text-faint">
                        {doc.type}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right text-text-muted">
                      {doc.word_count.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-right text-text-muted">
                      {doc.section_count}
                    </td>
                    <td className="py-3 pr-4 text-right text-text-muted">
                      {doc.quote_count}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {doc.themes.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="rounded bg-gold/10 px-1.5 py-0.5 text-[10px] text-gold"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actor Directory */}
        <div>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-text-faint">
            Actor Directory
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-text-faint">
                  <th className="pb-2 pr-4 font-medium">Name</th>
                  <th className="pb-2 pr-4 font-medium text-right">Evidence</th>
                  <th className="pb-2 font-medium">Dominant Themes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {actors
                  .sort((a, b) => b.evidence_count - a.evidence_count)
                  .map((actor) => (
                    <tr
                      key={actor.name}
                      className="hover:bg-bg-elevated transition-colors"
                    >
                      <td className="py-2 pr-4 font-medium text-text-primary">
                        {actor.name}
                      </td>
                      <td className="py-2 pr-4 text-right text-steel">
                        {actor.evidence_count}
                      </td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-1">
                          {actor.dominant_themes.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="rounded bg-charcoal-800 px-1.5 py-0.5 text-[10px] text-text-faint"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
