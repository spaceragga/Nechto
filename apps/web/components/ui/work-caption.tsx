type WorkCaptionProps = {
  title?: string;
  meta?: string;
};

export function WorkCaption({ title, meta }: WorkCaptionProps) {
  if (!title && !meta) {
    return null;
  }

  return (
    <div className="pt-2">
      {title ? (
        <p className="font-serif text-sm leading-snug">{title}</p>
      ) : null}
      {meta ? (
        <p className="mt-0.5 font-serif text-xs opacity-70">{meta}</p>
      ) : null}
    </div>
  );
}
