-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "lede" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL,
    "coverWorkId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "featuredAt" TIMESTAMP(3),
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Article_profileId_createdAt_idx" ON "Article"("profileId", "createdAt");

-- CreateIndex
CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");

-- CreateIndex
CREATE INDEX "Article_featuredAt_idx" ON "Article"("featuredAt");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_coverWorkId_fkey" FOREIGN KEY ("coverWorkId") REFERENCES "Work"("id") ON DELETE SET NULL ON UPDATE CASCADE;
