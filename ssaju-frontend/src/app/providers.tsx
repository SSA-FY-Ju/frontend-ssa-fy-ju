'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { GlobalErrorHandler } from '@/components/common/GlobalErrorHandler';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

/**
 * 클라이언트 측 프로바이더 래퍼
 *
 * 제공하는 기능:
 * - TanStack Query (캐싱, 비동기 상태 관리)
 * - Sonner 토스트 시스템
 * - 전역 에러 핸들러 (window.onerror, unhandledrejection)
 * - ErrorBoundary (React 렌더링 오류 캐치)
 */
export function Providers({ children }: { children: ReactNode }): React.ReactElement {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,  // 5분 — 재방문 시 캐시 사용
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
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
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
