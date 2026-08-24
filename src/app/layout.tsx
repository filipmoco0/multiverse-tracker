import type { Metadata, Viewport } from 'next';
import './globals.css';

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
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=6" />
        <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon.png?v=6" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png?v=6" />
        <link rel="shortcut icon" href="/favicon.ico?v=6" />
      </head>
      <body className="font-sans bg-[#0c0d14] text-zinc-100 min-h-screen flex flex-col selection:bg-amber-400 selection:text-black">
        {children}
      </body>
    </html>
  );
}
