import type { Metadata, Viewport } from 'next';
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

/**
 * charSet·viewport 를 JSX로 직접 쓰지 않는 이유:
 * App Router는 metadata/viewport export를 보고 같은 태그를 스스로 주입한다.
 * <head>에 수동으로 또 넣으면 태그가 2개씩 생기고(viewport ×2, charset ×2)
 * 서버 HTML과 클라이언트 트리가 어긋나 하이드레이션이 깨진다(React #418 → #423).
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/*
          tailwind.config.ts 의 font-heading(['Garamond', ...])이 globals.css 에서
          쓰이므로 이 링크는 살아있는 의존성이다. 렌더 블로킹 요청이라는 문제는
          남아있으므로 폰트 전체를 next/font 로 옮기는 단계에서 함께 정리한다.
        */}
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
