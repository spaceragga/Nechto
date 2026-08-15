# Backup and restore runbook

## Schedule and retention

- PostgreSQL: encrypted daily logical backup, seven daily copies, five weekly copies, twelve monthly copies.
- S3 media: bucket versioning and lifecycle protection; retain deleted versions for at least 30 days.
- Store backups in a separate account or provider from the production workload.
- Alert if a scheduled backup is missing, too small, or cannot be decrypted.

## Backup

Run from a trusted host with production credentials:

```sh
pg_dump --format=custom --no-owner --no-acl "$DATABASE_URL" > "nechto-$(date +%Y%m%d-%H%M%S).dump"
```

Encrypt and upload the dump to the backup account. Record checksum, size, migration version, start time, and completion time.

## Restore drill

1. Provision an empty PostgreSQL 16 database outside production.
2. Restore with `pg_restore --clean --if-exists --no-owner --no-acl --dbname "$RESTORE_DATABASE_URL" backup.dump`.
3. Run `npx prisma migrate status` against the restored database.
4. Start the API against the restored database with outbound email disabled.
5. Verify user, profile, work, report, session, and metric counts; sample media keys against S3.
6. Record achieved RPO/RTO and fix every discrepancy.

Perform this drill before launch and monthly thereafter.
