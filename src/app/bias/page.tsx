import type { Metadata } from 'next';
import { getProfiles } from '@/lib/data';
import { PageHeader } from '@/components/ui/page-header';
import { BiasScatterChart } from './bias-chart';

export const metadata: Metadata = {
  title: 'Bias Spectrum — Apatheia Observatory',
  description: 'Interactive bias visualization mapping media outlets and journalists by political lean and reliability.',
};

export default async function BiasPage() {
  const profiles = await getProfiles();

  // Filter to media actors with non-zero bias or reliability ratings
  const mediaActors = profiles
    .filter(
      (p) =>
        (p.type === 'outlet' || p.type === 'journalist') &&
        (p.bias_rating !== 0 || p.reliability_score > 0),
    )
    .map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      biasRating: p.bias_rating,
      reliabilityScore: p.reliability_score,
    }));

  // Also include politicians with their stance mapped to a pseudo-bias
  const politicianData = profiles
    .filter((p) => p.type === 'politician' && p.party)
    .map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type as string,
      party: p.party,
      stance: p.stance_on_iran,
    }));

  return (
    <div>
      <PageHeader
        title="Bias Spectrum"
        description={`${mediaActors.length} media actors mapped by bias rating and reliability · ${politicianData.length} officials by party`}
      />

      <div className="space-y-8 p-6">
        {/* Media bias scatter */}
        {mediaActors.length > 0 ? (
          <div className="rounded-lg border border-line bg-bg-elevated p-5">
            <h2 className="mb-4 font-serif text-base font-semibold text-text-faint">
              Media Bias vs Reliability
            </h2>
            <p className="mb-4 text-xs text-text-muted">
              Each dot represents a media outlet or journalist. X-axis = political lean (-1 far left to +1 far right).
              Y-axis = reliability score (0 to 1).
            </p>
            <BiasScatterChart data={mediaActors} />
          </div>
        ) : (
          <div className="rounded-lg border border-line bg-bg-elevated p-5">
            <p className="text-sm text-text-muted">
              No media bias data available yet. Media outlets and journalists will appear here once bias ratings are assigned.
            </p>
          </div>
        )}

        {/* Party distribution */}
        <div className="rounded-lg border border-line bg-bg-elevated p-5">
          <h2 className="mb-4 font-serif text-base font-semibold text-text-faint">
            Officials by Party
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(
              politicianData.reduce<Record<string, typeof politicianData>>(
                (acc, p) => {
                  const party = p.party || 'Unknown';
                  if (!acc[party]) acc[party] = [];
                  acc[party].push(p);
                  return acc;
                },
                {},
              ),
            ).map(([party, members]) => (
              <div key={party} className="rounded-lg border border-line bg-bg-tertiary p-4">
                <h3 className="text-xs font-medium uppercase tracking-wider text-text-faint">
                  {party}
                </h3>
                <p className="mt-1 text-2xl font-semibold text-text-primary">
                  {members.length}
                </p>
                <div className="mt-2 space-y-1">
                  {members.slice(0, 5).map((m) => (
                    <p key={m.id} className="text-xs text-text-muted truncate">
                      {m.name}
                    </p>
                  ))}
                  {members.length > 5 && (
                    <p className="text-xs text-text-faint">+{members.length - 5} more</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
