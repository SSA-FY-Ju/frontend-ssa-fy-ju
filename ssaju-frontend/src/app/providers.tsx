'use client';

import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { GlobalErrorHandler } from '@/components/common/GlobalErrorHandler';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

/**
 * 클라이언트 측 프로바이더 래퍼
 *
 * 제공하는 기능:
 * - MSW 개발용 API 목업 (개발 환경에서만)
 * - Sonner 토스트 시스템
 * - 전역 에러 핸들러 (window.onerror, unhandledrejection)
 * - ErrorBoundary (React 렌더링 오류 캐치)
 */
export function Providers({ children }: { children: ReactNode }): React.ReactElement {
  // MSW 비활성화 — 실제 API 사용 (Next.js 프록시 → https://api.ssaju.net)

  return (
    <ErrorBoundary>
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
