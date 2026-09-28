import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { DialogueView } from '@/components/dialogue/dialogue-view';
import { loadPublishedDialogue } from '@/lib/load-published-feed';

type PageProps = {
  params: Promise<{ locale: string; dialogueId: string }>;
};

export default async function DialoguePage({ params }: PageProps) {
  const { locale, dialogueId } = await params;
  setRequestLocale(locale);
  const dialogue = await loadPublishedDialogue(dialogueId);
  if (!dialogue) {
    notFound();
  }
  return <DialogueView dialogue={dialogue} />;
}
