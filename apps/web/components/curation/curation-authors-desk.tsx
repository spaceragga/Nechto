'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  HOME_AUTHOR_SELECTION_MAX,
  type PublicProfileWithWorks,
} from '@nechto/api-contract';
import { StaffDesk } from '@/components/staff/staff-desk';
import { StaffDeskList } from '@/components/staff/staff-desk-list';
import { StaffThumb } from '@/components/staff/staff-thumb';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import {
  selectHomeCreatorRequest,
  unselectHomeCreatorRequest,
} from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';
import { profilePath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type CurationAuthorsDeskProps = {
  creators: PublicProfileWithWorks[];
  selectionCreators: PublicProfileWithWorks[];
};

export function CurationAuthorsDesk({
  creators: initialCreators,
  selectionCreators: initialSelection,
}: CurationAuthorsDeskProps) {
  const t = useTranslations('Staff');
  const tErrors = useTranslations('Errors');
  const [creators, setCreators] = useState(initialCreators);
  const [selection, setSelection] = useState(initialSelection);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function select(slug: string) {
    setPendingSlug(slug);
    setError(null);
    try {
      const updated = await selectHomeCreatorRequest(slug);
      setSelection((current) => [
        updated,
        ...current.filter((item) => item.slug !== slug),
      ]);
      setCreators((current) =>
        current.map((item) => (item.slug === slug ? updated : item)),
      );
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPendingSlug(null);
    }
  }

  async function unselect(slug: string) {
    setPendingSlug(slug);
    setError(null);
    try {
      const updated = await unselectHomeCreatorRequest(slug);
      setSelection((current) => current.filter((item) => item.slug !== slug));
      setCreators((current) =>
        current.map((item) => (item.slug === slug ? updated : item)),
      );
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPendingSlug(null);
    }
  }

  const withSlug = creators.filter(
    (creator): creator is PublicProfileWithWorks & { slug: string } =>
      Boolean(creator.slug),
  );

  return (
    <StaffDesk
      title={t('authorSelection')}
      lede={t('authorSelectionLede', { max: HOME_AUTHOR_SELECTION_MAX })}
      meta={
        selection.length > 0
          ? `${selection.length}/${HOME_AUTHOR_SELECTION_MAX}`
          : t('deskAuto')
      }
    >
      {error ? (
        <div className="mb-4">
          <FormError>{error}</FormError>
        </div>
      ) : null}
      {selection.length === 0 ? (
        <p className="text-base opacity-70">{t('emptyAuthorSelection')}</p>
      ) : (
        <StaffDeskList
          items={selection.filter(
            (creator): creator is PublicProfileWithWorks & { slug: string } =>
              Boolean(creator.slug),
          )}
          keyOf={(creator) => creator.slug}
          getSearchText={(creator) =>
            `${creator.displayName ?? ''} ${creator.slug}`
          }
          empty={t('emptyAuthorSelection')}
          renderItem={(creator) => (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <StaffThumb
                  src={creator.avatarUrl}
                  alt={creator.displayName ?? creator.slug}
                />
                <div className="min-w-0">
                  <Link
                    href={profilePath(creator.slug)}
                    className="font-serif text-lg tracking-wide"
                  >
                    {creator.displayName ?? creator.slug}
                  </Link>
                </div>
              </div>
              <Button
                type="button"
                disabled={pendingSlug === creator.slug}
                onClick={() => void unselect(creator.slug)}
              >
                {t('authorSelectionRemove')}
              </Button>
            </div>
          )}
        />
      )}
      <h3 className="mt-8 text-sm tracking-wide opacity-70">
        {t('authorSelectionPool')}
      </h3>
      <StaffDeskList
        className="mt-3"
        items={withSlug}
        keyOf={(creator) => creator.slug}
        getSearchText={(creator) =>
          `${creator.displayName ?? ''} ${creator.slug}`
        }
        empty={t('emptyCreatorsCuration')}
        renderItem={(creator) => {
          const selected = Boolean(creator.homeSelectionAt);
          return (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <StaffThumb
                  src={creator.avatarUrl}
                  alt={creator.displayName ?? creator.slug}
                />
                <div className="min-w-0">
                  <Link
                    href={profilePath(creator.slug)}
                    className="font-serif text-lg tracking-wide"
                  >
                    {creator.displayName ?? creator.slug}
                  </Link>
                  <p className="mt-1 text-sm opacity-70">{creator.slug}</p>
                </div>
              </div>
              {selected ? (
                <Button
                  type="button"
                  disabled={pendingSlug === creator.slug}
                  onClick={() => void unselect(creator.slug)}
                >
                  {t('authorSelectionRemove')}
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={
                    pendingSlug === creator.slug ||
                    selection.length >= HOME_AUTHOR_SELECTION_MAX
                  }
                  onClick={() => void select(creator.slug)}
                >
                  {t('authorSelectionAdd')}
                </Button>
              )}
            </div>
          );
        }}
      />
    </StaffDesk>
  );
}
