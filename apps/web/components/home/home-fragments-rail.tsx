import { getTranslations } from 'next-intl/server';
import { FluidRail } from '@/components/ui/fluid-rail';
import { MediaTile } from '@/components/ui/media-tile';
import type { DemoStillKind } from '@/components/ui/demo-still';
import { DEMO_PROFILE_HREF } from '@/lib/creator-directions';

type FragmentCard = {
  title: string;
  still?: DemoStillKind;
  ratio?: string;
};

export async function HomeFragmentsRail() {
  const t = await getTranslations('HomePage');
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
            ratio={card.ratio ?? '4/3'}
            wellClassName="h-36 w-full"
          />
        ))}
      </FluidRail>
    </section>
  );
}
