import { Prisma } from '@prisma/client';

export function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

export function isUniqueConstraintOn(error: unknown, field: string): boolean {
  if (!isUniqueConstraintError(error)) {
    return false;
  }

  const target = (error as Prisma.PrismaClientKnownRequestError).meta?.target;
  if (Array.isArray(target)) {
    return target.includes(field);
  }
  if (typeof target === 'string') {
    return target.includes(field);
  }
  return false;
}
