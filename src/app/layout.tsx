import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/app-provider';
import AppShell from '@/components/app-shell';
import { Toaster } from '@/components/ui/toaster';


export const metadata: Metadata = {
  title: 'Shipment Journey Tracker',
  description: 'Monitor your shipments in real-time.',
};

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppProvider>
          <AppShell>{children}</AppShell>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
