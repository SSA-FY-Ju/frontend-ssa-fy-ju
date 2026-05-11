'use client';

import { useEffect, useState } from 'react';
import { useErrorStore } from '@/stores/errorStore';

/**
 * 전역 로딩 진행 바 컴포넌트
 *
 * 기능:
 * - API 요청 중 진행 바 표시
 * - Zustand errorStore의 isLoading 상태 구독
 * - 부드러운 애니메이션 (NProgress 유사)
 * - 자동으로 사라짐
 */
export function GlobalLoadingBar(): React.ReactElement {
  const isLoading = useErrorStore((state) => state.isLoading);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
      setDisplayProgress(10);

      const intervals = [
        setTimeout(() => setDisplayProgress(30), 100),
        setTimeout(() => setDisplayProgress(60), 500),
        setTimeout(() => setDisplayProgress(80), 1200),
      ];

      return () => {
        intervals.forEach(clearTimeout);
      };
    } else {
      setDisplayProgress(100);
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        setDisplayProgress(0);
      }, 500);

      return () => clearTimeout(hideTimer);
    }
  }, [isLoading]);

  if (!isVisible) return <></>;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-star-500 to-star-400 shadow-lg"
      style={{
        width: `${displayProgress}%`,
        transition: `width ${displayProgress === 100 ? 0.5 : 0.3}s ease-in-out`,
        zIndex: 9999,
      }}
      role="progressbar"
      aria-valuenow={displayProgress}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
}
