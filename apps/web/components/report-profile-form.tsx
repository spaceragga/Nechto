'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { REPORT_REASONS, type ReportReason } from '@nechto/api-contract';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { useHydrated } from '@/hooks/use-hydrated';
import { createReportRequest } from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';

type ReportProfileFormProps = {
  slug: string;
  viewerEmail?: string;
};

export function ReportProfileForm({
  slug,
  viewerEmail,
}: ReportProfileFormProps) {
  const t = useTranslations('Report');
  const tErrors = useTranslations('Errors');
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>('spam');
  const [details, setDetails] = useState('');
  const [email, setEmail] = useState(viewerEmail ?? '');
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setPending(true);
    setError(null);
    try {
      await createReportRequest({
        slug,
        reason,
        details,
        email: email.trim() || undefined,
      });
      setSent(true);
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <p className="mt-6 text-sm opacity-70" role="status">
        {t('sent')}
      </p>
    );
  }

  if (!open) {
    return (
      <div className="mt-6">
        <button
          type="button"
          className="font-sans text-sm text-[var(--accent)] underline-offset-4 hover:underline"
          onClick={() => setOpen(true)}
        >
          {t('open')}
        </button>
      </div>
    );
  }

  return (
    <form
      className="mt-6 flex max-w-md flex-col gap-4 border border-white/10 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <p className="font-sans text-sm tracking-wide opacity-70">{t('lede')}</p>
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('reason')}</span>
        <select
          className="rounded border border-white/20 bg-transparent px-3 py-2"
          value={reason}
          onChange={(event) => setReason(event.target.value as ReportReason)}
        >
          {REPORT_REASONS.map((item) => (
            <option key={item} value={item}>
              {t(`reasons.${item}`)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('details')}</span>
        <textarea
          className="min-h-24 rounded border border-white/20 bg-transparent px-3 py-2"
          value={details}
          maxLength={2000}
          onChange={(event) => setDetails(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('email')}</span>
        <Input
          type="email"
          value={email}
          autoComplete="email"
          required={!viewerEmail}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      {error ? <FormError>{error}</FormError> : null}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending || !hydrated}>
          {pending ? t('submitting') : t('submit')}
        </Button>
        <Button
          type="button"
          disabled={pending}
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
        >
          {t('cancel')}
        </Button>
      </div>
    </form>
  );
}
