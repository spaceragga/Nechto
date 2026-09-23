'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  STAFF_USER_SEARCH_MIN,
  type StaffAccess,
  type StaffUser,
} from '@nechto/api-contract';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { useRouter } from '@/i18n/navigation';
import { listAdminUsersRequest, updateStaffAccessRequest } from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';

const SEARCH_DEBOUNCE_MS = 250;

const FLAGS = ['isCurator', 'isModerator', 'isAdmin'] as const;

type AdminUsersTableProps = {
  initial?: StaffUser[];
};

export function AdminUsersTable({ initial = [] }: AdminUsersTableProps) {
  const t = useTranslations('Staff');
  const tErrors = useTranslations('Errors');
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rows, setRows] = useState(initial);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nameFilter = searchValue(name);
  const emailFilter = searchValue(email);
  const filtering = Boolean(nameFilter || emailFilter);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void listAdminUsersRequest({
        ...(nameFilter ? { name: nameFilter } : {}),
        ...(emailFilter ? { email: emailFilter } : {}),
      })
        .then((page) => {
          if (!cancelled) {
            setRows(page.items);
            setError(null);
          }
        })
        .catch((caught: unknown) => {
          if (!cancelled) {
            setRows([]);
            setError(mapApiErrorMessage(caught, tErrors));
          }
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [emailFilter, nameFilter, tErrors]);

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
    <div className="mt-10 overflow-x-auto p-0.5">
      <table className="w-max min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            <th className="overflow-visible py-2 pr-4 font-normal">
              <Input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t('searchName')}
                aria-label={t('searchName')}
                className="box-border w-40 appearance-none border-white/15 px-2 py-1"
              />
            </th>
            <th className="overflow-visible py-2 pr-4 font-normal">
              <Input
                type="text"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t('searchEmail')}
                aria-label={t('searchEmail')}
                className="box-border w-56 appearance-none border-white/15 px-2 py-1"
              />
            </th>
            <th className="whitespace-nowrap px-3 py-2 text-center font-normal opacity-70">
              {t('curator')}
            </th>
            <th className="whitespace-nowrap px-3 py-2 text-center font-normal opacity-70">
              {t('moderator')}
            </th>
            <th className="whitespace-nowrap px-3 py-2 text-center font-normal opacity-70">
              {t('admin')}
            </th>
            <th className="py-2 pl-3 font-normal opacity-70">{t('save')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-white/10">
              <td className="max-w-[14rem] truncate py-2 pr-4">
                {row.displayName ?? t('unnamed')}
              </td>
              <td className="py-2 pr-4 whitespace-nowrap">{row.email}</td>
              {FLAGS.map((flag) => (
                <td key={flag} className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    aria-label={t(flagLabel[flag])}
                    checked={row[flag]}
                    onChange={(event) =>
                      patchRow(row.id, { [flag]: event.target.checked })
                    }
                  />
                </td>
              ))}
              <td className="py-2 pl-3">
                <Button
                  type="button"
                  className="border-white/15 px-3 py-1"
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
      {filtering && rows.length === 0 && !error ? (
        <p className="mt-4 text-sm opacity-70">{t('emptyUsers')}</p>
      ) : null}
      {error ? (
        <div className="mt-4">
          <FormError>{error}</FormError>
        </div>
      ) : null}
    </div>
  );
}

const flagLabel = {
  isCurator: 'curator',
  isModerator: 'moderator',
  isAdmin: 'admin',
} as const satisfies Record<keyof StaffAccess, string>;

function searchValue(raw: string) {
  const value = raw.trim();
  return value.length >= STAFF_USER_SEARCH_MIN ? value : undefined;
}
