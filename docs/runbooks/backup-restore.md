# Backup and restore runbook

## What to back up

- PostgreSQL volume (`postgres_data`).
- Uploads volume (`uploads_data`) — avatars and works on local disk.

Keep copies off the production VPS.

## Backup

```sh
pg_dump --format=custom --no-owner --no-acl "$DATABASE_URL" > "nechto-$(date +%Y%m%d-%H%M%S).dump"
docker run --rm -v nechto_uploads_data:/data -v "$PWD":/backup alpine \
  tar czf /backup/nechto-uploads-$(date +%Y%m%d-%H%M%S).tgz -C /data .
```

Volume names depend on the compose project directory. Check with `docker volume ls`.

Record checksum, size, and Prisma migration version.

## Restore drill

1. Empty PostgreSQL 16 database outside production.
2. `pg_restore --clean --if-exists --no-owner --no-acl --dbname "$RESTORE_DATABASE_URL" backup.dump`
3. `npx prisma migrate status` against the restore.
4. Unpack uploads into the API uploads directory/volume.
5. Start the API with SMTP unset or pointed at a sink.
6. Check user/profile/work/report counts and that sample image URLs load.

Do this before public launch and monthly after.
