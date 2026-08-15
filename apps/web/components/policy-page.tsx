type PolicyPageProps = {
  title: string;
  updated: string;
  paragraphs: string[];
};

export function PolicyPage({ title, updated, paragraphs }: PolicyPageProps) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-16">
      <h1 className="text-4xl">{title}</h1>
      <p className="mt-3 text-sm opacity-70">{updated}</p>
      <div className="mt-8 space-y-5">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </main>
  );
}
