import { getTranslations } from 'next-intl/server';
import { HomeCollectionSpot } from '@/components/home/home-collection-spot';
import { HomeDialogueSpot } from '@/components/home/home-dialogue-spot';
import { HomeFeatured } from '@/components/home/home-featured';
import { HomeFreshSpot } from '@/components/home/home-fresh-spot';
import { HomeJournalSpot } from '@/components/home/home-journal-spot';
import { HomeLookingSpot } from '@/components/home/home-looking-spot';
import { HomeNow } from '@/components/home/home-now';
import { HomeOpenCallSpot } from '@/components/home/home-open-call-spot';
import { HomeStudioSpot } from '@/components/home/home-studio-spot';
import type { HomeCredit } from '@/components/home/home-credits';
import { catalogHref } from '@/lib/catalog-query';
import { excerpt } from '@/lib/excerpt';
import { getCurrentUser } from '@/lib/session';
import { type HomeFeedSlices } from '@/lib/pick-home-feed';
import { toUploadSrc } from '@/lib/to-upload-src';
import {
  workPath,
  profilePath,
  projectPath,
  articlePath,
  dialoguePath,
} from '@/lib/work-path';

type HomeStageProps = {
  locale: string;
  feed: HomeFeedSlices;
};

function directionCredit(
  direction: string | undefined,
  label: (id: string) => string,
): HomeCredit | null {
  if (!direction) {
    return null;
  }
  return {
    label: label(direction),
    href: catalogHref('/works', { direction }),
  };
}

function credits(...items: Array<HomeCredit | null>): HomeCredit[] {
  return items.filter((item): item is HomeCredit => item !== null);
}

function authorCredits(
  author: {
    slug: string;
    displayName: string;
    directions: readonly string[];
  },
  label: (id: string) => string,
): HomeCredit[] {
  return credits(
    { label: author.displayName, href: profilePath(author.slug) },
    directionCredit(author.directions[0], label),
  );
}

function formatFreshTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

