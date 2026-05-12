'use client';

/**
 * 고지 문구 오버레이 컴포넌트 (T053)
 *
 * 스펙:
 * - opacity 0.5 다크 오버레이 + 중앙 흰색 텍스트
 * - 1.5초 표시 후 500ms ease-in-out 페이드 아웃
 * - pointer-events: none (사용자 입력 차단)
 * - role="alert" aria-live="assertive" (접근성)
 */

interface DisclaimerOverlayProps {
  /** 오버레이 표시 여부 */
  isVisible: boolean;
  /** 페이드 아웃 진행 중 여부 */
  isFading: boolean;
}

export function DisclaimerOverlay({ isVisible, isFading }: DisclaimerOverlayProps) {
  if (!isVisible) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{
        // 페이드 아웃 애니메이션
        opacity: isFading ? 0 : 1,
        transition: 'opacity 500ms ease-in-out',
        pointerEvents: 'none',
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <p className="text-white text-center font-medium px-8
        text-lg    /* 모바일: 20px */
        sm:text-xl /* 태블릿: 24px */
        lg:text-2xl /* 데스크톱: 28px */
      ">
        본 사주는 재미로 보는 것이니 참고만 바랍니다
      </p>
    </div>
  );
}
