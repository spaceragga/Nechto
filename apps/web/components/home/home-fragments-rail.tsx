import { getTranslations } from 'next-intl/server';
import type { CursorPage, WorkWithAuthor } from '@nechto/api-contract';
import { HomeFragmentsFeed } from '@/components/home/home-fragments-feed';
import { FluidRail } from '@/components/ui/fluid-rail';
import { MediaTile } from '@/components/ui/media-tile';
import type { DemoStillKind } from '@/lib/demo-media';
import { DEMO_PROFILE_HREF } from '@/lib/creator-directions';

type FragmentCard = {
  title: string;
  still?: DemoStillKind;
};

type HomeFragmentsRailProps = {
  feed: CursorPage<WorkWithAuthor>;
};

export async function HomeFragmentsRail({ feed }: HomeFragmentsRailProps) {
  const t = await getTranslations('HomePage');

  if (feed.items.length > 0) {
    return <HomeFragmentsFeed initial={feed} />;
  }

  const cards = t.raw('fragmentCards') as FragmentCard[];

  return (
    <section id="fragments" className="scroll-mt-20">
      <h2 className="mb-3 font-sans text-xl tracking-wide">{t('fragments')}</h2>
      <FluidRail minItem="9rem">
        {cards.map((card) => (
          <MediaTile
            key={card.title}
            href={DEMO_PROFILE_HREF}
            title={card.title}
            still={card.still ?? 'paper'}
            wellClassName="h-36 w-full"
          />
        ))}
      </FluidRail>
    </section>
  );
}
