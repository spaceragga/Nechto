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

const empty: EngagementSnapshot = {
  likeCount: 0,
  viewCount: 0,
  likedByMe: false,
};

function useEngagement(targetType: EngagementTargetType, targetId: string) {
  const tErrors = useTranslations('Errors');
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

  async function toggleLike(signedIn: boolean) {
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

  return { state, pending, error, toggleLike };
}

function EngagementMarks({
  targetType,
  targetId,
  signedIn,
  onImage,
}: EngagementMarksProps & { onImage: boolean }) {
  const t = useTranslations('Social');
  const hydrated = useHydrated();
  const { state, pending, error, toggleLike } = useEngagement(
    targetType,
    targetId,
  );

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
      className="inline-flex items-center gap-1.5 opacity-90 transition-opacity hover:opacity-100 disabled:opacity-40"
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
      className="inline-flex items-center gap-1.5 opacity-90 transition-opacity hover:opacity-100"
      aria-label={t('signInToLike')}
    >
      {heart}
    </Link>
  );

  const row = (
    <div className="flex items-center gap-4 drop-shadow-[0_1px_2px_rgb(0_0_0_/_70%)]">
      {views}
      {likeControl}
    </div>
  );

  if (onImage) {
    return (
      <div className="pointer-events-auto absolute bottom-2 left-2 text-[var(--fg)]">
        {row}
        {error ? <FormError>{error}</FormError> : null}
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 max-w-md border-t border-white/15 pt-4">
      <div className="flex justify-center">{row}</div>
      {error ? <FormError>{error}</FormError> : null}
    </div>
  );
}

export function EngagementOverlay(props: EngagementMarksProps) {
  return <EngagementMarks {...props} onImage />;
}

export function EngagementBar(props: EngagementMarksProps) {
  return <EngagementMarks {...props} onImage={false} />;
}
