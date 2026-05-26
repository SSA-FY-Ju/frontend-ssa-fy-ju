'use client';

import { ReactNode, useEffect, useState } from 'react';
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
 * - MSW 개발용 API 목업 (개발 환경에서만, onUnhandledRequest: 'bypass')
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
  useEffect(() => {
    // NEXT_PUBLIC_USE_MOCK=true 일 때만 MSW 활성화 (기본값: false)
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      import('@/mocks/browser').then(({ worker }) => {
        worker.start({ onUnhandledRequest: 'bypass' }).catch(console.error);
      });
    } else {
      // MSW가 비활성화된 경우, 브라우저에 남아있을 수 있는 Service Worker를 강제로 해제
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            if (registration.active?.scriptURL.includes('mockServiceWorker.js')) {
              registration.unregister().then(() => {
                // 해제 성공 시 별도 로그 남기지 않음
              });
            }
          }
        });
      }
    }
  }, []);

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
