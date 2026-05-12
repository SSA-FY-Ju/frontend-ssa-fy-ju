'use client';

/**
 * 에러 코드 처리 훅 (T060)
 *
 * - ApiError를 사용자 친화적 UI 메시지로 변환
 * - Q5 재시도 정책: 타임아웃/네트워크 에러만 재시도
 */

import { useCallback } from 'react';
import { getErrorMessage, RETRYABLE_ERROR_CODES, ApiErrorCode } from '@/types/errors';
import { ApiError } from '@/lib/api/client';

export function useErrorHandler() {
  /**
   * 에러 객체를 UI 표시용 메시지로 변환
   */
  const getDisplayMessage = useCallback((err: unknown): string => {
    if (err instanceof ApiError) {
      return getErrorMessage(err.errorCode);
    }
    if (err instanceof Error) {
      // AbortError = 타임아웃
      if (err.name === 'AbortError') {
        return getErrorMessage(ApiErrorCode.FASTAPI_TIMEOUT);
      }
      // TypeError = 네트워크 오류
      if (err instanceof TypeError) {
        return getErrorMessage(ApiErrorCode.NETWORK_ERROR);
      }
    }
    return getErrorMessage(ApiErrorCode.UNKNOWN_ERROR);
  }, []);

  /**
   * 재시도 가능한 에러인지 확인 (Q5: 타임아웃/네트워크만)
   */
  const isRetryable = useCallback((err: unknown): boolean => {
    if (err instanceof ApiError) {
      return RETRYABLE_ERROR_CODES.has(err.errorCode as ApiErrorCode);
    }
    if (err instanceof Error) {
      return err.name === 'AbortError' || err instanceof TypeError;
    }
    return false;
  }, []);

  return { getDisplayMessage, isRetryable };
}
