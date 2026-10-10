-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "homeFeaturedAt" TIMESTAMP(3),
ADD COLUMN "homeSelectionAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Work" ADD COLUMN "featuredAt" TIMESTAMP(3),
ADD COLUMN "hangingAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "featuredAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Profile_homeFeaturedAt_idx" ON "Profile"("homeFeaturedAt");

-- CreateIndex
CREATE INDEX "Profile_homeSelectionAt_idx" ON "Profile"("homeSelectionAt");

-- CreateIndex
CREATE INDEX "Work_featuredAt_idx" ON "Work"("featuredAt");

-- CreateIndex
CREATE INDEX "Work_hangingAt_idx" ON "Work"("hangingAt");

-- CreateIndex
CREATE INDEX "Project_featuredAt_idx" ON "Project"("featuredAt");
