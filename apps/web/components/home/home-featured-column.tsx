import { getTranslations } from 'next-intl/server';
import { HomeFeatured } from '@/components/home/home-featured';
import { DEMO_PROFILE_HREF } from '@/lib/creator-directions';

export async function HomeFeaturedColumn() {
  const t = await getTranslations('HomePage');

  return (
    <div className="flex min-w-0 flex-1 basis-80 flex-col gap-8">
      <HomeFeatured
        href={DEMO_PROFILE_HREF}
        still="market"
        kicker={t('billboardKicker')}
        title={t('billboardTitle')}
        meta={t('billboardAuthor')}
        cta={t('billboardCta')}
      />
      <HomeFeatured
        href={DEMO_PROFILE_HREF}
        still="portrait"
        kicker={t('creatorKicker')}
        title={t('creatorTitle')}
        meta={t('creatorMeta')}
        cta={t('creatorCta')}
      />
    </div>
  );
}
