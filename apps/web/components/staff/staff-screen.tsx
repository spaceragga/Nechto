import type { ReactNode } from 'react';

type StaffScreenProps = {
  title: string;
  lede: string;
  forbidden: string;
  allowed: boolean;
  children: ReactNode;
};

export function StaffScreen({
  title,
  lede,
  forbidden,
  allowed,
  children,
}: StaffScreenProps) {
  return (
    <main className="mx-auto w-full max-w-[62.4rem] px-6 py-16">
      <h1 className="font-serif text-4xl tracking-wide">{title}</h1>
      <p className="mt-4 max-w-2xl text-base opacity-70">{lede}</p>
      {allowed ? (
        <div className="mt-10 flex flex-col">{children}</div>
      ) : (
        <p className="mt-10 text-base opacity-70">{forbidden}</p>
      )}
    </main>
  );
}
