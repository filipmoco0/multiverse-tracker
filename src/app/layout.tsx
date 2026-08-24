import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PwaInstallPrompt } from '@/components/pwa/PwaInstallPrompt';

export const viewport: Viewport = {
  themeColor: '#0c0d14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Multiverse Tracker | MCU & DCU Watchlist & Progress Tracker',
  description: 'Curated progress tracker for Marvel Cinematic Universe & DC Universe in release and chronological orders. Sync with Trakt.tv or track as Guest.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Multiverse',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Multiverse" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body className="font-sans bg-[#0c0d14] text-zinc-100 min-h-screen flex flex-col selection:bg-amber-400 selection:text-black">
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
