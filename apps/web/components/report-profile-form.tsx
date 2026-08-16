'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { REPORT_REASONS } from '@nechto/api-contract';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { reportProfileRequest } from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';

export function ReportProfileForm({ slug }: { slug: string }) {
  const t = useTranslations('Report');
  const tErrors = useTranslations('Errors');
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    setError(null);
    setPending(true);
    try {
      await reportProfileRequest(slug, {
        reason: data.get('reason') as (typeof REPORT_REASONS)[number],
        details: String(data.get('details') ?? '') || null,
        reporterEmail: String(data.get('reporterEmail') ?? '') || null,
      });
      setSent(true);
    } catch (requestError) {
      setError(mapApiErrorMessage(requestError, tErrors));
    } finally {
      setPending(false);
    }
  }

  if (sent) return <p className="mt-10 text-sm">{t('sent')}</p>;
  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        {t('open')}
      </Button>
    );
  }
  return (
    <form onSubmit={submit} className="mt-10 flex max-w-md flex-col gap-3">
      <label>
        {t('reason')}
        <select name="reason" className="w-full border p-2">
          {REPORT_REASONS.map((reason) => (
            <option key={reason} value={reason}>
              {t(`reasons.${reason}`)}
            </option>
          ))}
        </select>
      </label>
      <Textarea name="details" maxLength={2000} placeholder={t('details')} />
      <Input name="reporterEmail" type="email" placeholder={t('email')} />
      {error ? <FormError>{error}</FormError> : null}
      <Button type="submit" disabled={pending}>
        {t('submit')}
      </Button>
    </form>
  );
}
