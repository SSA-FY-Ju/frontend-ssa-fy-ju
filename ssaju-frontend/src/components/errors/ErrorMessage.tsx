'use client';

/**
 * 에러 메시지 + 재시도 버튼 컴포넌트 (T059)
 *
 * - API 에러 코드 → 사용자 친화적 메시지 표시
 * - "다시 시도" 버튼 제공
 * - 최종 실패 시 단순 메시지만 표시
 */

interface ErrorMessageProps {
  /** 표시할 에러 메시지 */
  message: string;
  /** 재시도 핸들러 (없으면 버튼 미표시) */
  onRetry?: () => void;
  /** 재시도 버튼 텍스트 */
  retryLabel?: string;
}

function toUserMessage(raw: string): string {
  if (!raw) return '오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';

  if (/aborted|abort/i.test(raw))
    return '요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.';
  if (/failed to fetch|network/i.test(raw))
    return '서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.';
  if (/401|unauthorized|인증/i.test(raw))
    return '로그인이 필요합니다. 다시 로그인해 주세요.';
  if (/403|forbidden|권한/i.test(raw))
    return '접근 권한이 없습니다.';
  if (/404|not found/i.test(raw))
    return '요청한 정보를 찾을 수 없습니다.';
  if (/503|service unavailable|fastapi/i.test(raw))
    return '분석 서버가 일시적으로 응답하지 않습니다. 잠시 후 다시 시도해 주세요.';
  if (/504|gateway timeout|openai/i.test(raw))
    return 'AI 분석에 시간이 걸리고 있습니다. 잠시 후 다시 시도해 주세요.';
  if (/500|server error/i.test(raw))
    return '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';

  // 백엔드가 직접 내려준 한국어 메시지는 그대로 사용
  if (/[가-힣]/.test(raw)) return raw;

  return '오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
}

export function ErrorMessage({
  message,
  onRetry,
  retryLabel = '다시 시도',
}: ErrorMessageProps) {
  const displayMessage = toUserMessage(message);

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 py-8 px-4 text-center"
    >
      <span className="text-red-400 text-3xl" aria-hidden="true">⚠</span>
      <p className="text-red-300 text-sm leading-relaxed max-w-xs">{displayMessage}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2 bg-night-700 hover:bg-night-600 text-white text-sm rounded transition-colors"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
