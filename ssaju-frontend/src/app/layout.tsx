import type { Metadata } from 'next';
import { Providers } from './providers';
import { Header } from '@/components/common/Header';
import './globals.css';

export const metadata: Metadata = {
  title: 'SSAju - 사주 기반 커리어 컨설팅',
  description: '당신의 관운을 분석하여 최적의 커리어 경로를 제시합니다.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'SSAju - 사주 기반 커리어 컨설팅',
    description: '당신의 관운을 분석하여 최적의 커리어 경로를 제시합니다.',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'SSAju',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SSAju - 사주 기반 커리어 컨설팅',
    description: '당신의 관운을 분석하여 최적의 커리어 경로를 제시합니다.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="ko">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Garamond:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
