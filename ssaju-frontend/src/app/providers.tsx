'use client';

import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { GlobalLoadingBar } from '@/components/common/GlobalLoadingBar';

/**
 * 클라이언트 측 프로바이더 래퍼
 *
 * 제공하는 기능:
 * - 전역 로딩 진행 바 (API 요청 추적)
 * - Sonner 토스트 시스템
 */
export function Providers({ children }: { children: ReactNode }): React.ReactElement {
  return (
    <>
      <GlobalLoadingBar />
      {children}
      <Toaster
        position="top-center"
        richColors={true}
        theme="dark"
        closeButton={true}
        duration={3000}
      />
    </>
  );
}
