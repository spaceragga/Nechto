import { WorkFrame } from '@/components/ui/work-frame';
import { Link } from '@/i18n/navigation';

export type DialogueCard = {
  href: string;
  title: string;
  note: string;
  leftTitle: string;
  leftMeta: string;
  leftSrc?: string | null;
  rightTitle: string;
  rightMeta: string;
  rightSrc?: string | null;
};

type DialogueIndexProps = {
  title: string;
  lede: string;
  empty?: string;
  dialogues: DialogueCard[];
};

function PairThumb({
  title,
  meta,
  src,
}: {
  title: string;
  meta: string;
  src?: string | null;
}) {
  return (
    <div className="min-w-0">
      <WorkFrame src={src} alt={title} className="aspect-4/5 w-full" />
      <p className="mt-2 truncate font-serif text-sm">{title}</p>
      <p className="truncate font-serif text-xs opacity-70">{meta}</p>
    </div>
  );
}

export function DialogueIndex({
  title,
  lede,
  empty,
  dialogues,
}: DialogueIndexProps) {
  return (
    <main className="flex w-full flex-col gap-10 px-6 py-12">
      <header>
        <h1 className="font-serif text-4xl tracking-wide">{title}</h1>
        <p className="mt-3 max-w-2xl font-sans text-sm opacity-70">{lede}</p>
      </header>

      {dialogues.length === 0 ? (
        empty ? (
          <p className="text-sm opacity-70">{empty}</p>
        ) : null
      ) : (
        <section className="grid gap-12">
          {dialogues.map((dialogue) => (
            <Link
              key={dialogue.href}
              href={dialogue.href}
              className="grid gap-4 no-underline lg:grid-cols-[1fr_1.2fr] lg:items-end"
            >
              <div className="grid grid-cols-2 gap-2">
                <PairThumb
                  title={dialogue.leftTitle}
                  meta={dialogue.leftMeta}
                  src={dialogue.leftSrc}
                />
                <PairThumb
                  title={dialogue.rightTitle}
                  meta={dialogue.rightMeta}
                  src={dialogue.rightSrc}
                />
              </div>
              <div className="max-w-md">
                <h2 className="font-serif text-2xl tracking-wide">
                  {dialogue.title}
                </h2>
                {dialogue.note ? (
                  <p className="mt-3 font-serif text-sm leading-relaxed opacity-80">
                    {dialogue.note}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
