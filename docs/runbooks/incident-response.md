# Incident response runbook

## Severity

- **SEV-1:** data exposure, account takeover at scale, destructive data loss, or total outage.
- **SEV-2:** major feature unavailable, uploads failing, email delivery failing, or elevated error rate.
- **SEV-3:** isolated user issue or degraded non-critical flow.

## First 15 minutes

1. Name an incident lead and start a timestamped log.
2. Preserve logs and database evidence; do not delete suspicious records.
3. Contain the issue: revoke affected sessions, rotate compromised secrets, disable registration/uploads, or roll back the application image.
4. Check API health, container restarts, database saturation, storage errors, SMTP errors, rate-limit events, and recent deploys.
5. Post a user-facing status update for SEV-1/2.

## Security events

- Rotate JWT, database, S3, SMTP, CI, and host credentials according to the exposed boundary.
- Revoking the JWT secret logs out every user. Individual sessions can be revoked in `Session`.
- Suspend abusive profiles instead of deleting evidence.
- Export relevant moderation audit records and immutable infrastructure logs.
- Legal owner decides notification obligations and timelines.

## Recovery

Restore service in stages, validate the core creator flow, monitor error and latency rates, then close containment controls. Within 72 hours, publish an internal postmortem with root cause, impact, detection gap, corrective owners, and deadlines.
