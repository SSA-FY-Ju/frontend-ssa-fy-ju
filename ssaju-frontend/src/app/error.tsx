'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 에러 로깅 필요 시 여기서 처리
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ color: '#fff', position: 'relative', zIndex: 10 }}
    >
      <div className="text-center max-w-md w-full flex flex-col items-center gap-6">
        <p
          className="font-black leading-none"
          style={{ fontSize: 96, color: 'rgba(248,113,113,0.25)', lineHeight: 1 }}
        >
          500
        </p>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold" style={{ color: '#fca5a5' }}>
            오류가 발생했어요
          </h1>
          <p className="text-sm" style={{ color: 'rgba(252,165,165,0.5)' }}>
            일시적인 문제가 발생했습니다. 다시 시도해주세요.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{
              background: 'rgba(248,113,113,0.12)',
              border: '1px solid rgba(248,113,113,0.3)',
              color: '#fca5a5',
            }}
          >
            다시 시도
          </button>
          <a
            href="/"
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.3)',
              color: '#c4b5fd',
            }}
          >
            홈으로
          </a>
        </div>
      </div>
    </div>
  );
}
