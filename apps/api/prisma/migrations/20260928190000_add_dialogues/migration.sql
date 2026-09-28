-- CreateTable
CREATE TABLE "Dialogue" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "leftWorkId" TEXT NOT NULL,
    "rightWorkId" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "featuredAt" TIMESTAMP(3),
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dialogue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Dialogue_publishedAt_idx" ON "Dialogue"("publishedAt");

-- CreateIndex
CREATE INDEX "Dialogue_featuredAt_idx" ON "Dialogue"("featuredAt");

-- CreateIndex
CREATE INDEX "Dialogue_createdByUserId_idx" ON "Dialogue"("createdByUserId");

-- AddForeignKey
ALTER TABLE "Dialogue" ADD CONSTRAINT "Dialogue_leftWorkId_fkey" FOREIGN KEY ("leftWorkId") REFERENCES "Work"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dialogue" ADD CONSTRAINT "Dialogue_rightWorkId_fkey" FOREIGN KEY ("rightWorkId") REFERENCES "Work"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dialogue" ADD CONSTRAINT "Dialogue_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
