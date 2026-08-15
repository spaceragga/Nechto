import { AuthRecoveryForm } from '@/components/auth-recovery-form';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <AuthRecoveryForm mode="verify" token={(await searchParams).token ?? ''} />
  );
}
