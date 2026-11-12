import type { PublicProfile } from '@nechto/api-contract';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CommunityFeed } from '@/components/community/community-feed';
import { excerpt } from '@/lib/excerpt';
import {
  loadCommunityPeople,
  loadFollowedSlugs,
  loadMyFollowing,
} from '@/lib/load-published-feed';
import { getCurrentUser, loadMyProfile } from '@/lib/session';
import { toUploadSrc } from '@/lib/to-upload-src';
import { profilePath } from '@/lib/work-path';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ cursor?: string; tab?: string }>;
};

function communityHref(query: {
  tab?: 'following';
  cursor?: string | null;
}): string {
  const params = new URLSearchParams();
  if (query.tab === 'following') {
    params.set('tab', 'following');
  }
  if (query.cursor) {
    params.set('cursor', query.cursor);
  }
  const serialized = params.toString();
  return serialized ? `/community?${serialized}` : '/community';
}

export default async function CommunityFeedPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const tab = query.tab === 'following' ? 'following' : 'people';
  const t = await getTranslations('CommunityFeed');
  const tCreators = await getTranslations('Creators');
  const tProfile = await getTranslations('PublicProfile');
  const session = await getCurrentUser();
  const signedIn = session.status === 'authenticated';
  const mine = signedIn ? await loadMyProfile() : null;
  const viewerSlug = mine?.ok ? mine.profile.slug : null;

  const page =
    tab === 'following'
      ? signedIn
        ? await loadMyFollowing({ cursor: query.cursor, limit: 20 })
        : { items: [], nextCursor: null }
      : await loadCommunityPeople({ cursor: query.cursor, limit: 20 });

  const slugs = page.items.flatMap((item) => (item.slug ? [item.slug] : []));
  const followed =
    tab === 'following'
      ? new Set(slugs)
      : signedIn
        ? await loadFollowedSlugs(slugs)
        : new Set<string>();

  const guestFollowing = tab === 'following' && !signedIn;

  return (
    <CommunityFeed
      title={t('title')}
      lede={t('lede')}
      tabsLabel={t('tabsLabel')}
      peopleTab={t('peopleTab')}
      followingTab={t('followingTab')}
      tab={tab}
      directionsLabel={tProfile('directionsLabel')}
      empty={
        guestFollowing
          ? t('signInFollowing')
          : tab === 'following'
            ? t('emptyFollowing')
            : t('empty')
      }
      emptyHref={guestFollowing ? '/login' : null}
      more={t('more')}
      nextHref={
        page.nextCursor
          ? communityHref({
              tab: tab === 'following' ? 'following' : undefined,
              cursor: page.nextCursor,
            })
          : null
      }
      signedIn={signedIn}
      people={page.items.flatMap((profile) =>
        toPerson(profile, {
          directionName: (direction) => tCreators(`directions.${direction}`),
          viewerSlug,
          followed,
        }),
      )}
    />
  );
}

function toPerson(
  profile: PublicProfile,
  context: {
    directionName: (direction: PublicProfile['directions'][number]) => string;
    viewerSlug: string | null;
    followed: Set<string>;
  },
) {
  if (!profile.slug) {
    return [];
  }
  const directions = profile.directions
    .map((direction) => context.directionName(direction))
    .join(' · ');
  return [
    {
      slug: profile.slug,
      href: profilePath(profile.slug),
      name: profile.displayName ?? profile.slug,
      bio: excerpt(profile.bio, 80),
      src: toUploadSrc(profile.avatarUrl),
      directions,
      isOwn: Boolean(context.viewerSlug && context.viewerSlug === profile.slug),
      following: context.followed.has(profile.slug),
    },
  ];
}
