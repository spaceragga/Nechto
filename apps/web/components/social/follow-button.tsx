'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { FollowSnapshot } from '@nechto/api-contract';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { useHydrated } from '@/hooks/use-hydrated';
import { Link } from '@/i18n/navigation';
import {
  followProfileRequest,
  getFollowRequest,
  unfollowProfileRequest,
} from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';

type FollowButtonProps = {
  slug: string;
  signedIn: boolean;
  isOwn: boolean;
};

const empty: FollowSnapshot = { followerCount: 0, following: false };

export function FollowButton({ slug, signedIn, isOwn }: FollowButtonProps) {
  const t = useTranslations('Social');
  const tErrors = useTranslations('Errors');
  const hydrated = useHydrated();
  const [state, setState] = useState<FollowSnapshot>(empty);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getFollowRequest({ slug })
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
  }, [slug, tErrors]);

  async function toggle() {
    if (!signedIn || isOwn || pending) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const next = state.following
        ? await unfollowProfileRequest({ slug })
        : await followProfileRequest({ slug });
      setState(next);
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-4">
      <p className="font-sans text-sm opacity-70">
        {t('followers', { count: state.followerCount })}
      </p>
      {isOwn ? null : signedIn ? (
        <Button
          type="button"
          className="mt-3"
          disabled={!hydrated || pending}
          onClick={() => void toggle()}
          aria-pressed={state.following}
        >
          {pending
            ? t('followingBusy')
            : state.following
              ? t('unfollow')
              : t('follow')}
        </Button>
      ) : (
        <p className="mt-3 font-sans text-sm">
          <Link href="/login" className="text-[var(--accent)]">
            {t('signInToFollow')}
          </Link>
        </p>
      )}
      {error ? <FormError>{error}</FormError> : null}
    </div>
  );
}
