import type { Metadata } from 'next';
import { getStatements, getProfiles } from '@/lib/data';
import { PageHeader } from '@/components/ui/page-header';
import { StatementFeed } from './statement-feed';

export const metadata: Metadata = {
  title: 'Accountability Ledger — Apatheia Observatory',
  description: 'Verified statements from officials and media figures on Iran, with stances, themes, and media reception.',
};

export default async function AccountabilityPage() {
  const [statements] = await Promise.all([
    getStatements(),
    getProfiles(),
  ]);

  const actors = Array.from(new Set(statements.map((s) => s.actor))).sort();
  const themes = Array.from(new Set(statements.flatMap((s) => s.themes))).sort();
  const stances = Array.from(new Set(statements.map((s) => s.stance)));

  return (
    <div>
      <PageHeader
        title="Accountability Ledger"
        description={`${statements.length} verified statements — what they said, what they omitted, and what the media did with it`}
      />
      <StatementFeed
        statements={statements}
        actors={actors}
        themes={themes}
        stances={stances}
      />
    </div>
  );
}
