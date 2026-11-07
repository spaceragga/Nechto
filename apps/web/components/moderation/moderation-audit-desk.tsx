'use client';

import { useTranslations } from 'next-intl';
import {
  isModerationAction,
  type ModerationAuditEntry,
} from '@nechto/api-contract';
import { StaffDesk } from '@/components/staff/staff-desk';
import { StaffDeskList } from '@/components/staff/staff-desk-list';

type ModerationAuditDeskProps = {
  actions: ModerationAuditEntry[];
};

export function ModerationAuditDesk({ actions }: ModerationAuditDeskProps) {
  const t = useTranslations('Staff');

  return (
    <StaffDesk
      title={t('auditLog')}
      lede={t('auditLogLede')}
      meta={`${actions.length}`}
    >
      <StaffDeskList
        items={actions}
        keyOf={(item) => item.id}
        getSearchText={(item) =>
          `${item.action} ${item.targetType} ${item.targetId} ${item.actor.email} ${item.reportId ?? ''}`
        }
        empty={t('emptyAuditLog')}
        renderItem={(item) => (
          <div className="border-b border-white/10 py-3">
            <p className="font-serif text-base tracking-wide">
              {isModerationAction(item.action)
                ? t(`auditActions.${item.action}`)
                : item.action}
            </p>
            <p className="mt-1 text-sm opacity-70">
              {item.targetType}
              {' · '}
              {item.targetId}
            </p>
            <p className="mt-1 text-sm opacity-50">
              {item.actor.email}
              {' · '}
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>
        )}
      />
    </StaffDesk>
  );
}
