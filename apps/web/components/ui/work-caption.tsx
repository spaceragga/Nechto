type WorkCaptionProps = {
  title?: string;
  meta?: string;
  /** Home rails / fragments: compact. Profile grids: readable md. */
  size?: 'sm' | 'md';
};

export function WorkCaption({ title, meta, size = 'md' }: WorkCaptionProps) {
  if (!title && !meta) {
    return null;
  }

  const compact = size === 'sm';

  return (
    <div className={`text-start ${compact ? 'pt-2' : 'pt-3'}`}>
      {title ? (
        <p
          className={
            compact
              ? 'truncate font-serif text-base leading-snug'
              : 'font-serif text-lg leading-snug tracking-wide'
          }
        >
          {title}
        </p>
      ) : null}
      {meta ? (
        <p
          className={
            compact
              ? 'mt-0.5 truncate font-sans text-sm leading-snug opacity-70'
              : 'mt-1 font-sans text-base leading-relaxed opacity-70'
          }
        >
          {meta}
        </p>
      ) : null}
    </div>
  );
}
