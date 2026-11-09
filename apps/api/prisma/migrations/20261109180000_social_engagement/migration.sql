-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentView" (
    "id" TEXT NOT NULL,
    "viewerKey" TEXT NOT NULL,
    "userId" TEXT,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_profileId_key" ON "Follow"("followerId", "profileId");
CREATE INDEX "Follow_profileId_createdAt_idx" ON "Follow"("profileId", "createdAt");
CREATE UNIQUE INDEX "ContentLike_userId_targetType_targetId_key" ON "ContentLike"("userId", "targetType", "targetId");
CREATE INDEX "ContentLike_targetType_targetId_idx" ON "ContentLike"("targetType", "targetId");
CREATE UNIQUE INDEX "ContentView_viewerKey_targetType_targetId_key" ON "ContentView"("viewerKey", "targetType", "targetId");
CREATE INDEX "ContentView_targetType_targetId_idx" ON "ContentView"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentLike" ADD CONSTRAINT "ContentLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentView" ADD CONSTRAINT "ContentView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
