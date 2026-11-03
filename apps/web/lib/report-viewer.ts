import { getCurrentUser, loadMyProfile } from '@/lib/session';

export async function loadReportViewer() {
  const session = await getCurrentUser();
  const mine =
    session.status === 'authenticated'
      ? await loadMyProfile()
      : { ok: false as const, status: null };

  return {
    viewerEmail:
      session.status === 'authenticated' ? session.user.email : undefined,
    viewerSlug: mine.ok ? (mine.profile.slug ?? null) : null,
  };
}
