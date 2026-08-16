import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { DEMO_PROFILE_HREF } from '@/lib/creator-directions';

export async function HomeBillboard() {
  const t = await getTranslations('HomePage');

  return (
    <Link
      href={DEMO_PROFILE_HREF}
      className="relative flex min-h-56 flex-1 flex-col justify-end overflow-hidden border border-white/15 bg-white/10 p-5 md:min-h-72"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <p className="relative text-xs tracking-[0.2em] uppercase opacity-80">
        {t('billboardKicker')}
      </p>
      <p className="relative mt-2 text-2xl md:text-4xl">
        {t('billboardTitle')}
      </p>
      <p className="relative mt-1 text-sm opacity-80">{t('billboardAuthor')}</p>
      <span className="relative mt-4 text-sm underline">
        {t('billboardCta')}
      </span>
    </Link>
  );
}
