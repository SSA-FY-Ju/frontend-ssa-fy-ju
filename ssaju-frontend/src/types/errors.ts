/**
 * API 에러 코드 정의
 *
 * 백엔드에서 반환하는 모든 에러 코드를 열거형으로 관리
 */

export enum ApiErrorCode {
  // 입력 검증 에러
  INVALID_DATE_FORMAT = 'INVALID_DATE_FORMAT',
  INVALID_TIME_FORMAT = 'INVALID_TIME_FORMAT',
  INVALID_BIRTH_DATE = 'INVALID_BIRTH_DATE',
  INVALID_COMPANY_NAME = 'INVALID_COMPANY_NAME',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // 인증 에러
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // 사주 분석 에러
  FASTAPI_TIMEOUT = 'FASTAPI_TIMEOUT',
  SAJU_CALCULATION_ERROR = 'SAJU_CALCULATION_ERROR',
  RESULT_NOT_FOUND = 'RESULT_NOT_FOUND',

  // 기업 에러
  COMPANY_NOT_FOUND = 'COMPANY_NOT_FOUND',
  COMPANY_API_ERROR = 'COMPANY_API_ERROR',

  // 서버 에러
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  NETWORK_ERROR = 'NETWORK_ERROR',

  // 알 수 없는 에러
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * 에러 코드 → 사용자 친화적 메시지 매핑
 */
export const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  [ApiErrorCode.INVALID_DATE_FORMAT]: '생년월일 형식이 올바르지 않습니다 (YYYY-MM-DD)',
  [ApiErrorCode.INVALID_TIME_FORMAT]: '시간 형식이 올바르지 않습니다 (HH:mm)',
  [ApiErrorCode.INVALID_BIRTH_DATE]: '생년월일은 과거 날짜여야 합니다',
  [ApiErrorCode.INVALID_COMPANY_NAME]: '기업명이 올바르지 않습니다',
  [ApiErrorCode.MISSING_REQUIRED_FIELD]: '필수 항목을 입력해주세요',
  [ApiErrorCode.UNAUTHORIZED]: '로그인이 필요합니다. 다시 로그인해주세요',
  [ApiErrorCode.TOKEN_EXPIRED]: '로그인이 만료되었습니다. 다시 로그인해주세요',
  [ApiErrorCode.INVALID_TOKEN]: '인증 정보가 유효하지 않습니다',
  [ApiErrorCode.FASTAPI_TIMEOUT]: '사주 데이터 조회 중 시간초과. 잠시 후 다시 시도해주세요',
  [ApiErrorCode.SAJU_CALCULATION_ERROR]: '사주 분석 중 오류가 발생했습니다',
  [ApiErrorCode.RESULT_NOT_FOUND]: '분석 결과를 찾을 수 없습니다',
  [ApiErrorCode.COMPANY_NOT_FOUND]: '기업 정보를 찾을 수 없습니다',
  [ApiErrorCode.COMPANY_API_ERROR]: '기업 정보 조회 중 오류가 발생했습니다',
  [ApiErrorCode.INTERNAL_SERVER_ERROR]: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
  [ApiErrorCode.SERVICE_UNAVAILABLE]: '서비스를 일시적으로 사용할 수 없습니다',
  [ApiErrorCode.NETWORK_ERROR]: '네트워크 연결을 확인해주세요',
  [ApiErrorCode.UNKNOWN_ERROR]: '알 수 없는 오류가 발생했습니다',
};

/**
 * 에러 코드로 사용자 메시지 반환
 */
export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code as ApiErrorCode] ?? ERROR_MESSAGES[ApiErrorCode.UNKNOWN_ERROR];
}

/**
 * 재시도 가능한 에러 코드 목록 (Q5: 타임아웃/네트워크만)
 */
export const RETRYABLE_ERROR_CODES = new Set([
  ApiErrorCode.FASTAPI_TIMEOUT,
  ApiErrorCode.NETWORK_ERROR,
  ApiErrorCode.SERVICE_UNAVAILABLE,
]);
