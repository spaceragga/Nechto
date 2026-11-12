import type { ReactNode } from 'react';
import { FollowButton } from '@/components/social/follow-button';
import { ChipLink } from '@/components/ui/chip-link';
import { WorkFrame } from '@/components/ui/work-frame';
import { Link } from '@/i18n/navigation';

export type CommunityPerson = {
  slug: string;
  href: string;
  name: string;
  bio: string;
  src: string | null;
  directions: string;
  isOwn: boolean;
  following: boolean;
};

type CommunityTab = 'people' | 'following';

type CommunityFeedProps = {
  title: string;
  lede: string;
  tabsLabel: string;
  peopleTab: string;
  followingTab: string;
  tab: CommunityTab;
  directionsLabel: string;
  empty: string;
  emptyHref?: string | null;
  more?: string;
  nextHref?: string | null;
  signedIn: boolean;
  people: CommunityPerson[];
};

export function CommunityFeed({
  title,
  lede,
  tabsLabel,
  peopleTab,
  followingTab,
  tab,
  directionsLabel,
  empty,
  emptyHref,
  more,
  nextHref,
  signedIn,
  people,
}: CommunityFeedProps) {
  return (
    <main className="flex w-full flex-col gap-12 px-6 py-12">
      <header>
        <h1 className="font-serif text-4xl tracking-wide">{title}</h1>
        <p className="mt-3 max-w-2xl font-sans text-sm opacity-70">{lede}</p>
        <nav aria-label={tabsLabel} className="mt-6 flex flex-wrap gap-2">
          <ChipLink href="/community" active={tab === 'people'}>
            {peopleTab}
          </ChipLink>
          <ChipLink
            href="/community?tab=following"
            active={tab === 'following'}
          >
            {followingTab}
          </ChipLink>
        </nav>
      </header>
      {people.length === 0 ? (
        <EmptyNote href={emptyHref}>{empty}</EmptyNote>
      ) : (
        <section className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {people.map((person) => (
            <article key={person.slug} className="min-w-0">
              <Link href={person.href} className="block min-w-0">
                <WorkFrame
                  src={person.src}
                  alt={person.name}
                  fit="cover"
                  className="aspect-3/4 w-full"
                />
                <h2 className="mt-1.5 font-serif text-sm leading-tight">
                  {person.name}
                </h2>
                {person.directions ? (
                  <p className="mt-0.5 font-sans text-xs leading-snug">
                    {directionsLabel} {person.directions}
                  </p>
                ) : null}
                {person.bio ? (
                  <p className="mt-0.5 line-clamp-2 font-sans text-xs leading-snug opacity-70">
                    {person.bio}
                  </p>
                ) : null}
              </Link>
              <FollowButton
                slug={person.slug}
                signedIn={signedIn}
                isOwn={person.isOwn}
                compact
                initialFollowing={person.following}
              />
            </article>
          ))}
        </section>
      )}
      {nextHref && more ? (
        <Link href={nextHref} className="font-sans text-sm">
          {more}
        </Link>
      ) : null}
    </main>
  );
}

function EmptyNote({
  href,
  children,
}: {
  href?: string | null;
  children: ReactNode;
}) {
  if (!href) {
    return <p className="text-sm opacity-70">{children}</p>;
  }
  return (
    <p className="text-sm opacity-70">
      <Link
        href={href}
        className="cursor-pointer text-[var(--accent)] no-underline"
      >
        {children}
      </Link>
    </p>
  );
}
