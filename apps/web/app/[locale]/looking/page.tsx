import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HouseIntro } from '@/components/house-intro';

type PageProps = {
  params: Promise<{ locale: string }>;
};

type LookingRoom = {
  kicker: string;
  title: string;
  body: string;
};

export default async function LookingPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Looking');
  const rooms = t.raw('rooms') as LookingRoom[];

  return (
    <main className="px-6 py-12">
      <HouseIntro title={t('title')} lede={t('lede')} />
      <div className="mt-16 flex max-w-4xl flex-col gap-12 pl-12 sm:pl-24">
        {rooms.map((room) => (
          <section
            key={room.kicker}
            className="grid gap-3 sm:grid-cols-[14rem_1fr] sm:gap-10"
          >
            <div>
              <p className="font-sans text-sm tracking-[0.16em] text-[var(--accent)] uppercase">
                {room.kicker}
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-wide">
                {room.title}
              </h2>
            </div>
            <p className="max-w-xl font-sans text-base leading-relaxed opacity-80 sm:pt-7">
              {room.body}
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}
