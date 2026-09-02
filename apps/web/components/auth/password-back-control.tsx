'use client';

import { PagerChevron } from '@/components/profile/pager-chevron';
import { Link, useRouter } from '@/i18n/navigation';

type PasswordBackControlProps = {
  label: string;
  returnToProfile: boolean;
};

const controlClass =
  'flex h-36 w-10 items-center justify-center border border-transparent text-current hover:border-white/30';

export function PasswordBackControl({
  label,
  returnToProfile,
}: PasswordBackControlProps) {
  const router = useRouter();
  const content = <PagerChevron direction="prev" />;

  return (
    <div className="flex h-36 shrink-0 items-center self-center">
      {returnToProfile ? (
        <Link
          href={{ pathname: '/profile', query: { pane: 'account' } }}
          aria-label={label}
          className={controlClass}
        >
          {content}
        </Link>
      ) : (
        <button
          type="button"
          aria-label={label}
          className={controlClass}
          onClick={() => router.back()}
        >
          {content}
        </button>
      )}
    </div>
  );
}
