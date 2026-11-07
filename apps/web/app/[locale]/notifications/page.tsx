import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { NotificationsPageClient } from '@/components/notifications/notifications-page-client';
import { createServerApiClient } from '@/lib/api-server';
import { getCurrentUser } from '@/lib/session';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NotificationsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getCurrentUser();
  if (session.status !== 'authenticated') {
    redirect({ href: '/login', locale });
  }

  const t = await getTranslations('Notifications');
  const api = await createServerApiClient();
  const list = await api.listNotifications().catch(() => ({
    items: [],
    unreadCount: 0,
  }));

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12">
      <header>
        <h1 className="font-serif text-4xl tracking-wide">{t('title')}</h1>
        <p className="mt-3 text-sm opacity-70">{t('lede')}</p>
      </header>
      <NotificationsPageClient
        initial={list}
        labels={{
          empty: t('empty'),
          markAll: t('markAllRead'),
          kinds: {
            work_liked: t('kindLiked'),
            profile_followed: t('kindFollowed'),
            work_commented: t('kindCommented'),
            project_liked: t('kindProjectLiked'),
            project_commented: t('kindProjectCommented'),
            article_liked: t('kindArticleLiked'),
            article_commented: t('kindArticleCommented'),
            dialogue_liked: t('kindDialogueLiked'),
            dialogue_commented: t('kindDialogueCommented'),
          },
        }}
      />
    </main>
  );
}
