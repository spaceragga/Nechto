import type { ReactNode } from 'react';

type WorkFrameProps = {
  children: ReactNode;
  ratio?: string;
  className?: string;
};

export function WorkFrame({
  children,
  ratio = '4/3',
  className = '',
}: WorkFrameProps) {
  return (
    <div
      data-work-frame
      className={`flex items-center justify-center overflow-hidden bg-[var(--bg)] ${className}`.trim()}
    >
      <div
        className="max-h-full max-w-full"
        style={{ aspectRatio: ratio, height: '100%', width: 'auto' }}
      >
        {children}
      </div>
    </div>
  );
}
