CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectBlock" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "workId" TEXT,
    "body" TEXT NOT NULL DEFAULT '',
    "showTitle" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProjectBlock_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Project_profileId_createdAt_idx" ON "Project"("profileId", "createdAt");

CREATE UNIQUE INDEX "ProjectBlock_projectId_position_key" ON "ProjectBlock"("projectId", "position");

CREATE INDEX "ProjectBlock_workId_idx" ON "ProjectBlock"("workId");

ALTER TABLE "Project"
ADD CONSTRAINT "Project_profileId_fkey"
FOREIGN KEY ("profileId") REFERENCES "Profile"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectBlock"
ADD CONSTRAINT "ProjectBlock_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectBlock"
ADD CONSTRAINT "ProjectBlock_workId_fkey"
FOREIGN KEY ("workId") REFERENCES "Work"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Work" ADD COLUMN "hidden" BOOLEAN NOT NULL DEFAULT false;
