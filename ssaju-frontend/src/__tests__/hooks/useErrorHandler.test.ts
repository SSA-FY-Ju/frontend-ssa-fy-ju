/**
 * useErrorHandler 훅 테스트 (T060)
 *
 * - ApiError → UI 메시지 변환
 * - AbortError / TypeError → 재시도 정책
 */

import { renderHook } from '@testing-library/react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ApiError } from '@/lib/api/client';
import { ApiErrorCode, ERROR_MESSAGES } from '@/types/errors';

describe('useErrorHandler', () => {
  const { result } = renderHook(() => useErrorHandler());
  const { getDisplayMessage, isRetryable } = result.current;

  // ─── getDisplayMessage ───────────────────────────────────────────────────

  describe('getDisplayMessage', () => {
    it('ApiError 전달 시 에러 코드에 매핑된 한국어 메시지를 반환한다', () => {
      const err = new ApiError(503, ApiErrorCode.SERVICE_UNAVAILABLE, 'service unavailable', 'req-1');
      expect(getDisplayMessage(err)).toBe(ERROR_MESSAGES[ApiErrorCode.SERVICE_UNAVAILABLE]);
    });

    it('AbortError 전달 시 FASTAPI_TIMEOUT 메시지를 반환한다', () => {
      const err = new DOMException('aborted', 'AbortError');
      expect(getDisplayMessage(err)).toBe(ERROR_MESSAGES[ApiErrorCode.FASTAPI_TIMEOUT]);
    });

    it('TypeError 전달 시 NETWORK_ERROR 메시지를 반환한다', () => {
      const err = new TypeError('Failed to fetch');
      expect(getDisplayMessage(err)).toBe(ERROR_MESSAGES[ApiErrorCode.NETWORK_ERROR]);
    });

    it('알 수 없는 값(string 등) 전달 시 UNKNOWN_ERROR 메시지를 반환한다', () => {
      expect(getDisplayMessage('unexpected')).toBe(ERROR_MESSAGES[ApiErrorCode.UNKNOWN_ERROR]);
    });

    it('null 전달 시 UNKNOWN_ERROR 메시지를 반환한다', () => {
      expect(getDisplayMessage(null)).toBe(ERROR_MESSAGES[ApiErrorCode.UNKNOWN_ERROR]);
    });
  });

  // ─── isRetryable ─────────────────────────────────────────────────────────

  describe('isRetryable', () => {
    it('FASTAPI_TIMEOUT ApiError는 재시도 가능(true)을 반환한다', () => {
      const err = new ApiError(504, ApiErrorCode.FASTAPI_TIMEOUT, 'timeout', 'req-2');
      expect(isRetryable(err)).toBe(true);
    });

    it('NETWORK_ERROR ApiError는 재시도 가능(true)을 반환한다', () => {
      const err = new ApiError(0, ApiErrorCode.NETWORK_ERROR, 'network', 'req-3');
      expect(isRetryable(err)).toBe(true);
    });

    it('AbortError는 재시도 가능(true)을 반환한다', () => {
      const err = new DOMException('aborted', 'AbortError');
      expect(isRetryable(err)).toBe(true);
    });

    it('TypeError는 재시도 가능(true)을 반환한다', () => {
      const err = new TypeError('Failed to fetch');
      expect(isRetryable(err)).toBe(true);
    });

    it('재시도 불가 ApiError(UNAUTHORIZED)는 false를 반환한다', () => {
      const err = new ApiError(401, ApiErrorCode.UNAUTHORIZED, 'unauthorized', 'req-4');
      expect(isRetryable(err)).toBe(false);
    });

    it('일반 Error는 false를 반환한다', () => {
      const err = new Error('generic error');
      expect(isRetryable(err)).toBe(false);
    });

    it('알 수 없는 값(string 등)은 false를 반환한다', () => {
      expect(isRetryable('some string')).toBe(false);
    });

    it('null은 false를 반환한다', () => {
      expect(isRetryable(null)).toBe(false);
    });
  });
});
