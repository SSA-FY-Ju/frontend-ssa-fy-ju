import type { Metadata } from 'next';
import { Providers } from './providers';
import { Header } from '@/components/common/Header';
import { SessionRehydrationWrapper } from '@/components/providers/SessionRehydrationWrapper';
import { MockingProvider } from '@/components/providers/MockingProvider';
import StarryBackground from '@/components/landing/StarryBackground';
import './globals.css';
import '@/styles/landing.css';

export const metadata: Metadata = {
  title: 'SSAju - 사주 기반 커리어 컨설팅',
  description: '당신의 관운을 분석하여 최적의 커리어 경로를 제시합니다.',
  // ?v=2 를 붙인 이유: 이전 favicon.ico 는 확장자만 .ico 인 macOS .icns 파일이라
  // 브라우저가 디코딩에 실패했고, 그 "아이콘 없음" 상태가 파비콘 캐시에 남는다.
  // 파일을 교체해도 URL 이 같으면 캐시를 다시 안 읽으므로 쿼리로 무효화한다.
  icons: {
    icon: '/favicon.ico?v=2',
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
        <StarryBackground />
        <Providers>
          <MockingProvider>
            <SessionRehydrationWrapper>
              <Header />
              {children}
            </SessionRehydrationWrapper>
          </MockingProvider>
        </Providers>
      </body>
    </html>
  );
}
