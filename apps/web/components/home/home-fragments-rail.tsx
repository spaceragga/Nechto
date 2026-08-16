import { getTranslations } from 'next-intl/server';
import { MediaTile } from '@/components/ui/media-tile';
import { DEMO_PROFILE_HREF } from '@/lib/creator-directions';

export async function HomeFragmentsRail() {
  const t = await getTranslations('HomePage');
  const cards = t.raw('fragmentCards') as string[];

  return (
    <section id="fragments" className="scroll-mt-20">
      <h2 className="mb-3 text-xl tracking-wide">{t('fragments')}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {cards.map((title) => (
          <MediaTile
            key={title}
            href={DEMO_PROFILE_HREF}
            title={title}
            className="w-32 shrink-0"
          >
            <div className="aspect-square bg-white/10" />
          </MediaTile>
        ))}
      </div>
    </section>
  );
}
