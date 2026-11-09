'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type {
  EngagementSnapshot,
  EngagementTargetType,
} from '@nechto/api-contract';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { useHydrated } from '@/hooks/use-hydrated';
import { Link } from '@/i18n/navigation';
import {
  likeContentRequest,
  recordViewRequest,
  unlikeContentRequest,
} from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';

type EngagementBarProps = {
  targetType: EngagementTargetType;
  targetId: string;
  signedIn: boolean;
};

const empty: EngagementSnapshot = {
  likeCount: 0,
  viewCount: 0,
  likedByMe: false,
};

export function EngagementBar({
  targetType,
  targetId,
  signedIn,
}: EngagementBarProps) {
  const t = useTranslations('Social');
  const tErrors = useTranslations('Errors');
  const hydrated = useHydrated();
  const [state, setState] = useState<EngagementSnapshot>(empty);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void recordViewRequest({ targetType, targetId })
      .then((snapshot) => {
        if (!cancelled) {
          setState(snapshot);
        }
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(mapApiErrorMessage(caught, tErrors));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [targetType, targetId, tErrors]);

  async function toggleLike() {
    if (!signedIn || pending) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const next = state.likedByMe
        ? await unlikeContentRequest({ targetType, targetId })
        : await likeContentRequest({ targetType, targetId });
      setState(next);
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mx-auto mt-8 max-w-md text-center">
      <p className="font-sans text-sm opacity-70">
        {t('views', { count: state.viewCount })}
        <span aria-hidden="true"> · </span>
        {t('likes', { count: state.likeCount })}
      </p>
      {signedIn ? (
        <Button
          type="button"
          className="mt-3"
          disabled={!hydrated || pending}
          onClick={() => void toggleLike()}
          aria-pressed={state.likedByMe}
        >
          {pending ? t('liking') : state.likedByMe ? t('unlike') : t('like')}
        </Button>
      ) : (
        <p className="mt-3 font-sans text-sm">
          <Link href="/login" className="text-[var(--accent)]">
            {t('signInToLike')}
          </Link>
        </p>
      )}
      {error ? <FormError>{error}</FormError> : null}
    </section>
  );
}
