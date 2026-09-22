'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { StaffUser } from '@nechto/api-contract';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { useRouter } from '@/i18n/navigation';
import { updateStaffAccessRequest } from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';

type AdminUsersTableProps = {
  users: StaffUser[];
};

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  const t = useTranslations('Staff');
  const tErrors = useTranslations('Errors');
  const router = useRouter();
  const [rows, setRows] = useState(users);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function patchRow(id: string, patch: Partial<StaffUser>) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  async function save(row: StaffUser) {
    setPendingId(row.id);
    setError(null);
    setSavedId(null);
    try {
      const updated = await updateStaffAccessRequest(row.id, {
        isCurator: row.isCurator,
        isModerator: row.isModerator,
        isAdmin: row.isAdmin,
      });
      patchRow(row.id, updated);
      setSavedId(row.id);
      router.refresh();
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="mt-10 overflow-x-auto">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead>
          <tr className="border-b border-white/15">
            <th className="py-2 pr-4 font-normal opacity-70">{t('name')}</th>
            <th className="py-2 pr-4 font-normal opacity-70">{t('email')}</th>
            <th className="py-2 pr-4 font-normal opacity-70">{t('curator')}</th>
            <th className="py-2 pr-4 font-normal opacity-70">
              {t('moderator')}
            </th>
            <th className="py-2 pr-4 font-normal opacity-70">{t('admin')}</th>
            <th className="py-2 font-normal opacity-70">{t('save')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-white/10">
              <td className="py-3 pr-4">{row.displayName ?? t('unnamed')}</td>
              <td className="py-3 pr-4">{row.email}</td>
              <td className="py-3 pr-4">
                <input
                  type="checkbox"
                  aria-label={t('curator')}
                  checked={row.isCurator}
                  onChange={(event) =>
                    patchRow(row.id, { isCurator: event.target.checked })
                  }
                />
              </td>
              <td className="py-3 pr-4">
                <input
                  type="checkbox"
                  aria-label={t('moderator')}
                  checked={row.isModerator}
                  onChange={(event) =>
                    patchRow(row.id, { isModerator: event.target.checked })
                  }
                />
              </td>
              <td className="py-3 pr-4">
                <input
                  type="checkbox"
                  aria-label={t('admin')}
                  checked={row.isAdmin}
                  onChange={(event) =>
                    patchRow(row.id, { isAdmin: event.target.checked })
                  }
                />
              </td>
              <td className="py-3">
                <Button
                  type="button"
                  disabled={pendingId === row.id}
                  onClick={() => void save(row)}
                >
                  {savedId === row.id ? t('saved') : t('save')}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {error ? (
        <div className="mt-4">
          <FormError>{error}</FormError>
        </div>
      ) : null}
    </div>
  );
}
