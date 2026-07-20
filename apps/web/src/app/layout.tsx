import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/sonner';
import { PwaRegister } from '@/components/pwa/PwaRegister';

const geistSans = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f4' },
    { media: '(prefers-color-scheme: dark)', color: '#1c1917' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://hikely.app'),
  title: {
    default: 'Hikely — Randonnées collaboratives',
    template: '%s | Hikely',
  },
  description:
    'Découvrez, planifiez et partagez vos randonnées avec la communauté Hikely. Tracés GPX, avis, photos et cartes interactives 3D pour tous les niveaux.',
  keywords: ['randonnée', 'hiking', 'trail', 'GPX', 'trekking', 'montagne', 'nature', 'outdoor', 'carte 3D'],
  authors: [{ name: 'Hikely' }],
  creator: 'Hikely',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://hikely.app',
    siteName: 'Hikely',
    title: 'Hikely — Randonnées collaboratives',
    description: 'Découvrez et partagez vos randonnées avec la communauté.',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Hikely' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hikely — Randonnées collaboratives',
    description: 'Découvrez et partagez vos randonnées avec la communauté.',
    images: ['/og-default.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="dns-prefetch" href="https://tile.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://server.arcgisonline.com" />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster richColors position="bottom-right" />
          <PwaRegister />
        </Providers>
      </body>
    </html>
  );
}
