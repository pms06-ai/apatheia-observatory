import type { Metadata } from 'next';
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import { Sidebar } from '@/components/layout/sidebar';
import { CommandPalette } from '@/components/ui/command-palette';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const playfair = Playfair_Display({
  variable: '--font-serif',
  subsets: ['latin'],
});

const jetbrains = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Apatheia Observatory — Political Rhetoric Tracker',
  description:
    'Track political rhetoric, media bias, coverage blind spots, and contradictions across the political spectrum.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} font-sans antialiased`}
      >
        <Providers>
          <TooltipProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-gold/20 focus:px-4 focus:py-2 focus:text-sm focus:text-gold"
            >
              Skip to content
            </a>
            <div className="flex h-dvh overflow-hidden">
              <Sidebar />
              <main id="main-content" className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
            <CommandPalette />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
