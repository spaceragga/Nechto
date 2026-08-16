type PolicyPageProps = {
  title: string;
  updated: string;
  paragraphs: string[];
};

export function PolicyPage({ title, updated, paragraphs }: PolicyPageProps) {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="text-3xl tracking-wide">{title}</h1>
      <p className="mt-2 text-sm opacity-70">{updated}</p>
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className="mt-4 text-sm leading-relaxed opacity-90">
          {paragraph}
        </p>
      ))}
    </main>
  );
}
