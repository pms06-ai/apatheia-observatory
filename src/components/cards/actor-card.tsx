import Link from 'next/link';
import { cn, partyColor, partyBgColor } from '@/lib/utils';
import { User, Newspaper, Pen } from 'lucide-react';
import type { Profile } from '@/types';

const typeIcons: Record<string, typeof User> = {
  politician: User,
  outlet: Newspaper,
  journalist: Pen,
};

const stanceColors: Record<string, string> = {
  hawk: 'bg-copper/20 text-copper',
  dove: 'bg-status-info/20 text-status-info',
  moderate: 'bg-steel/20 text-steel',
  mixed: 'bg-gold/20 text-gold',
  evolving: 'bg-bronze/20 text-bronze',
  unknown: 'bg-charcoal-700/30 text-text-faint',
};

function BiasBar({ rating }: { rating: number }) {
  const pct = ((rating + 1) / 2) * 100;
  return (
    <div className="relative mt-2 h-1.5 w-full rounded-full bg-charcoal-800 overflow-hidden">
      <div
        className="absolute top-0 h-full w-1 rounded-full bg-gold"
        style={{ left: `calc(${pct}% - 2px)` }}
      />
      <div className="absolute left-1/2 top-0 h-full w-px bg-charcoal-600" />
    </div>
  );
}

export function ActorCard({ profile }: { profile: Profile }) {
  const Icon = typeIcons[profile.type] ?? User;

  return (
    <Link
      href={`/actors/${profile.id}`}
      className="group flex flex-col rounded-lg border border-line bg-bg-elevated p-4 transition-all duration-200 hover:border-gold/30 hover:translate-y-[-1px] hover:shadow-lg"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold shrink-0',
            profile.type === 'politician'
              ? 'bg-gradient-to-br from-gold/20 to-bronze/10 text-gold'
              : profile.type === 'outlet'
                ? 'bg-gradient-to-br from-steel/20 to-gunmetal/10 text-steel'
                : 'bg-gradient-to-br from-bronze/20 to-copper/10 text-bronze'
          )}
        >
          {profile.type === 'outlet'
            ? profile.name.slice(0, 2).toUpperCase()
            : profile.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-text-primary group-hover:text-gold transition-colors truncate">
            {profile.name}
          </h3>
          <p className="text-xs text-text-faint truncate">
            {profile.role}
            {profile.state && ` · ${profile.state}`}
            {profile.outlet && ` · ${profile.outlet}`}
          </p>
        </div>
        <Icon className="h-3.5 w-3.5 text-text-faint shrink-0" />
      </div>

      {/* Badges */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {profile.party && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-medium',
              partyBgColor(profile.party),
              partyColor(profile.party)
            )}
          >
            {profile.party}
          </span>
        )}
        {profile.stance_on_iran && profile.stance_on_iran !== 'unknown' && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-medium',
              stanceColors[profile.stance_on_iran] ?? stanceColors.unknown
            )}
          >
            {profile.stance_on_iran}
          </span>
        )}
        {profile.type !== 'politician' && profile.bias_rating !== 0 && (
          <span className="text-[10px] text-text-faint">
            bias: {profile.bias_rating > 0 ? '+' : ''}
            {profile.bias_rating.toFixed(1)}
          </span>
        )}
      </div>

      {/* Summary */}
      {profile.summary && (
        <p className="mt-2 text-xs text-text-muted line-clamp-2">
          {profile.summary}
        </p>
      )}

      {/* Bias bar for media */}
      {profile.type !== 'politician' && profile.bias_rating !== undefined && (
        <div className="mt-1">
          <BiasBar rating={profile.bias_rating} />
          <div className="mt-0.5 flex justify-between text-[8px] text-text-faint">
            <span>L</span>
            <span>C</span>
            <span>R</span>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="mt-auto pt-3 flex items-center gap-3 text-xs text-text-faint">
        {profile.evidence_count > 0 && (
          <span>
            <strong className="text-steel">{profile.evidence_count}</strong> evidence
          </span>
        )}
        {profile.type !== 'politician' && profile.reliability_score > 0 && (
          <span>
            reliability: <strong className="text-status-success">{Math.round(profile.reliability_score * 100)}%</strong>
          </span>
        )}
        {profile.linked_contradictions?.length > 0 && (
          <span>
            <strong className="text-copper">{profile.linked_contradictions.length}</strong> contradictions
          </span>
        )}
      </div>

      {/* Themes — capped at 2 */}
      {profile.dominant_themes?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {profile.dominant_themes.slice(0, 2).map((t) => (
            <span
              key={t}
              className="rounded bg-charcoal-800 px-1.5 py-0.5 text-[10px] text-text-faint"
            >
              {t}
            </span>
          ))}
          {profile.dominant_themes.length > 2 && (
            <span className="text-[10px] text-text-faint">
              +{profile.dominant_themes.length - 2}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
