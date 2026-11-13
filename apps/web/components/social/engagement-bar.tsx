'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type {
  EngagementSnapshot,
  EngagementTargetType,
} from '@nechto/api-contract';
import { EyeGlyph } from '@/components/glyphs/eye-glyph';
import { HeartGlyph } from '@/components/glyphs/heart-glyph';
import { FormError } from '@/components/ui/form-error';
import { useHydrated } from '@/hooks/use-hydrated';
import { Link } from '@/i18n/navigation';
import {
  likeContentRequest,
  recordViewRequest,
  unlikeContentRequest,
} from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';

type EngagementMarksProps = {
  targetType: EngagementTargetType;
  targetId: string;
  signedIn: boolean;
};

type LoadedEngagement = {
  targetType: EngagementTargetType;
  targetId: string;
  snapshot: EngagementSnapshot;
};

function useEngagement(targetType: EngagementTargetType, targetId: string) {
  const tErrors = useTranslations('Errors');
  const [loaded, setLoaded] = useState<LoadedEngagement | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const state =
    loaded?.targetType === targetType && loaded.targetId === targetId
      ? loaded.snapshot
      : null;

  useEffect(() => {
    let cancelled = false;
    void recordViewRequest({ targetType, targetId })
      .then((snapshot) => {
        if (!cancelled) {
          setLoaded({ targetType, targetId, snapshot });
          setError(null);
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

  async function toggleLike(signedIn: boolean) {
    if (!state || !signedIn || pending) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const next = state.likedByMe
        ? await unlikeContentRequest({ targetType, targetId })
        : await likeContentRequest({ targetType, targetId });
      setLoaded({ targetType, targetId, snapshot: next });
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPending(false);
    }
  }

  return { state, pending, error, toggleLike };
}

export function EngagementBar({
  targetType,
  targetId,
  signedIn,
}: EngagementMarksProps) {
  const t = useTranslations('Social');
  const hydrated = useHydrated();
  const { state, pending, error, toggleLike } = useEngagement(
    targetType,
    targetId,
  );

  if (!state) {
    return error ? (
      <FormError>{error}</FormError>
    ) : (
      <div className="h-6" aria-busy="true" />
    );
  }

  const views = (
    <span
      className="inline-flex items-center gap-1.5 font-sans text-sm tabular-nums"
      aria-label={t('views', { count: state.viewCount })}
    >
      <EyeGlyph open className="h-6 w-6" />
      {state.viewCount}
    </span>
  );

  const heart = (
    <>
      <HeartGlyph filled={state.likedByMe} className="h-6 w-6" />
      <span className="font-sans text-sm tabular-nums">{state.likeCount}</span>
    </>
  );

  const likeControl = signedIn ? (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 disabled:opacity-40"
      disabled={!hydrated || pending}
      onClick={() => void toggleLike(signedIn)}
      aria-pressed={state.likedByMe}
      aria-label={
        pending ? t('liking') : state.likedByMe ? t('unlike') : t('like')
      }
    >
      {heart}
    </button>
  ) : (
    <Link
      href="/login"
      className="inline-flex items-center gap-1.5"
      aria-label={t('signInToLike')}
    >
      {heart}
    </Link>
  );

  return (
    <div>
      <div className="flex items-center gap-4">
        {likeControl}
        {views}
      </div>
      {error ? <FormError>{error}</FormError> : null}
    </div>
  );
}
