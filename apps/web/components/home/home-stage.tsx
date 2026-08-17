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

export async function HomeStage() {
  const t = await getTranslations('HomePage');

  return (
    <section aria-label={t('growthSpotsLabel')} className="flex flex-col gap-8">
      <div className="grid items-stretch gap-4 overflow-hidden lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-25">
          <div className="flex flex-col gap-8">
            <HomeFeatured
              href={DEMO_PROFILE_HREF}
              still="market"
              kicker={t('billboardKicker')}
              title={t('billboardTitle')}
              meta={t('billboardAuthor')}
              cta={t('billboardCta')}
              fit="cover"
              stillClassName="h-[26rem] w-full md:h-[32rem]"
            />
            <HomeFeatured
              href={DEMO_PROFILE_HREF}
              still="portrait"
              kicker={t('creatorKicker')}
              title={t('creatorTitle')}
              meta={t('creatorMeta')}
              cta={t('creatorCta')}
              align="center"
            />
          </div>
          <HomeDialogueSpot
            kicker={t('dialogueSpot.kicker')}
            title={t('dialogueSpot.title')}
            lede={t('dialogueSpot.lede')}
            leftTitle={t('dialogueSpot.leftTitle')}
            leftMeta={t('dialogueSpot.leftMeta')}
            rightTitle={t('dialogueSpot.rightTitle')}
            rightMeta={t('dialogueSpot.rightMeta')}
            cta={t('dialogueSpot.cta')}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-25">
          <HomeJournalSpot
            kicker={t('journalSpot.kicker')}
            title={t('journalSpot.title')}
            lede={t('journalSpot.lede')}
            cta={t('journalSpot.cta')}
          />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex h-3/4 min-h-0 flex-col">
              <HomeCollectionSpot
                kicker={t('collectionSpot.kicker')}
                title={t('collectionSpot.title')}
                meta={t('collectionSpot.meta')}
              />
            </div>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-25">
          <HomeNow />
          <HomeFreshSpot
            kicker={t('freshSpot.kicker')}
            seeAll={t('freshSpot.seeAll')}
            items={t.raw('freshSpot.items') as HomeFreshItem[]}
          />
          <HomeLookingSpot
            kicker={t('lookingSpot.kicker')}
            title={t('lookingSpot.title')}
            lede={t('lookingSpot.lede')}
            cta={t('lookingSpot.cta')}
          />
          <HomeStudioSpot
            kicker={t('studioSpot.kicker')}
            title={t('studioSpot.title')}
            lede={t('studioSpot.lede')}
            cta={t('studioSpot.cta')}
          />
        </div>
      </div>
      <HomeOpenCallSpot
        kicker={t('openCallSpot.kicker')}
        title={t('openCallSpot.title')}
        lede={t('openCallSpot.lede')}
        cta={t('openCallSpot.cta')}
      />
    </section>
  );
}
