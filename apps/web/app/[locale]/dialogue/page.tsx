import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DialogueIndex } from '@/components/dialogue/dialogue-index';
import { loadPublishedDialogues } from '@/lib/load-published-feed';
import { dialoguePath } from '@/lib/work-path';
import { toUploadSrc } from '@/lib/to-upload-src';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DialogueIndexPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Dialogue');
  const dialogues = await loadPublishedDialogues(40);

  return (
    <DialogueIndex
      title={t('title')}
      lede={t('lede')}
      empty={t('empty')}
      dialogues={dialogues.map((dialogue) => ({
        href: dialoguePath(dialogue.id),
        title: dialogue.title,
        note: dialogue.note,
        leftTitle: dialogue.left.title,
        leftMeta: dialogue.left.author.displayName,
        leftSrc: toUploadSrc(dialogue.left.imageUrl),
        rightTitle: dialogue.right.title,
        rightMeta: dialogue.right.author.displayName,
        rightSrc: toUploadSrc(dialogue.right.imageUrl),
      }))}
    />
  );
}