export async function HomeStage({ locale, feed }: HomeStageProps) {
  const t = await getTranslations('HomePage');
  const tCreators = await getTranslations('Creators');
  const pending = t('pending');
  const session = await getCurrentUser();
  const openCallHref =
    session.status === 'authenticated' ? '/profile' : '/register';

  const billboardHref = feed.billboard
    ? workPath(feed.billboard.author.slug, feed.billboard.id)
    : null;
  const creatorHref = feed.creatorOfWeek
    ? profilePath(feed.creatorOfWeek.slug)
    : null;
  const journalHref = feed.journal ? articlePath(feed.journal.id) : '/journal';
  const directionLabel = (id: string) => tCreators(`directions.${id}`);
  const billboardCredits = feed.billboard
    ? authorCredits(feed.billboard.author, directionLabel)
    : [];
  const creatorCredits = credits(
    directionCredit(feed.creatorOfWeek?.directions[0], directionLabel),
  );
  const journalCredits = feed.journal
    ? authorCredits(feed.journal.author, directionLabel)
    : [];
  const seriesCredits = feed.series
    ? authorCredits(feed.series.author, directionLabel)
    : [];
  const studioCredits = feed.studio
    ? credits(
        feed.studio.studioTitle && feed.studio.displayName
          ? {
              label: feed.studio.displayName,
              href: profilePath(feed.studio.slug),
            }
          : null,
        directionCredit(feed.studio.directions[0], directionLabel),
      )
    : [];

  return (
    <section aria-label={t('growthSpotsLabel')} className="flex flex-col gap-4">
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-25">
          <div className="flex flex-col gap-8">
            <HomeFeatured
              href={billboardHref}
              src={
                feed.billboard
                  ? toUploadSrc(feed.billboard.imageUrl)
                  : undefined
              }
              kicker={t('billboardKicker')}
              title={feed.billboard?.title ?? t('pendingTitle')}
              credits={billboardCredits}
              meta={feed.billboard ? undefined : pending}
              cta={t('billboardCta')}
              fit="cover"
              frameClassName="h-[26rem] w-full md:h-[32rem]"
              spot="billboard"
            />
            <HomeFeatured
              href={creatorHref}
              src={
                feed.creatorOfWeek
                  ? toUploadSrc(feed.creatorOfWeek.avatarUrl)
                  : undefined
              }
              kicker={t('creatorKicker')}
              title={
                feed.creatorOfWeek?.displayName ??
                feed.creatorOfWeek?.slug ??
                t('pendingTitle')
              }
              titleHref={creatorHref}
              credits={creatorCredits}
              meta={feed.creatorOfWeek ? undefined : pending}
              cta={t('creatorCta')}
              align="center"
              spot="creator-week"
            />
          </div>
          <HomeDialogueSpot
            kicker={t('dialogueSpot.kicker')}
            title={feed.dialogue?.title ?? t('dialogueSpot.title')}
            lede={
              feed.dialogue?.note
                ? excerpt(feed.dialogue.note, 140)
                : feed.dialogue
                  ? t('dialogueSpot.ledeLive', {
                      left: feed.dialogue.left.author.displayName,
                      right: feed.dialogue.right.author.displayName,
                    })
                  : t('dialogueSpot.lede')
            }
            left={{
              title: feed.dialogue?.left.title ?? t('dialogueSpot.leftTitle'),
              meta: feed.dialogue ? undefined : t('dialogueSpot.leftMeta'),
              src: feed.dialogue
                ? toUploadSrc(feed.dialogue.left.imageUrl)
                : undefined,
              workHref: feed.dialogue
                ? workPath(
                    feed.dialogue.left.author.slug,
                    feed.dialogue.left.id,
                  )
                : null,
              credits: feed.dialogue
                ? authorCredits(feed.dialogue.left.author, directionLabel)
                : [],
            }}
            right={{
              title: feed.dialogue?.right.title ?? t('dialogueSpot.rightTitle'),
              meta: feed.dialogue ? undefined : t('dialogueSpot.rightMeta'),
              src: feed.dialogue
                ? toUploadSrc(feed.dialogue.right.imageUrl)
                : undefined,
              workHref: feed.dialogue
                ? workPath(
                    feed.dialogue.right.author.slug,
                    feed.dialogue.right.id,
                  )
                : null,
              credits: feed.dialogue
                ? authorCredits(feed.dialogue.right.author, directionLabel)
                : [],
            }}
            href={
              feed.dialogue?.id
                ? dialoguePath(feed.dialogue.id)
                : feed.dialogue
                  ? '/dialogue'
                  : null
            }
            cta={t('dialogueSpot.cta')}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-25">
          <HomeJournalSpot
            kicker={t('journalSpot.kicker')}
            title={feed.journal?.title ?? t('journalSpot.title')}
            lede={
              excerpt(feed.journal?.lede) ||
              excerpt(feed.journal?.author.displayName) ||
              t('journalSpot.lede')
            }
            cta={
              feed.journal ? t('journalSpot.cta') : t('journalSpot.emptyCta')
            }
            imageHref={feed.journal ? journalHref : null}
            ctaHref={journalHref}
            credits={journalCredits}
            src={
              feed.journal ? toUploadSrc(feed.journal.coverImageUrl) : undefined
            }
          />
          <HomeCollectionSpot
            href={
              feed.series
                ? projectPath(feed.series.author.slug, feed.series.id)
                : '/collections'
            }
            kicker={t('collectionSpot.kicker')}
            title={feed.series?.title ?? t('collectionSpot.title')}
            meta={feed.series ? undefined : t('collectionSpot.meta')}
            countLabel={
              feed.series
                ? t('collectionSpot.countMeta', {
                    count: feed.series.blockCount,
                  })
                : undefined
            }
            credits={seriesCredits}
            cta={
              feed.series
                ? t('collectionSpot.cta')
                : t('collectionSpot.emptyCta')
            }
            srcs={
              feed.series
                ? feed.series.frameImageUrls.map((src) => toUploadSrc(src))
                : undefined
            }
          />
          <HomeLookingSpot
            kicker={t('lookingSpot.kicker')}
            title={t('lookingSpot.title')}
            lede={t('lookingSpot.lede')}
            cta={t('lookingSpot.cta')}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-10">
          <HomeNow creators={feed.nowCreators} />
          <HomeFreshSpot
            kicker={t('freshSpot.kicker')}
            seeAll={t('freshSpot.seeAll')}
            pending={pending}
            items={feed.fresh.map((work) => ({
              title: work.title,
              author: work.author.displayName,
              authorHref: profilePath(work.author.slug),
              time: formatFreshTime(work.createdAt, locale),
              href: workPath(work.author.slug, work.id),
              src: toUploadSrc(work.imageUrl),
            }))}
          />
          <HomeStudioSpot
            kicker={t('studioSpot.kicker')}
            title={
              feed.studio?.studioTitle ??
              feed.studio?.displayName ??
              t('studioSpot.title')
            }
            lede={
              excerpt(
                feed.studio?.studioDescription || feed.studio?.bio,
                140,
              ) || t('studioSpot.lede')
            }
            cta={feed.studio ? t('studioSpot.cta') : t('studioSpot.emptyCta')}
            href={feed.studio?.slug ? `/studio/${feed.studio.slug}` : null}
            credits={studioCredits}
            src={toUploadSrc(
              feed.studio?.studioCoverUrl ??
                feed.studio?.latestWorks[0]?.imageUrl,
            )}
          />
        </div>
      </div>
      <HomeOpenCallSpot
        kicker={t('openCallSpot.kicker')}
        title={t('openCallSpot.title')}
        lede={t('openCallSpot.lede')}
        cta={t('openCallSpot.cta')}
        href={openCallHref}
        src={feed.openCall ? toUploadSrc(feed.openCall.imageUrl) : undefined}
      />
    </section>
  );
}
