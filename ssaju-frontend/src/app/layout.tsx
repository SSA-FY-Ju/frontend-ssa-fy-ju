import type { Metadata, Viewport } from 'next';
/**
 * 웹폰트는 Fontsource 패키지로 빌드 시점에 자체 호스팅한다.
 * 이전 방식(landing.css 의 @import)은 CSS 번들 병합 시 @import 가 파일 중간으로
 * 밀려 CSS 스펙상 무효가 됐고, 의도한 웹폰트가 프로덕션에서 전부 미적용이었다.
 * 그다음 쓴 next/font/google 은 빌드마다 Google Fonts 에서 파일 134개를 받아오는데,
 * Google 응답에 확장자 없는 주소가 섞이면 next/font 가 그대로 빌드를 멈췄다.
 * Vercel 배포 5번 중 3번이 이 이유로 실패해, 같은 파일을 npm 으로 받도록 바꿨다.
 *
 * 둘 다 가변 폰트 파일 하나에 모든 굵기가 들어 있다. 한글 폰트는 글자 범위별로
 * 124조각으로 나뉘어 있어 화면에 실제로 쓰인 글자의 조각만 내려받는다.
 */
import '@fontsource-variable/noto-serif-kr';
import '@fontsource-variable/cormorant-garamond';
import '@fontsource-variable/cormorant-garamond/wght-italic.css';
import { Providers } from './providers';
import { Header } from '@/components/common/Header';
import { SessionRehydrationWrapper } from '@/components/providers/SessionRehydrationWrapper';
import { MockingProvider } from '@/components/providers/MockingProvider';
import StarryBackground from '@/components/landing/StarryBackground';
import './globals.css';
import '@/styles/landing.css';
import '@/styles/fonts.css';
// 본문용 Pretendard 는 의도적으로 미도입 - 아래 실측 근거의 결정.
// 1) CDN <link> 방식: 렌더 블로킹 1,286ms 2) 자체 호스팅: 랜딩에서만
// 슬라이스 12개 321KB + face 선언 CSS 38KB 가 크리티컬 경로를 1.5초 확장.
// Pretendard 는 시스템 UI 폰트와 시각 차가 작게 설계된 폰트라 비용 대비
// 효과가 없다. 본문은 시스템 폰트 스택을 유지하고, 페이지 정체성을 만드는
// 세리프 2종만 웹폰트로 로드한다.

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
