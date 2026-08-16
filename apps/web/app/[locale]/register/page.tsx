import { AuthForm } from '@/components/auth-form';

export default function RegisterPage() {
  return (
    <main className="flex flex-1 items-center px-6 py-16">
      <AuthForm mode="register" />
    </main>
  );
}
