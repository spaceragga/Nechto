import type { AuthUser } from '@nechto/api-contract';

export type AuthPrincipal = AuthUser & {
  sessionId: string;
  role: 'USER' | 'ADMIN';
};
