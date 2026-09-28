'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { DialogueSummary } from '@nechto/api-contract';
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
    <section className="mt-10">
      <h2 className="text-sm tracking-wide opacity-70">{t('dialogueLive')}</h2>
      <p className="mt-2 max-w-2xl text-sm opacity-70">
        {t('dialogueLiveLede')}
      </p>
      {error ? (
        <div className="mt-4">
          <FormError>{error}</FormError>
        </div>
      ) : null}
      {live.length === 0 ? (
        <p className="mt-4 text-sm opacity-70">{t('emptyDialogueLive')}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {live.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 border border-white/15 px-4 py-3"
            >
              <Link
                href={dialoguePath(item.id)}
                className="text-[var(--accent)]"
              >
                {item.title}
              </Link>
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
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-10 text-sm tracking-wide opacity-70">
        {t('dialogueHidden')}
      </h2>
      {hidden.length === 0 ? (
        <p className="mt-4 text-sm opacity-70">{t('emptyDialogueHidden')}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {hidden.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 border border-white/15 px-4 py-3"
            >
              <span>{item.title}</span>
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
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
