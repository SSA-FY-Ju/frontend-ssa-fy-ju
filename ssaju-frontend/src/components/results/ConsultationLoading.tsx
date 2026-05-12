'use client';

/** AI 컨설팅 로딩 컴포넌트 (T077) */

export function ConsultationLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6" aria-live="polite" aria-label="AI 분석 중입니다...">
      <span className="text-star-500 text-5xl" style={{ display: 'inline-block', animation: 'spin 1.5s linear infinite' }} aria-hidden="true">★</span>
      <div className="w-64 h-1.5 bg-night-700 rounded-full overflow-hidden">
        <div className="h-full bg-star-500 rounded-full" style={{ animation: 'loading-bar 1.5s ease-in-out infinite' }} />
      </div>
      <div className="text-center">
        <p className="text-star-300 text-sm">AI 분석 중입니다...</p>
      </div>
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
