import { getTranslations } from 'next-intl/server';
import { FluidRail } from '@/components/ui/fluid-rail';
import { MediaTile } from '@/components/ui/media-tile';
import type { DemoStillKind } from '@/lib/demo-media';
import { DEMO_PROFILE_HREF } from '@/lib/creator-directions';
import { loadPublishedWorks } from '@/lib/load-published-feed';
import { toUploadSrc } from '@/lib/to-upload-src';
import { Link } from '@/i18n/navigation';

type WorkCard = {
  title: string;
  author: string;
  still?: DemoStillKind;
};

export async function HomeWorksGrid() {
  const t = await getTranslations('HomePage');
  const published = await loadPublishedWorks(8);

  return (
    <section id="works" className="scroll-mt-20">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-sans text-xl tracking-wide">{t('works')}</h2>
        <Link href="/creators" className="font-sans text-sm underline">
          {t('seeAll')}
        </Link>
      </div>
      <FluidRail minItem="16rem">
        {published.length > 0
          ? published.map((work) => (
              <MediaTile
                key={work.id}
                href={`/u/${work.author.slug}`}
                title={work.title}
                subtitle={work.author.displayName}
                src={toUploadSrc(work.imageUrl)}
              />
            ))
          : (t.raw('workCards') as WorkCard[]).map((card) => (
              <MediaTile
                key={card.title}
                href={DEMO_PROFILE_HREF}
                title={card.title}
                subtitle={card.author}
                still={card.still}
              />
            ))}
      </FluidRail>
    </section>
  );
}
