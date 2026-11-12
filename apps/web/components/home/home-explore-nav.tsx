import { getTranslations } from 'next-intl/server';
import { ChipLink } from '@/components/ui/chip-link';

const EXPLORE_LINKS = [
  { href: '/creators', key: 'creators' },
  { href: '/hanging', key: 'hanging' },
  { href: '/new', key: 'new' },
  { href: '/collections', key: 'collections' },
  { href: '/journal', key: 'journal' },
  { href: '/dialogue', key: 'dialogue' },
  { href: '/studio', key: 'studio' },
  { href: '/community', key: 'community' },
  { href: '/community?tab=following', key: 'following' },
] as const;

export async function HomeExploreNav() {
  const t = await getTranslations('HomePage.exploreNav');

  return (
    <nav aria-label={t('label')} className="mt-3 flex flex-wrap gap-4">
      {EXPLORE_LINKS.map((link) => (
        <ChipLink key={link.key} href={link.href}>
          {t(link.key)}
        </ChipLink>
      ))}
    </nav>
  );
}
