import { getTranslations } from 'next-intl/server';
import type { PublicDialogue, WorkWithAuthor } from '@nechto/api-contract';
import { WorkFrame } from '@/components/ui/work-frame';
import { Link } from '@/i18n/navigation';
import { toUploadSrc } from '@/lib/to-upload-src';
import { profilePath, workPath } from '@/lib/work-path';

type DialogueViewProps = {
  dialogue: PublicDialogue;
};

function DialogueSide({ work }: { work: WorkWithAuthor }) {
  const href = workPath(work.author.slug, work.id);

  return (
    <article className="min-w-0">
      <Link href={href} className="block no-underline">
        <WorkFrame
          src={toUploadSrc(work.imageUrl)}
          alt={work.title}
          className="aspect-4/5 w-full"
        />
        <h2 className="mt-4 font-serif text-2xl tracking-wide">{work.title}</h2>
      </Link>
      <p className="mt-2 font-serif text-sm opacity-70">
        <Link
          href={profilePath(work.author.slug)}
          className="text-[var(--accent)] no-underline"
        >
          {work.author.displayName}
        </Link>
      </p>
      {work.description ? (
        <p className="mt-3 font-serif text-sm leading-relaxed opacity-80">
          {work.description}
        </p>
      ) : null}
    </article>
  );
}

export async function DialogueView({ dialogue }: DialogueViewProps) {
  const t = await getTranslations('Dialogue');

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12">
      <header className="max-w-2xl">
        <p className="font-sans text-xs tracking-[0.2em] uppercase opacity-70">
          {t('kicker')}
        </p>
        <h1 className="mt-2 font-serif text-4xl tracking-wide">
          {dialogue.title}
        </h1>
        {dialogue.note ? (
          <p className="mt-4 font-serif text-base leading-relaxed opacity-80">
            {dialogue.note}
          </p>
        ) : null}
      </header>

      <section className="grid gap-8 md:grid-cols-2">
        <DialogueSide work={dialogue.left} />
        <DialogueSide work={dialogue.right} />
      </section>

      <p className="max-w-2xl font-sans text-sm opacity-70">{t('footer')}</p>
      <p>
        <Link href="/dialogue" className="text-sm text-[var(--accent)]">
          {t('back')}
        </Link>
      </p>
    </main>
  );
}
