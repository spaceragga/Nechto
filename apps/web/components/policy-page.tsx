import { HouseIntro } from '@/components/house-intro';

const SUPPORT_EMAIL = 'support@nechto.by';

export type PolicySection = {
  kicker: string;
  title: string;
  paragraphs: string[];
};

type PolicyPageProps = {
  title: string;
  lede: string;
  updated: string;
  sections: PolicySection[];
};

function textWithMail(text: string) {
  if (!text.includes(SUPPORT_EMAIL)) {
    return text;
  }

  const parts = text.split(SUPPORT_EMAIL);
  return parts.map((part, index) => (
    <span key={index}>
      {part}
      {index < parts.length - 1 ? (
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="underline decoration-1 underline-offset-4"
        >
          {SUPPORT_EMAIL}
        </a>
      ) : null}
    </span>
  ));
}

export function PolicyPage({
  title,
  lede,
  updated,
  sections,
}: PolicyPageProps) {
  return (
    <main className="px-6 py-12">
      <HouseIntro title={title} lede={lede} />
      <p className="mt-6 max-w-xl pl-12 font-sans text-sm tracking-wide opacity-50 sm:pl-24">
        {updated}
      </p>
      <div className="mt-16 flex max-w-4xl flex-col gap-12 pl-12 sm:pl-24">
        {sections.map((section) => (
          <section
            key={section.kicker}
            className="grid gap-3 sm:grid-cols-[14rem_1fr] sm:gap-10"
          >
            <div>
              <p className="font-sans text-sm tracking-[0.16em] text-[var(--accent)] uppercase">
                {section.kicker}
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-wide">
                {section.title}
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:pt-7">
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="max-w-xl font-sans text-base leading-relaxed opacity-80"
                >
                  {textWithMail(paragraph)}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
