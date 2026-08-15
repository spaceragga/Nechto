import { getCurrentUser } from '@/lib/session';
import { HomeAuthPanelClient } from '@/components/home-auth-panel-client';

export async function HomeAuthPanel() {
  const user = await getCurrentUser();
  return <HomeAuthPanelClient user={user} />;
}
