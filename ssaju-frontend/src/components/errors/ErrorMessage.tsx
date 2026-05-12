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

export function ErrorMessage({
  message,
  onRetry,
  retryLabel = '다시 시도',
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 py-8 px-4 text-center"
    >
      <span className="text-red-400 text-3xl" aria-hidden="true">⚠</span>
      <p className="text-red-300 text-sm leading-relaxed max-w-xs">{message}</p>
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
