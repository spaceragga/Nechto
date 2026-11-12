'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
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

type EngagementContextValue = {
  signedIn: boolean;
  state: EngagementSnapshot;
  pending: boolean;
  error: string | null;
  toggleLike: () => void;
};

const EngagementContext = createContext<EngagementContextValue | null>(null);

function useEngagementState(
  targetType: EngagementTargetType,
  targetId: string,
  signedIn: boolean,
): EngagementContextValue {
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

  const toggleLike = useCallback(() => {
    if (!signedIn || pending) {
      return;
    }
    setPending(true);
    setError(null);
    void (
      state.likedByMe
        ? unlikeContentRequest({ targetType, targetId })
        : likeContentRequest({ targetType, targetId })
    )
      .then((next) => {
        setState(next);
      })
      .catch((caught) => {
        setError(mapApiErrorMessage(caught, tErrors));
      })
      .finally(() => {
        setPending(false);
      });
  }, [signedIn, pending, state.likedByMe, targetType, targetId, tErrors]);

  return useMemo(
    () => ({ signedIn, state, pending, error, toggleLike }),
    [signedIn, state, pending, error, toggleLike],
  );
}

function EngagementActions({ tone }: { tone: 'rail' | 'overlay' }) {
  const t = useTranslations('Social');
  const hydrated = useHydrated();
  const ctx = useContext(EngagementContext);
  if (!ctx) {
    return null;
  }
  const { signedIn, state, pending, error, toggleLike } = ctx;

  const counts = (
    <p className="font-sans text-sm">
      {t('views', { count: state.viewCount })}
      <span aria-hidden="true"> · </span>
      {t('likes', { count: state.likeCount })}
    </p>
  );
  const likeControl = signedIn ? (
    <Button
      type="button"
      className="shrink-0 px-3 py-1.5"
      disabled={!hydrated || pending}
      onClick={() => void toggleLike()}
      aria-pressed={state.likedByMe}
    >
      {pending ? t('liking') : state.likedByMe ? t('unlike') : t('like')}
    </Button>
  ) : (
    <p className="font-sans text-sm">
      <Link href="/login" className="text-[var(--accent)]">
        {t('signInToLike')}
      </Link>
    </p>
  );

  const row = (
    <div className="flex items-center justify-between gap-3">
      {counts}
      {likeControl}
    </div>
  );

  if (tone === 'overlay') {
    return (
      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[2]">
        <div className="pointer-events-auto rounded border border-white/25 bg-[var(--bg)]/90 px-3 py-2 text-left shadow-[0_8px_24px_rgb(0_0_0_/_45%)] backdrop-blur-sm">
          {row}
          {error ? <FormError>{error}</FormError> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-12 z-10 border-b border-white/15 bg-[var(--bg)] px-6 py-2">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-1">
        {row}
        {error ? <FormError>{error}</FormError> : null}
      </div>
    </div>
  );
}

export function EngagementScope({
  targetType,
  targetId,
  signedIn,
  children,
}: EngagementBarProps & { children: ReactNode }) {
  const value = useEngagementState(targetType, targetId, signedIn);

  return (
    <EngagementContext.Provider value={value}>
      {children}
    </EngagementContext.Provider>
  );
}

export function EngagementRail() {
  return <EngagementActions tone="rail" />;
}

export function EngagementOverlay({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`.trim()}>
      {children}
      <EngagementActions tone="overlay" />
    </div>
  );
}

export function EngagementBar(props: EngagementBarProps) {
  return (
    <EngagementScope {...props}>
      <EngagementRail />
    </EngagementScope>
  );
}
