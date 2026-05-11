'use client';

import { ReactNode } from 'react';
import { Toaster } from 'sonner';

/**
 * 클라이언트 측 프로바이더 래퍼
 *
 * 제공하는 기능:
 * - Sonner 토스트 시스템
 * - (향후) Zustand 상태 초기화
 * - (향후) 에러 바운더리
 */
export function Providers({ children }: { children: ReactNode }): React.ReactElement {
  return (
    <>
      {children}
      {/* Sonner 토스트 컴포넌트 */}
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
