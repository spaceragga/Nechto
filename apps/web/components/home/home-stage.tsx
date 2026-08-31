import { getTranslations } from 'next-intl/server';
import { HomeCollectionSpot } from '@/components/home/home-collection-spot';
import { HomeDialogueSpot } from '@/components/home/home-dialogue-spot';
import { HomeFeatured } from '@/components/home/home-featured';
import {
  HomeFreshSpot,
  type HomeFreshItem,
} from '@/components/home/home-fresh-spot';
import { HomeJournalSpot } from '@/components/home/home-journal-spot';
import { HomeLookingSpot } from '@/components/home/home-looking-spot';
import { HomeNow } from '@/components/home/home-now';
import { HomeOpenCallSpot } from '@/components/home/home-open-call-spot';
import { HomeStudioSpot } from '@/components/home/home-studio-spot';
import { DEMO_PROFILE_HREF } from '@/lib/creator-directions';
import { excerpt } from '@/lib/excerpt';
import { type HomeFeedSlices } from '@/lib/pick-home-feed';
import { toUploadSrc } from '@/lib/to-upload-src';
import { workPath } from '@/lib/work-path';

type HomeStageProps = {
  locale: string;
  feed: HomeFeedSlices;
};

function formatFreshTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

export async function HomeStage({ locale, feed }: HomeStageProps) {
  const t = await getTranslations('HomePage');
  const tCreators = await getTranslations('Creators');
  const demoFresh = t.raw('freshSpot.items') as Array<
    HomeFreshItem & { still: NonNullable<HomeFreshItem['still']> }
  >;

  const billboardHref = feed.billboard
    ? workPath(feed.billboard.author.slug, feed.billboard.id)
    : DEMO_PROFILE_HREF;
  const creatorHref = feed.creatorOfWeek
    ? `/u/${feed.creatorOfWeek.slug}`
    : DEMO_PROFILE_HREF;
  const collectionDirection =
    feed.collection[0]?.author.directions[0] ?? 'photography';
  const journalHref = feed.journal
    ? workPath(feed.journal.creator.slug, feed.journal.work.id)
    : '/journal';
  const studioWork = feed.studio?.latestWorks[0];

  return (
    <section aria-label={t('growthSpotsLabel')} className="flex flex-col gap-8">
      <div className="grid items-stretch gap-4 overflow-hidden lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-25">
          <div className="flex flex-col gap-8">
            <HomeFeatured
              href={billboardHref}
              still={feed.billboard ? undefined : 'market'}
              src={
                feed.billboard
                  ? toUploadSrc(feed.billboard.imageUrl)
                  : undefined
              }
              kicker={t('billboardKicker')}
              title={feed.billboard?.title ?? t('billboardTitle')}
              meta={
                feed.billboard
                  ? `${feed.billboard.author.displayName}${
                      feed.billboard.author.directions[0]
                        ? ` · ${tCreators(`directions.${feed.billboard.author.directions[0]}`)}`
                        : ''
                    }`
                  : t('billboardAuthor')
              }
              cta={t('billboardCta')}
              fit="cover"
              stillClassName="h-[26rem] w-full md:h-[32rem]"
              spot="billboard"
            />
            <HomeFeatured
              href={creatorHref}
              still={feed.creatorOfWeek ? undefined : 'portrait'}
              src={
                feed.creatorOfWeek
                  ? toUploadSrc(feed.creatorOfWeek.avatarUrl)
                  : undefined
              }
              kicker={t('creatorKicker')}
              title={
                feed.creatorOfWeek?.displayName ??
                feed.creatorOfWeek?.slug ??
                t('creatorTitle')
              }
              meta={
                feed.creatorOfWeek?.directions[0]
                  ? tCreators(`directions.${feed.creatorOfWeek.directions[0]}`)
                  : t('creatorMeta')
              }
              cta={t('creatorCta')}
              align="center"
              spot="creator-week"
            />
          </div>
          <HomeDialogueSpot
            kicker={t('dialogueSpot.kicker')}
            title={t('dialogueSpot.title')}
            lede={t('dialogueSpot.lede')}
            leftTitle={feed.dialogue?.[0].title ?? t('dialogueSpot.leftTitle')}
            leftMeta={
              feed.dialogue?.[0].author.displayName ??
              t('dialogueSpot.leftMeta')
            }
            rightTitle={
              feed.dialogue?.[1].title ?? t('dialogueSpot.rightTitle')
            }
            rightMeta={
              feed.dialogue?.[1].author.displayName ??
              t('dialogueSpot.rightMeta')
            }
            leftSrc={
              feed.dialogue ? toUploadSrc(feed.dialogue[0].imageUrl) : undefined
            }
            rightSrc={
              feed.dialogue ? toUploadSrc(feed.dialogue[1].imageUrl) : undefined
            }
            cta={t('dialogueSpot.cta')}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-25">
          <HomeJournalSpot
            kicker={t('journalSpot.kicker')}
            title={feed.journal?.work.title ?? t('journalSpot.title')}
            lede={
              excerpt(feed.journal?.work.description) ||
              excerpt(feed.journal?.creator.bio) ||
              t('journalSpot.lede')
            }
            cta={t('journalSpot.cta')}
            href={journalHref}
            src={
              feed.journal ? toUploadSrc(feed.journal.work.imageUrl) : undefined
            }
          />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex h-3/4 min-h-0 flex-col">
              <HomeCollectionSpot
                kicker={t('collectionSpot.kicker')}
                title={
                  feed.collection.length > 0
                    ? tCreators(`directions.${collectionDirection}`)
                    : t('collectionSpot.title')
                }
                meta={
                  feed.collection.length > 0
                    ? t('collectionSpot.countMeta', {
                        count: feed.collection.length,
                      })
                    : t('collectionSpot.meta')
                }
                srcs={
                  feed.collection.length > 0
                    ? feed.collection.map((work) => toUploadSrc(work.imageUrl))
                    : undefined
                }
              />
            </div>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-25">
          <HomeNow creators={feed.nowCreators} />
          <HomeFreshSpot
            kicker={t('freshSpot.kicker')}
            seeAll={t('freshSpot.seeAll')}
            items={
              feed.fresh.length > 0
                ? feed.fresh.map((work) => ({
                    title: work.title,
                    author: work.author.displayName,
                    time: formatFreshTime(work.createdAt, locale),
                    href: workPath(work.author.slug, work.id),
                    src: toUploadSrc(work.imageUrl),
                  }))
                : demoFresh.map((item) => ({
                    ...item,
                    href: DEMO_PROFILE_HREF,
                  }))
            }
          />
          <HomeLookingSpot
            kicker={t('lookingSpot.kicker')}
            title={t('lookingSpot.title')}
            lede={t('lookingSpot.lede')}
            cta={t('lookingSpot.cta')}
          />
          <HomeStudioSpot
            kicker={t('studioSpot.kicker')}
            title={feed.studio?.displayName ?? t('studioSpot.title')}
            lede={excerpt(feed.studio?.bio, 140) || t('studioSpot.lede')}
            cta={t('studioSpot.cta')}
            href={feed.studio ? `/u/${feed.studio.slug}` : undefined}
            src={studioWork ? toUploadSrc(studioWork.imageUrl) : undefined}
          />
        </div>
      </div>
      <HomeOpenCallSpot
        kicker={t('openCallSpot.kicker')}
        title={t('openCallSpot.title')}
        lede={t('openCallSpot.lede')}
        cta={t('openCallSpot.cta')}
        src={feed.openCall ? toUploadSrc(feed.openCall.imageUrl) : undefined}
      />
    </section>
  );
}
