import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { DEMO_PROFILE_HREF } from '@/lib/creator-directions';

export async function HomeSideTicker() {
  const t = await getTranslations('HomePage');
  const items = t.raw('tickerItems') as string[];
  const loop = [...items, ...items];

  return (
    <aside className="nechto-ticker flex w-full flex-col border border-white/15 bg-black/20 md:w-44 md:shrink-0">
      <p className="border-b border-white/15 px-3 py-2 text-xs tracking-[0.2em] uppercase">
        {t('tickerLabel')}
      </p>
      <div className="relative h-52 overflow-hidden md:h-full md:min-h-52">
        <ul className="nechto-ticker-track flex flex-col">
          {loop.map((item, index) => (
            <li key={`${item}-${index}`} className="border-b border-white/10">
              <Link
                href={DEMO_PROFILE_HREF}
                className="block px-3 py-3 text-sm leading-snug hover:bg-white/5"
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
