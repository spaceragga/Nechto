'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  DIALOGUE_NOTE_MAX,
  DIALOGUE_TITLE_MAX,
  type DialogueSummary,
  type WorkWithAuthor,
} from '@nechto/api-contract';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  createDialogueRequest,
  deleteDialogueRequest,
  featureDialogueRequest,
  publishDialogueRequest,
  unfeatureDialogueRequest,
  unpublishDialogueRequest,
} from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';
import { dialoguePath, workPath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type CurationDialoguesDeskProps = {
  pairings: DialogueSummary[];
  featuredDialogue: DialogueSummary | null;
  works: WorkWithAuthor[];
};

function WorkSelect({
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { id: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span>{label}</span>
      <select
        className="rounded border border-white/20 bg-[var(--bg)] px-3 py-2 text-[var(--fg)] [color-scheme:dark]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((work) => (
          <option
            key={work.id}
            value={work.id}
            className="bg-[var(--bg)] text-[var(--fg)]"
          >
            {work.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CurationDialoguesDesk({
  pairings: initial,
  featuredDialogue: initialFeatured,
  works,
}: CurationDialoguesDeskProps) {
  const t = useTranslations('Staff');
  const tErrors = useTranslations('Errors');
  const [pairings, setPairings] = useState(initial);
  const [featured, setFeatured] = useState(initialFeatured);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [leftWorkId, setLeftWorkId] = useState('');
  const [rightWorkId, setRightWorkId] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const workOptions = useMemo(
    () =>
      works.map((work) => ({
        id: work.id,
        label: `${work.title} — ${work.author.displayName}`,
      })),
    [works],
  );

  function replacePairing(updated: DialogueSummary) {
    setPairings((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
  }

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

  async function createPair(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !leftWorkId || !rightWorkId) {
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const created = await createDialogueRequest({
        title: title.trim(),
        note: note.trim(),
        leftWorkId,
        rightWorkId,
      });
      setPairings((current) => [created, ...current]);
      setTitle('');
      setNote('');
      setLeftWorkId('');
      setRightWorkId('');
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-sm tracking-wide opacity-70">{t('pairings')}</h2>
      <p className="mt-2 max-w-2xl text-sm opacity-70">{t('pairingsLede')}</p>

      {featured ? (
        <p className="mt-4 text-sm">
          {t('featuredDialogueNow')}:{' '}
          <Link
            href={dialoguePath(featured.id)}
            className="text-[var(--accent)]"
          >
            {featured.title}
          </Link>
        </p>
      ) : (
        <p className="mt-4 text-sm opacity-70">{t('featuredDialogueNone')}</p>
      )}

      <form
        onSubmit={createPair}
        className="mt-6 flex max-w-xl flex-col gap-3"
        aria-label={t('createPairing')}
      >
        <label className="flex flex-col gap-2 text-sm">
          <span>{t('pairingTitle')}</span>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={DIALOGUE_TITLE_MAX}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span>{t('pairingNote')}</span>
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={DIALOGUE_NOTE_MAX}
            rows={3}
          />
        </label>
        <WorkSelect
          label={t('pairingLeft')}
          value={leftWorkId}
          onChange={setLeftWorkId}
          placeholder={t('pairingPickWork')}
          options={workOptions}
        />
        <WorkSelect
          label={t('pairingRight')}
          value={rightWorkId}
          onChange={setRightWorkId}
          placeholder={t('pairingPickWork')}
          options={workOptions}
        />
        <Button
          type="submit"
          disabled={creating || !title.trim() || !leftWorkId || !rightWorkId}
        >
          {creating ? t('creatingPairing') : t('createPairing')}
        </Button>
      </form>

      {error ? (
        <div className="mt-4">
          <FormError>{error}</FormError>
        </div>
      ) : null}

      {pairings.length === 0 ? (
        <p className="mt-6 text-sm opacity-70">{t('emptyPairings')}</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {pairings.map((item) => {
            const busy = pendingId === item.id;
            const published = Boolean(item.publishedAt);
            const isFeatured = Boolean(item.featuredAt);
            return (
              <li
                key={item.id}
                className="flex flex-col gap-3 border border-white/15 px-4 py-3"
              >
                <div>
                  {published ? (
                    <Link
                      href={dialoguePath(item.id)}
                      className="font-serif text-lg text-[var(--accent)]"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <p className="font-serif text-lg">{item.title}</p>
                  )}
                  <p className="mt-1 text-sm opacity-70">
                    <Link
                      href={workPath(item.left.author.slug, item.left.id)}
                      className="text-[var(--accent)]"
                    >
                      {item.left.title}
                    </Link>
                    {' / '}
                    <Link
                      href={workPath(item.right.author.slug, item.right.id)}
                      className="text-[var(--accent)]"
                    >
                      {item.right.title}
                    </Link>
                  </p>
                  {item.note ? (
                    <p className="mt-2 text-sm opacity-80">{item.note}</p>
                  ) : null}
                  <p className="mt-2 text-xs opacity-60">
                    {published
                      ? isFeatured
                        ? t('statusFeatured')
                        : t('statusPublished')
                      : t('statusDraft')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {published ? (
                    <>
                      <Button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void runItem(item.id, async () => {
                            const updated = await unpublishDialogueRequest(
                              item.id,
                            );
                            setFeatured((current) =>
                              current?.id === item.id ? null : current,
                            );
                            replacePairing(updated);
                          })
                        }
                      >
                        {t('unpublishPairing')}
                      </Button>
                      {isFeatured ? (
                        <Button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void runItem(item.id, async () => {
                              const updated = await unfeatureDialogueRequest(
                                item.id,
                              );
                              setFeatured(null);
                              replacePairing(updated);
                            })
                          }
                        >
                          {t('unfeatureHome')}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void runItem(item.id, async () => {
                              const updated = await featureDialogueRequest(
                                item.id,
                              );
                              setFeatured(updated);
                              setPairings((current) =>
                                current.map((row) =>
                                  row.id === item.id
                                    ? updated
                                    : { ...row, featuredAt: null },
                                ),
                              );
                            })
                          }
                        >
                          {t('featureHome')}
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void runItem(item.id, async () => {
                          replacePairing(await publishDialogueRequest(item.id));
                        })
                      }
                    >
                      {t('publishPairing')}
                    </Button>
                  )}
                  <Button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void runItem(item.id, async () => {
                        await deleteDialogueRequest(item.id);
                        setFeatured((current) =>
                          current?.id === item.id ? null : current,
                        );
                        setPairings((current) =>
                          current.filter((row) => row.id !== item.id),
                        );
                      })
                    }
                  >
                    {t('deletePairing')}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
