'use client';

import { ReactNode, useEffect } from 'react';
import { Toaster } from 'sonner';
import { GlobalLoadingBar } from '@/components/common/GlobalLoadingBar';
import { GlobalErrorHandler } from '@/components/common/GlobalErrorHandler';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

/**
 * 클라이언트 측 프로바이더 래퍼
 *
 * 제공하는 기능:
 * - MSW 개발용 API 목업 (개발 환경에서만)
 * - 전역 로딩 진행 바 (API 요청 추적)
 * - Sonner 토스트 시스템
 * - 전역 에러 핸들러 (window.onerror, unhandledrejection)
 * - ErrorBoundary (React 렌더링 오류 캐치)
 */
export function Providers({ children }: { children: ReactNode }): React.ReactElement {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const initMSW = async () => {
        try {
          const { worker } = await import('@/mocks/browser');
          await worker.start({
            onUnhandledRequest: 'bypass',
          }).catch(() => {
            // MSW 초기화 실패해도 앱 계속 실행
          });
        } catch (error) {
          // 에러 무시하고 계속 진행
        }
      };
      initMSW();
    }
  }, []);

  return (
    <ErrorBoundary>
      <GlobalLoadingBar />
      <GlobalErrorHandler />
      {children}
      <Toaster
        position="top-center"
        richColors={true}
        theme="dark"
        closeButton={true}
        duration={3000}
      />
    </ErrorBoundary>
  );
}
