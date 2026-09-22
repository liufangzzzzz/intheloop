import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.ITL_PUBLIC_ORIGIN || 'https://intheloop.geekpark.net'),
  title: 'In The Loop · 具身现场',
  description: '来自中国的具身智能文章、播客与现场观察。',
  applicationName: 'In The Loop',
  icons: {
    icon: '/itl-logo-black.png',
    apple: '/itl-logo-black.png',
  },
  openGraph: {
    title: 'In The Loop · 具身现场',
    description: '来自中国的具身智能文章、播客与现场观察。',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'In The Loop · 具身现场',
    description: '来自中国的具身智能文章、播客与现场观察。',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
