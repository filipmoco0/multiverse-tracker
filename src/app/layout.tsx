import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Multiverse Tracker | MCU & DCU Watchlist & Progress Tracker',
  description: 'Curated progress tracker for Marvel Cinematic Universe & DC Universe in release and chronological orders. Sync with Trakt.tv or track as Guest.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-[#0c0d14] text-zinc-100 min-h-screen flex flex-col selection:bg-amber-400 selection:text-black">
        {children}
      </body>
    </html>
  );
}
