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
  /** Card action: no follower count, and no status fetch when the page already knows. */
  compact?: boolean;
  initialFollowing?: boolean;
};

export function FollowButton({
  slug,
  signedIn,
  isOwn,
  compact = false,
  initialFollowing,
}: FollowButtonProps) {
  const t = useTranslations('Social');
  const tErrors = useTranslations('Errors');
  const hydrated = useHydrated();
  const [state, setState] = useState<FollowSnapshot>({
    followerCount: 0,
    following: initialFollowing ?? false,
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialFollowing !== undefined) {
      return;
    }
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
  }, [slug, tErrors, initialFollowing]);

  function followLabel() {
    if (pending) {
      return t('followingBusy');
    }
    return state.following ? t('unfollow') : t('follow');
  }

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

  if (compact && isOwn) {
    return null;
  }

  return (
    <div className={compact ? 'mt-2' : 'mt-4'}>
      {compact ? null : (
        <p className="font-sans text-sm opacity-70">
          {t('followers', { count: state.followerCount })}
        </p>
      )}
      {isOwn ? null : signedIn ? (
        compact ? (
          <button
            type="button"
            className="cursor-pointer rounded border border-white/30 px-2.5 py-1 font-sans text-xs tracking-wide disabled:opacity-50"
            disabled={!hydrated || pending}
            onClick={() => void toggle()}
            aria-pressed={state.following}
          >
            {followLabel()}
          </button>
        ) : (
          <Button
            type="button"
            className="mt-3"
            disabled={!hydrated || pending}
            onClick={() => void toggle()}
            aria-pressed={state.following}
          >
            {followLabel()}
          </Button>
        )
      ) : (
        <p className={compact ? 'font-sans text-xs' : 'mt-3 font-sans text-sm'}>
          <Link href="/login" className="accent-quiet">
            {compact ? t('follow') : t('signInToFollow')}
          </Link>
        </p>
      )}
      {error ? <FormError>{error}</FormError> : null}
    </div>
  );
}
