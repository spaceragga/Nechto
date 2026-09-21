import { getCurrentUser, loadMyProfile } from '@/lib/session';
import { HomeAuthPanelClient } from '@/components/home-auth-panel-client';

export async function HomeAuthPanel() {
  const result = await getCurrentUser();
  const mine = result.status === 'authenticated' ? await loadMyProfile() : null;
  const vitrineSlug =
    mine?.ok && mine.profile.slug && mine.profile.publishedAt
      ? mine.profile.slug
      : null;

  return (
    <HomeAuthPanelClient
      user={result.status === 'authenticated' ? result.user : null}
      vitrineSlug={vitrineSlug}
      unavailable={result.status === 'unavailable'}
    />
  );
}
