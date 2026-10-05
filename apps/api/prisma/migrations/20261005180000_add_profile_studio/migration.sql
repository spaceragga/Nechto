-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "studioTitle" TEXT;
ALTER TABLE "Profile" ADD COLUMN "studioDescription" TEXT;
ALTER TABLE "Profile" ADD COLUMN "studioCoverKey" TEXT;
ALTER TABLE "Profile" ADD COLUMN "studioListedAt" TIMESTAMP(3);
ALTER TABLE "Profile" ADD COLUMN "studioFeaturedAt" TIMESTAMP(3);
ALTER TABLE "Profile" ADD COLUMN "studioHidden" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Profile_studioListedAt_idx" ON "Profile"("studioListedAt");

-- CreateIndex
CREATE INDEX "Profile_studioFeaturedAt_idx" ON "Profile"("studioFeaturedAt");
