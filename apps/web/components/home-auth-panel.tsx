import { getCurrentUser } from '@/lib/session';
import { HomeAuthPanelClient } from '@/components/home-auth-panel-client';

export async function HomeAuthPanel() {
  const result = await getCurrentUser();
  return (
    <HomeAuthPanelClient
      user={result.status === 'authenticated' ? result.user : null}
      unavailable={result.status === 'unavailable'}
    />
  );
}
