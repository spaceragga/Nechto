import { AuthRecoveryForm } from '@/components/auth-recovery-form';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <AuthRecoveryForm mode="reset" token={(await searchParams).token ?? ''} />
  );
}
