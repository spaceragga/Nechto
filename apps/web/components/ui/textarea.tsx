import type { TextareaHTMLAttributes } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className = '', ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={`rounded border border-white/20 bg-transparent px-3 py-2 ${className}`}
    />
  );
}
