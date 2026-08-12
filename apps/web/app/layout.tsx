import type { ReactNode } from 'react';
import './globals.css';
import '@/lib/env';

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return children;
}
