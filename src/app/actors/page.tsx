import type { Metadata } from 'next';
import { getProfiles } from '@/lib/data';
import { PageHeader } from '@/components/ui/page-header';
import { ActorsGrid } from './actors-grid';

export const metadata: Metadata = {
  title: 'Actors — Apatheia Observatory',
  description: 'Profiles of politicians, media outlets, and journalists tracked in the Iran war rhetoric observatory.',
};

export default async function ActorsPage() {
  const profiles = await getProfiles();

  const politicians = profiles.filter((p) => p.type === 'politician');
  const outlets = profiles.filter((p) => p.type === 'outlet');
  const journalists = profiles.filter((p) => p.type === 'journalist');

  return (
    <div>
      <PageHeader
        title="Actors"
        description={`${politicians.length} officials · ${outlets.length} media outlets · ${journalists.length} journalists`}
      />
      <ActorsGrid
        politicians={politicians}
        outlets={outlets}
        journalists={journalists}
      />
    </div>
  );
}
