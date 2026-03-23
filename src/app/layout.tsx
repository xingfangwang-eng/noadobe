import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NoAdobe - Simplest Design Feedback Tool',
  description: 'Stop paying for Adobe XD. NoAdobe is the simplest design feedback tool. Upload, share, and get comments instantly.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-WC4677QJMF"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-WC4677QJMF', {
              'project_name': 'src'
            });
          `}
        </Script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
