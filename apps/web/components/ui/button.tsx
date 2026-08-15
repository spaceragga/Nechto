import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`rounded border border-white/30 px-4 py-2 text-sm tracking-wide disabled:opacity-50 ${className}`}
    />
  );
}
