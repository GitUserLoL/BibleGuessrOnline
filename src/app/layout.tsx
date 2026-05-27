import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BibleGuessr — How well do you know the Word?',
  description: 'A GeoGuessr-style Bible guessing game. Read a verse and guess where it appears in scripture.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <div className="page-wrapper min-h-screen flex flex-col">
          <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-[#080c18]/80">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-amber-400 text-xl hidden md:inline">✝</span>
                <span className="font-black text-lg tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  BibleGuessr
                </span>
              </Link>
              <nav className="flex items-center gap-4 text-sm text-white/50">
                <Link href="/leaderboard" className="hover:text-white transition-colors">
                  Leaderboard
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
