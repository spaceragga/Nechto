import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ExploreCatalogPage } from '@/components/explore/explore-catalog-page';
import { catalogHref, parseCatalogDirection } from '@/lib/catalog-query';
import { loadPublishedProjectsPage } from '@/lib/load-published-feed';
import { toUploadSrc } from '@/lib/to-upload-src';
import { projectPath } from '@/lib/work-path';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ cursor?: string; direction?: string }>;
};

export default async function ProjectsPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const direction = parseCatalogDirection(query.direction);
  const t = await getTranslations('Projects');
  const page = await loadPublishedProjectsPage({
    limit: 24,
    cursor: query.cursor,
    direction,
  });

  return (
    <ExploreCatalogPage
      title={t('title')}
      lede={t('lede')}
      empty={direction ? t('emptyDirection') : t('emptyCatalog')}
      more={t('more')}
      nextHref={
        page.nextCursor
          ? catalogHref('/projects', { direction, cursor: page.nextCursor })
          : null
      }
      direction={direction}
      filterPath="/projects"
      items={page.items.map((project) => ({
        id: project.id,
        href: projectPath(project.author.slug, project.id),
        title: project.title,
        subtitle: project.author.displayName,
        src: toUploadSrc(project.coverImageUrl),
      }))}
    />
  );
}
