import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { FluidRail } from '@/components/ui/fluid-rail';
import { MediaTile } from '@/components/ui/media-tile';
import { DEMO_PROFILE_HREF } from '@/lib/creator-directions';

type WorkCard = {
  title: string;
  author: string;
};

export async function HomeWorksGrid() {
  const t = await getTranslations('HomePage');
  const cards = t.raw('workCards') as WorkCard[];

  return (
    <section id="works" className="scroll-mt-20">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-xl tracking-wide">{t('works')}</h2>
        <Link href="/creators" className="text-sm underline">
          {t('seeAll')}
        </Link>
      </div>
      <FluidRail minItem="16rem">
        {cards.map((card) => (
          <MediaTile
            key={card.title}
            href={DEMO_PROFILE_HREF}
            title={card.title}
            subtitle={card.author}
          />
        ))}
      </FluidRail>
    </section>
  );
}
