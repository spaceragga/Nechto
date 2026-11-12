import { setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function TopWorksRedirectPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect({ href: '/hanging', locale });
}
