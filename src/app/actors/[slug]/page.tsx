import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getProfileBySlug,
  getProfiles,
  getEvidence,
  getContradictions,
  getStatements,
  getActorEvidence,
  getActorContradictions,
  getActorStatements,
} from '@/lib/data';
import { PageHeader } from '@/components/ui/page-header';
import { EvidenceCard } from '@/components/cards/evidence-card';
import { ContradictionCard } from '@/components/cards/contradiction-card';
import { MetricCard } from '@/components/ui/metric-card';
import { cn, partyColor, partyBgColor, formatDate } from '@/lib/utils';

export async function generateStaticParams() {
  const profiles = await getProfiles();
  return profiles.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfileBySlug(slug);
  if (!profile) {
    return { title: 'Actor Not Found — Apatheia Observatory' };
  }
  return {
    title: `${profile.name} — Apatheia Observatory`,
    description: profile.summary ?? `${profile.name} — tracked actor in the Iran war rhetoric observatory.`,
  };
}

function BiasSpectrum({ rating }: { rating: number }) {
  const pct = ((rating + 1) / 2) * 100;
  const labels = ['Far Left', 'Left', 'Center-Left', 'Center', 'Center-Right', 'Right', 'Far Right'];
  const closest = Math.round((rating + 1) * 3);
  return (
    <div className="rounded-lg border border-line bg-bg-tertiary p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-text-faint mb-3">
        Bias Position
      </p>
      <div className="relative h-3 w-full rounded-full bg-gradient-to-r from-status-info via-charcoal-500 to-copper overflow-visible">
        <div
          className="absolute -top-1 h-5 w-5 rounded-full border-2 border-gold bg-bg-primary shadow-lg"
          style={{ left: `calc(${pct}% - 10px)` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[9px] text-text-faint">
        {labels.map((l, i) => (
          <span key={l} className={cn(i === closest ? 'text-gold font-medium' : '')}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

function ReliabilityBar({ score }: { score: number }) {
  const pct = score * 100;
  const color =
    score >= 0.75
      ? 'bg-status-success'
      : score >= 0.5
        ? 'bg-gold'
        : 'bg-copper';
  return (
    <div className="rounded-lg border border-line bg-bg-tertiary p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-text-faint">
          Reliability
        </p>
        <span className="text-sm font-semibold text-text-primary">
          {Math.round(pct)}%
        </span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-charcoal-800 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StanceIndicator({ stance }: { stance: string }) {
  const config: Record<string, { color: string; label: string; desc: string }> = {
    hawk: { color: 'text-copper', label: 'Hawk', desc: 'Supports military action / intervention' },
    dove: { color: 'text-status-info', label: 'Dove', desc: 'Opposes military action / favors diplomacy' },
    moderate: { color: 'text-steel', label: 'Moderate', desc: 'Cautious, conditional support for action' },
    mixed: { color: 'text-gold', label: 'Mixed', desc: 'Inconsistent or evolving signals' },
    evolving: { color: 'text-bronze', label: 'Evolving', desc: 'Position has shifted over time' },
    unknown: { color: 'text-text-faint', label: 'Unknown', desc: 'No clear public position' },
  };
  const c = config[stance] ?? config.unknown;
  return (
    <div className="rounded-lg border border-line bg-bg-tertiary p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-text-faint">
        Iran Stance
      </p>
      <p className={cn('mt-1 text-lg font-semibold', c.color)}>{c.label}</p>
      <p className="mt-0.5 text-xs text-text-muted">{c.desc}</p>
    </div>
  );
}

export default async function ActorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getProfileBySlug(slug);
  if (!profile) notFound();

  const [allEvidence, allContradictions, allStatements] = await Promise.all([
    getEvidence(),
    getContradictions(),
    getStatements(),
  ]);

  const evidence = getActorEvidence(allEvidence, profile.name);
  const contradictions = getActorContradictions(allContradictions, profile.name);
  const statements = getActorStatements(allStatements, profile.name);

  const isPolitician = profile.type === 'politician';
  const isMedia = profile.type === 'outlet' || profile.type === 'journalist';

  return (
    <div>
      <PageHeader title={profile.name} description={profile.positioning} />

      <div className="space-y-8 p-6">
        {/* ─── Header ──────────────────────────────────── */}
        <div className="flex items-start gap-6">
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold shrink-0',
              isPolitician
                ? 'bg-gradient-to-br from-gold/30 to-bronze/10 text-gold'
                : profile.type === 'outlet'
                  ? 'bg-gradient-to-br from-steel/30 to-gunmetal/10 text-steel'
                  : 'bg-gradient-to-br from-bronze/30 to-copper/10 text-bronze'
            )}
          >
            {profile.type === 'outlet'
              ? profile.name.slice(0, 2).toUpperCase()
              : profile.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-charcoal-800 px-2 py-0.5 text-[10px] font-medium text-text-faint uppercase">
                {profile.type}
              </span>
              {profile.party && (
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-medium',
                    partyBgColor(profile.party),
                    partyColor(profile.party)
                  )}
                >
                  {profile.party}
                </span>
              )}
              {profile.role && (
                <span className="text-xs text-text-faint">{profile.role}</span>
              )}
              {profile.state && (
                <span className="text-xs text-text-faint">· {profile.state}</span>
              )}
              {profile.outlet && (
                <span className="text-xs text-text-faint">· {profile.outlet}</span>
              )}
              {profile.chamber && (
                <span className="text-xs text-text-faint">· {profile.chamber}</span>
              )}
            </div>
            {profile.bio && (
              <p className="mt-2 text-sm text-text-muted leading-relaxed">
                {profile.bio}
              </p>
            )}
            {profile.summary && profile.summary !== profile.bio && (
              <p className="mt-1 text-sm text-text-primary italic">
                &ldquo;{profile.summary}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* ─── Metrics row ─────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            label="Evidence Items"
            value={profile.evidence_count || evidence.length}
            accent="steel"
          />
          <MetricCard
            label={isPolitician ? 'Quotes' : 'Articles'}
            value={profile.quote_count}
            accent="gold"
          />
          <MetricCard
            label="Contradictions"
            value={contradictions.length || profile.linked_contradictions?.length || 0}
            accent="copper"
          />
          <MetricCard
            label="Themes"
            value={profile.dominant_themes?.length || 0}
            accent="bronze"
          />
        </div>

        {/* ─── Stance + Bias/Reliability (media) ──────── */}
        <div className={cn('grid gap-4', isMedia ? 'lg:grid-cols-3' : 'lg:grid-cols-1')}>
          {profile.stance_on_iran && (
            <StanceIndicator stance={profile.stance_on_iran} />
          )}
          {isMedia && profile.bias_rating !== undefined && (
            <BiasSpectrum rating={profile.bias_rating} />
          )}
          {isMedia && profile.reliability_score > 0 && (
            <ReliabilityBar score={profile.reliability_score} />
          )}
        </div>

        {/* ─── Committees (politicians) ───────────────── */}
        {isPolitician && profile.key_committees?.length > 0 && (
          <div className="rounded-lg border border-line bg-bg-elevated p-4">
            <h3 className="text-xs font-medium uppercase tracking-wider text-text-faint">
              Key Committees
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.key_committees.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-status-info/10 px-3 py-1 text-xs text-status-info"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ─── Signals & Watchpoints ──────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {profile.signals?.length > 0 && (
            <div className="rounded-lg border border-line bg-bg-elevated p-4">
              <h3 className="text-xs font-medium uppercase tracking-wider text-gold">
                {isMedia ? 'Editorial Signals' : 'Rhetorical Signals'}
              </h3>
              <ul className="mt-2 space-y-1.5">
                {profile.signals.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                    <span className="mt-1 text-gold text-[8px]">◆</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {profile.watchpoints?.length > 0 && (
            <div className="rounded-lg border border-line bg-bg-elevated p-4">
              <h3 className="text-xs font-medium uppercase tracking-wider text-copper">
                Watchpoints
              </h3>
              <ul className="mt-2 space-y-1.5">
                {profile.watchpoints.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                    <span className="mt-1 text-copper text-[8px]">◆</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ─── Position Phases (politicians) ──────────── */}
        {profile.phases?.length > 0 && (
          <div className="rounded-lg border border-line bg-bg-elevated p-5">
            <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-text-faint">
              Position Timeline
            </h3>
            <div className="relative space-y-0">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-gold via-bronze to-steel" />
              {profile.phases.map((phase, i) => (
                <div key={i} className="relative flex gap-4 pb-5">
                  <div className="relative z-10 mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-gold/60 bg-bg-primary" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-text-faint">
                        {formatDate(phase.date)}
                      </p>
                      <span className="rounded bg-charcoal-800 px-1.5 py-0.5 text-[10px] text-text-faint">
                        {phase.stance}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-text-primary">
                      {phase.label}
                    </h4>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {phase.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Tags ──────────────────────────────────── */}
        {profile.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-charcoal-800 px-2.5 py-1 text-[10px] text-text-faint"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* ─── Themes ────────────────────────────────── */}
        {profile.dominant_themes?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profile.dominant_themes.map((t) => (
              <span
                key={t}
                className="rounded-full bg-gold/10 px-3 py-1 text-xs text-gold"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* ─── Statements ─────────────────────────────── */}
        {statements.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-text-faint">
              Recorded Statements ({statements.length})
            </h3>
            <div className="space-y-3">
              {statements.map((s) => (
                <div
                  key={s.id}
                  className="rounded-lg border border-line bg-bg-elevated p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-text-faint">
                      {formatDate(s.date)}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-medium',
                        s.stance === 'hawk'
                          ? 'bg-copper/20 text-copper'
                          : s.stance === 'dove'
                            ? 'bg-status-info/20 text-status-info'
                            : 'bg-steel/20 text-steel'
                      )}
                    >
                      {s.stance}
                    </span>
                  </div>
                  <blockquote className="text-sm text-text-primary leading-relaxed border-l-2 border-gold/30 pl-3">
                    {s.text}
                  </blockquote>
                  <p className="mt-2 text-xs text-text-faint italic">
                    {s.context} — {s.source}
                  </p>
                  {s.significance && (
                    <div className="mt-2 rounded bg-bg-tertiary p-2.5">
                      <p className="text-xs font-medium text-gold">Significance</p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {s.significance}
                      </p>
                    </div>
                  )}
                  {s.media_reception && (
                    <div className="mt-2 rounded bg-bg-tertiary p-2.5">
                      <p className="text-xs font-medium text-copper">
                        Media Reception
                      </p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {s.media_reception}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Contradictions ────────────────────────── */}
        {contradictions.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-text-faint">
              Contradictions ({contradictions.length})
            </h3>
            <div className="space-y-3">
              {contradictions.map((c) => (
                <ContradictionCard key={c.id} contradiction={c} />
              ))}
            </div>
          </div>
        )}

        {/* ─── Evidence ──────────────────────────────── */}
        {evidence.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-text-faint">
              Evidence ({evidence.length})
            </h3>
            <div className="grid gap-3 lg:grid-cols-2">
              {evidence.slice(0, 20).map((e, i) => (
                <EvidenceCard key={e.id ?? i} evidence={e} />
              ))}
            </div>
            {evidence.length > 20 && (
              <p className="mt-4 text-center text-xs text-text-faint">
                Showing 20 of {evidence.length} items
              </p>
            )}
          </div>
        )}

        {/* ─── Empty state for non-prototype actors ─── */}
        {evidence.length === 0 && contradictions.length === 0 && (
          <div className="rounded-lg border border-line bg-bg-elevated p-8 text-center">
            <p className="text-sm text-text-muted">
              No evidence or contradictions tracked yet for {profile.name}.
            </p>
            <p className="mt-1 text-xs text-text-faint">
              Evidence will appear here once live news ingestion is active (Phase 2).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
