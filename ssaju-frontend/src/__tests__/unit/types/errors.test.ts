/**
 * 에러 타입 및 유틸리티 테스트
 *
 * 커버리지 대상: src/types/errors.ts (0% → 100%)
 */

import {
  ApiErrorCode,
  ERROR_MESSAGES,
  RETRYABLE_ERROR_CODES,
  getErrorMessage,
} from '@/types/errors';

describe('ApiErrorCode', () => {
  it('입력 검증 에러 코드 정의됨', () => {
    expect(ApiErrorCode.INVALID_DATE_FORMAT).toBe('INVALID_DATE_FORMAT');
    expect(ApiErrorCode.INVALID_TIME_FORMAT).toBe('INVALID_TIME_FORMAT');
    expect(ApiErrorCode.INVALID_BIRTH_DATE).toBe('INVALID_BIRTH_DATE');
    expect(ApiErrorCode.MISSING_REQUIRED_FIELD).toBe('MISSING_REQUIRED_FIELD');
  });

  it('인증 에러 코드 정의됨', () => {
    expect(ApiErrorCode.UNAUTHORIZED).toBe('UNAUTHORIZED');
    expect(ApiErrorCode.TOKEN_EXPIRED).toBe('TOKEN_EXPIRED');
    expect(ApiErrorCode.INVALID_TOKEN).toBe('INVALID_TOKEN');
  });

  it('사주/서버 에러 코드 정의됨', () => {
    expect(ApiErrorCode.FASTAPI_TIMEOUT).toBe('FASTAPI_TIMEOUT');
    expect(ApiErrorCode.COMPANY_NOT_FOUND).toBe('COMPANY_NOT_FOUND');
    expect(ApiErrorCode.INTERNAL_SERVER_ERROR).toBe('INTERNAL_SERVER_ERROR');
    expect(ApiErrorCode.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
  });
});

describe('ERROR_MESSAGES', () => {
  it('INVALID_DATE_FORMAT 메시지 포함', () => {
    expect(ERROR_MESSAGES[ApiErrorCode.INVALID_DATE_FORMAT]).toContain('YYYY-MM-DD');
  });

  it('FASTAPI_TIMEOUT 메시지 포함', () => {
    expect(ERROR_MESSAGES[ApiErrorCode.FASTAPI_TIMEOUT]).toContain('시간초과');
  });

  it('COMPANY_NOT_FOUND 메시지 포함', () => {
    expect(ERROR_MESSAGES[ApiErrorCode.COMPANY_NOT_FOUND]).toContain('기업');
  });

  it('UNAUTHORIZED 메시지 포함', () => {
    expect(ERROR_MESSAGES[ApiErrorCode.UNAUTHORIZED]).toContain('로그인');
  });

  it('모든 에러 코드에 메시지 존재', () => {
    Object.values(ApiErrorCode).forEach((code) => {
      expect(ERROR_MESSAGES[code]).toBeTruthy();
    });
  });
});

describe('getErrorMessage', () => {
  it('알려진 에러 코드는 해당 메시지 반환', () => {
    expect(getErrorMessage('INVALID_DATE_FORMAT')).toBe(
      ERROR_MESSAGES[ApiErrorCode.INVALID_DATE_FORMAT],
    );
  });

  it('알 수 없는 에러 코드는 UNKNOWN_ERROR 메시지 반환', () => {
    expect(getErrorMessage('SOME_UNKNOWN_CODE')).toBe(
      ERROR_MESSAGES[ApiErrorCode.UNKNOWN_ERROR],
    );
  });

  it('빈 문자열 입력 시 UNKNOWN_ERROR 메시지 반환', () => {
    expect(getErrorMessage('')).toBe(ERROR_MESSAGES[ApiErrorCode.UNKNOWN_ERROR]);
  });
});

describe('RETRYABLE_ERROR_CODES', () => {
  it('FASTAPI_TIMEOUT은 재시도 가능', () => {
    expect(RETRYABLE_ERROR_CODES.has(ApiErrorCode.FASTAPI_TIMEOUT)).toBe(true);
  });

  it('NETWORK_ERROR는 재시도 가능', () => {
    expect(RETRYABLE_ERROR_CODES.has(ApiErrorCode.NETWORK_ERROR)).toBe(true);
  });

  it('SERVICE_UNAVAILABLE은 재시도 가능', () => {
    expect(RETRYABLE_ERROR_CODES.has(ApiErrorCode.SERVICE_UNAVAILABLE)).toBe(true);
  });

  it('INVALID_DATE_FORMAT은 재시도 불가 (클라이언트 에러)', () => {
    expect(RETRYABLE_ERROR_CODES.has(ApiErrorCode.INVALID_DATE_FORMAT)).toBe(false);
  });

  it('UNAUTHORIZED는 재시도 불가 (인증 에러)', () => {
    expect(RETRYABLE_ERROR_CODES.has(ApiErrorCode.UNAUTHORIZED)).toBe(false);
  });
});
