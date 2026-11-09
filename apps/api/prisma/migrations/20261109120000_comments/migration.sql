-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "workId" TEXT,
    "projectId" TEXT,
    "articleId" TEXT,
    "dialogueId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Comment_workId_createdAt_idx" ON "Comment"("workId", "createdAt");
CREATE INDEX "Comment_projectId_createdAt_idx" ON "Comment"("projectId", "createdAt");
CREATE INDEX "Comment_articleId_createdAt_idx" ON "Comment"("articleId", "createdAt");
CREATE INDEX "Comment_dialogueId_createdAt_idx" ON "Comment"("dialogueId", "createdAt");
CREATE INDEX "Comment_authorId_createdAt_idx" ON "Comment"("authorId", "createdAt");
CREATE INDEX "Notification_commentId_idx" ON "Notification"("commentId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_dialogueId_fkey" FOREIGN KEY ("dialogueId") REFERENCES "Dialogue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Comment" ADD CONSTRAINT "Comment_one_target" CHECK (
  (
    CASE WHEN "workId" IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN "projectId" IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN "articleId" IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN "dialogueId" IS NOT NULL THEN 1 ELSE 0 END
  ) = 1
);
