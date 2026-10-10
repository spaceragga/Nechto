'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { DialogueSummary } from '@nechto/api-contract';
import { StaffDesk } from '@/components/staff/staff-desk';
import { StaffDeskList } from '@/components/staff/staff-desk-list';
import { StaffThumbPair } from '@/components/staff/staff-thumb';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { hideDialogueRequest, unhideDialogueRequest } from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';
import { dialoguePath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type ModerationDialoguesDeskProps = {
  published: DialogueSummary[];
  hiddenDialogues: DialogueSummary[];
};

export function ModerationDialoguesDesk({
  published: initialPublished,
  hiddenDialogues: initialHidden,
}: ModerationDialoguesDeskProps) {
  const t = useTranslations('Staff');
  const tErrors = useTranslations('Errors');
  const [live, setLive] = useState(initialPublished);
  const [hidden, setHidden] = useState(initialHidden);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runItem(id: string, action: () => Promise<void>) {
    setPendingId(id);
    setError(null);
    try {
      await action();
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <StaffDesk
      title={t('dialogueLive')}
      lede={t('dialogueLiveLede')}
      meta={`${live.length} · ${hidden.length}`}
    >
      {error ? (
        <div className="mb-4">
          <FormError>{error}</FormError>
        </div>
      ) : null}
      <h3 className="text-sm tracking-wide opacity-70">{t('dialogueLive')}</h3>
      <StaffDeskList
        className="mt-3"
        items={live}
        keyOf={(item) => item.id}
        getSearchText={(item) =>
          `${item.title} ${item.left.title} ${item.right.title}`
        }
        empty={t('emptyDialogueLive')}
        renderItem={(item) => (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border border-white/15 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <StaffThumbPair
                leftSrc={item.left.imageUrl}
                rightSrc={item.right.imageUrl}
                leftAlt={item.left.title}
                rightAlt={item.right.title}
              />
              <Link
                href={dialoguePath(item.id)}
                className="min-w-0 truncate text-[var(--accent)]"
              >
                {item.title}
              </Link>
            </div>
            <Button
              type="button"
              disabled={pendingId === item.id}
              onClick={() =>
                void runItem(item.id, async () => {
                  const updated = await hideDialogueRequest(item.id);
                  setLive((current) =>
                    current.filter((row) => row.id !== item.id),
                  );
                  setHidden((current) => [updated, ...current]);
                })
              }
            >
              {t('hideDialogue')}
            </Button>
          </div>
        )}
      />

      <h3 className="mt-8 text-sm tracking-wide opacity-70">
        {t('dialogueHidden')}
      </h3>
      <StaffDeskList
        className="mt-3"
        items={hidden}
        keyOf={(item) => item.id}
        getSearchText={(item) => item.title}
        empty={t('emptyDialogueHidden')}
        renderItem={(item) => (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border border-white/15 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <StaffThumbPair
                leftSrc={item.left.imageUrl}
                rightSrc={item.right.imageUrl}
                leftAlt={item.left.title}
                rightAlt={item.right.title}
              />
              <span className="min-w-0 truncate">{item.title}</span>
            </div>
            <Button
              type="button"
              disabled={pendingId === item.id}
              onClick={() =>
                void runItem(item.id, async () => {
                  const updated = await unhideDialogueRequest(item.id);
                  setHidden((current) =>
                    current.filter((row) => row.id !== item.id),
                  );
                  setLive((current) => [updated, ...current]);
                })
              }
            >
              {t('unhideDialogue')}
            </Button>
          </div>
        )}
      />
    </StaffDesk>
  );
}
