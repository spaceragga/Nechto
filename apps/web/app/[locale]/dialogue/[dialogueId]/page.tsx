import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { DialogueView } from '@/components/dialogue/dialogue-view';
import { loadPublishedDialogue } from '@/lib/load-published-feed';
import { loadReportViewer } from '@/lib/report-viewer';

type PageProps = {
  params: Promise<{ locale: string; dialogueId: string }>;
};

export default async function DialoguePage({ params }: PageProps) {
  const { locale, dialogueId } = await params;
  setRequestLocale(locale);
  const [dialogue, viewer] = await Promise.all([
    loadPublishedDialogue(dialogueId),
    loadReportViewer(),
  ]);
  if (!dialogue) {
    notFound();
  }
  const ownerSlugs = new Set([
    dialogue.left.author.slug,
    dialogue.right.author.slug,
  ]);
  return (
    <DialogueView
      dialogue={dialogue}
      canReport={
        viewer.viewerSlug === null || !ownerSlugs.has(viewer.viewerSlug)
      }
      viewerEmail={viewer.viewerEmail}
    />
  );
}
