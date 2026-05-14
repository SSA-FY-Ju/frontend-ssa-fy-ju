'use client';

/**
 * 글로벌 에러 핸들러 (T121)
 *
 * window.onerror + window.onunhandledrejection 이벤트 캐치
 * errorStore에 에러 기록
 */

import { useEffect } from 'react';
import { useErrorStore } from '@/stores/errorStore';

export function GlobalErrorHandler() {
  const setGlobalError = useErrorStore((s) => s.setGlobalError);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setGlobalError({
        code: 'UNCAUGHT_ERROR',
        message: event.message || '알 수 없는 오류가 발생했습니다.',
        timestamp: Date.now(),
        context: { filename: event.filename, lineno: event.lineno },
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message =
        event.reason instanceof Error
          ? event.reason.message
          : String(event.reason) || '처리되지 않은 Promise 오류가 발생했습니다.';
      setGlobalError({
        code: 'UNHANDLED_REJECTION',
        message,
        timestamp: Date.now(),
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [setGlobalError]);

  return null;
}
