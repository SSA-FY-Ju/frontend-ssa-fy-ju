'use client';

import { useCallback } from 'react';

/**
 * 기기 감지 훅 - 팝업/리다이렉트 방식 자동 선택
 *
 * 768px 기준:
 * - ≥768px (태블릿/데스크톱): 팝업 (window.open)
 * - <768px (모바일): 리다이렉트 (window.location)
 */
export function usePlatformDetect() {
  const isMobile = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  }, []);

  const openOAuthWindow = useCallback(
    (url: string, onSuccess?: () => void): void => {
      if (isMobile()) {
        // 모바일: 리다이렉트
        window.location.href = url;
      } else {
        // 데스크톱/태블릿: 팝업
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          url,
          'oauth',
          `width=${width},height=${height},left=${left},top=${top}`,
        );

        if (!popup) {
          // 팝업 차단 시 리다이렉트로 폴백
          window.location.href = url;
          return;
        }

        // 팝업 완료 감지
        const timer = setInterval(() => {
          if (popup.closed) {
            clearInterval(timer);
            onSuccess?.();
          }
        }, 500);
      }
    },
    [isMobile],
  );

  return { isMobile, openOAuthWindow };
}
