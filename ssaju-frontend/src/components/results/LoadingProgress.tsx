'use client';

/**
 * 분석 로딩 진행 바 컴포넌트 (T056)
 *
 * - 부드러운 무한 애니메이션 진행 바
 * - 별 아이콘 회전 효과
 * - "로딩 중..." 메시지
 */

interface LoadingProgressProps {
  /** 로딩 메시지 (기본값: "분석 중...") */
  message?: string;
}

export function LoadingProgress({ message = '분석 중...' }: LoadingProgressProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6" aria-live="polite" aria-label={message}>
      {/* 별 아이콘 회전 */}
      <span
        className="text-star-500 text-5xl"
        style={{ display: 'inline-block', animation: 'spin 1.5s linear infinite' }}
        aria-hidden="true"
      >
        ★
      </span>

      {/* 진행 바 */}
      <div className="w-64 h-1.5 bg-night-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-star-500 rounded-full"
          style={{ animation: 'loading-bar 1.5s ease-in-out infinite' }}
        />
      </div>

      <p className="text-star-300 text-sm">{message}</p>

      {/* 애니메이션 스타일 */}
      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; margin-left: 0; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
