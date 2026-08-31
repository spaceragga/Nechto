-- AlterTable
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "directions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "websiteUrl" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "instagramUrl" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "telegramUrl" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "acceptPolicies" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Profile_slug_key" ON "Profile"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Profile_publishedAt_idx" ON "Profile"("publishedAt");

-- CreateTable
CREATE TABLE IF NOT EXISTS "Work" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Work_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Work_profileId_createdAt_idx" ON "Work"("profileId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Work_createdAt_idx" ON "Work"("createdAt");

-- AddForeignKey
DO $$
BEGIN
    ALTER TABLE "Work" ADD CONSTRAINT "Work_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
