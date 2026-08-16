type StubPageProps = {
  title: string;
  body?: string;
};

export function StubPage({ title, body }: StubPageProps) {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="text-3xl tracking-wide">{title}</h1>
      {body ? <p className="mt-3 text-sm opacity-70">{body}</p> : null}
    </main>
  );
}
