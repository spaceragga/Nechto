'use client';

import { useTranslations } from 'next-intl';
import { EyeGlyph } from '@/components/glyphs/eye-glyph';
import { HeartGlyph } from '@/components/glyphs/heart-glyph';

const ENGAGEMENT_ICON = 'h-5 w-5';

type TileMarksProps = {
  likeCount: number;
  viewCount: number;
  showViews?: boolean;
};

/** Read-only likes/views strip on a profile tile. Does not record a view. */
export function TileMarks({
  likeCount,
  viewCount,
  showViews = false,
}: TileMarksProps) {
  const t = useTranslations('Social');

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end gap-2 bg-gradient-to-t from-black/55 via-black/20 to-transparent px-3 pt-8 pb-2 text-white">
      <div className="flex items-center gap-3 text-sm tracking-wide">
        <span
          className="inline-flex items-center gap-2 opacity-90"
          aria-label={t('likes', { count: likeCount })}
        >
          <HeartGlyph className={ENGAGEMENT_ICON} />
          <span>{likeCount}</span>
        </span>
        {showViews ? (
          <span
            className="inline-flex items-center gap-2 opacity-70"
            aria-label={t('views', { count: viewCount })}
          >
            <EyeGlyph open className={ENGAGEMENT_ICON} />
            <span>{viewCount}</span>
          </span>
        ) : null}
      </div>
    </div>
  );
}
