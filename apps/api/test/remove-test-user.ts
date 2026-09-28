import type { PrismaClient } from '@prisma/client';

/** Drop a published e2e account so leftover files in uploads-test cannot 404 on the house. */
export async function removeTestUser(prisma: PrismaClient, email: string) {
  await prisma.profile.updateMany({
    where: { user: { email } },
    data: { publishedAt: null },
  });
  await prisma.dialogue.deleteMany({
    where: {
      OR: [
        { leftWork: { profile: { user: { email } } } },
        { rightWork: { profile: { user: { email } } } },
        { createdBy: { email } },
      ],
    },
  });
  await prisma.project.deleteMany({
    where: { profile: { user: { email } } },
  });
  await prisma.user.deleteMany({ where: { email } });
}
