import type { Metadata, Viewport } from 'next';
import { Noto_Serif_KR, Cormorant_Garamond } from 'next/font/google';
import { Providers } from './providers';
import { Header } from '@/components/common/Header';
import { SessionRehydrationWrapper } from '@/components/providers/SessionRehydrationWrapper';
import { MockingProvider } from '@/components/providers/MockingProvider';
import StarryBackground from '@/components/landing/StarryBackground';
import './globals.css';
import '@/styles/landing.css';
// 본문용 Pretendard 는 의도적으로 미도입 - 아래 실측 근거의 결정.
// 1) CDN <link> 방식: 렌더 블로킹 1,286ms 2) 자체 호스팅: 랜딩에서만
// 슬라이스 12개 321KB + face 선언 CSS 38KB 가 크리티컬 경로를 1.5초 확장.
// Pretendard 는 시스템 UI 폰트와 시각 차가 작게 설계된 폰트라 비용 대비
// 효과가 없다. 본문은 시스템 폰트 스택을 유지하고, 페이지 정체성을 만드는
// 세리프 2종만 next/font 로 로드한다.

/**
 * 웹폰트는 next/font 로 빌드 시점에 자체 호스팅한다.
 * 이전 방식(landing.css 의 @import)은 CSS 번들 병합 시 @import 가 파일 중간으로
 * 밀려 CSS 스펙상 무효가 됐고, 의도한 웹폰트가 프로덕션에서 전부 미적용이었다.
 * 사용 중인 굵기만 로드한다(감사 결과: serif 400/500/600, serif-en 400/500/600+italic).
 */
const notoSerifKr = Noto_Serif_KR({
  // 실사용 굵기만(400 본문 악센트·600 제목). 한글 폰트는 굵기당 @font-face 가
  // 124개씩 생겨 크리티컬 CSS 를 불리므로 안 쓰는 굵기는 선언 자체를 줄인다.
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-serif-kr',
  // 한글 폰트는 unicode-range 슬라이스가 수백 개라 특정 subset preload 가 불가.
  // preload 를 끄면 슬라이스 @font-face 만 선언되고 실제 사용 글리프만 다운로드된다.
  preload: false,
});

const cormorantGaramond = Cormorant_Garamond({
  // 실사용 변형만: 400(이탤릭 악센트)·600(카드 제목·브랜드). preload 를 끄면
  // 6종 변형 전부(약 230KB)가 전 페이지에 preload 되는 것을 막고
  // 실제 렌더되는 변형만 온디맨드로 받는다.
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif-en',
  preload: false,
  // 자동 생성되는 사이즈 조정 폴백 face 는 unicode-range 제한이 없어
  // 스택 뒤의 Noto Serif KR 로 한글이 넘어가지 못하게 막는다.
  // --serif-en 은 "영문 Cormorant + 한글 Noto" 조합이 의도라 폴백을 끈다.
  adjustFontFallback: false,
});

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
    <html lang="ko" className={`${notoSerifKr.variable} ${cormorantGaramond.variable}`}>
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
