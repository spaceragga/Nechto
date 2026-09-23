ALTER TABLE "User" ADD COLUMN "isCurator" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "isModerator" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;

UPDATE "User" SET "isAdmin" = true WHERE email = 'artist1@nechto.test';
