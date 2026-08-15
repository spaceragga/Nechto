import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`rounded border border-white/20 bg-transparent px-3 py-2 ${className}`}
    />
  );
}
