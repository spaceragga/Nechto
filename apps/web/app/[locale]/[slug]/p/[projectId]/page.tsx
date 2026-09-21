import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PublicProjectView } from '@/components/profile/public-project-view';
import { loadPublishedProject } from '@/lib/load-published-feed';

type PublicProjectPageProps = {
  params: Promise<{ locale: string; slug: string; projectId: string }>;
};

export default async function PublicProjectPage({
  params,
}: PublicProjectPageProps) {
  const { locale, slug, projectId } = await params;
  setRequestLocale(locale);

  const project = await loadPublishedProject(projectId);
  if (!project || project.author.slug !== slug) {
    notFound();
  }

  return <PublicProjectView project={project} />;
}
