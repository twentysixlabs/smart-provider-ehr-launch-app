import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'SMART on FHIR Provider EHR Launch App',
  description:
    'A production-ready SMART on FHIR application for EHR provider launches with support for Epic, Cerner, and Athena',
  keywords: [
    'SMART on FHIR',
    'EHR',
    'Healthcare',
    'FHIR',
    'Epic',
    'Cerner',
    'Athena',
    'Provider Launch',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
