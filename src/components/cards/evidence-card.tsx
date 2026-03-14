import Link from 'next/link';
import { cn, truncate } from '@/lib/utils';
import type { Evidence } from '@/types';

type EnrichedEvidence = Evidence & {
  actor_names?: string[];
  theme_names?: string[];
};

const kindColors: Record<string, string> = {
  quote: 'text-gold border-gold/30',
  claim: 'text-copper border-copper/30',
  excerpt: 'text-steel border-steel/30',
  section: 'text-gunmetal border-gunmetal/30',
};

export function EvidenceCard({ evidence }: { evidence: EnrichedEvidence }) {
  const e = evidence;

  return (
    <div className="rounded-lg border border-line bg-bg-elevated p-4 transition-all duration-200 hover:border-line-strong hover:translate-y-[-1px] hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-text-primary">{e.title}</h3>
          {e.doc_title && (
            <p className="mt-1 text-xs text-text-faint">{e.doc_title}</p>
          )}
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase',
            kindColors[e.kind] ?? 'text-text-faint border-line'
          )}
        >
          {e.kind}
        </span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-text-muted">
        {truncate(e.text, 200)}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {e.actors?.slice(0, 3).map((a, i) => (
          <Link
            key={a}
            href={`/actors/${a}`}
            className="rounded bg-gold/10 px-1.5 py-0.5 text-[10px] text-gold hover:bg-gold/20 transition-colors"
          >
            {e.actor_names?.[i] || a}
          </Link>
        ))}
        {e.themes?.slice(0, 2).map((t, i) => (
          <Link
            key={t}
            href={`/themes/${t}`}
            className="rounded bg-charcoal-800 px-1.5 py-0.5 text-[10px] text-text-faint hover:bg-gold/10 hover:text-gold transition-colors"
          >
            {e.theme_names?.[i] || t}
          </Link>
        ))}
      </div>
    </div>
  );
}
