import { PrismaClient } from '@prisma/client';

export async function markEmailVerified(email: string): Promise<void> {
  const prisma = new PrismaClient({
    datasourceUrl:
      process.env.DATABASE_URL ??
      'postgresql://nechto:nechto@localhost:5432/nechto',
  });
  try {
    await prisma.user.update({
      where: { email },
      data: { emailVerifiedAt: new Date() },
    });
  } finally {
    await prisma.$disconnect();
  }
}
