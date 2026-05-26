'use client';

/**
 * 분석 로딩 컴포넌트
 */

interface LoadingProgressProps {
  message?: string;
}

export function LoadingProgress({ message = '분석 중...' }: LoadingProgressProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 gap-10"
      aria-live="polite"
      aria-label={message}
    >
      {/* 우주 궤도 애니메이션 */}
      <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* 바깥 궤도 링 */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '1px solid rgba(139,92,246,0.18)',
        }} />
        {/* 바깥 궤도 도는 점 */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          animation: 'lp-rotate 3.5s linear infinite',
        }}>
          <span style={{
            position: 'absolute',
            top: -4,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'rgba(196,181,253,0.9)',
            boxShadow: '0 0 12px rgba(167,139,250,0.9), 0 0 24px rgba(139,92,246,0.5)',
            display: 'block',
          }} />
        </div>

        {/* 안쪽 궤도 링 */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          inset: 28,
          borderRadius: '50%',
          border: '1px solid rgba(139,92,246,0.13)',
        }} />
        {/* 안쪽 궤도 도는 점 (역방향) */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          inset: 28,
          borderRadius: '50%',
          animation: 'lp-rotate 2.2s linear infinite reverse',
        }}>
          <span style={{
            position: 'absolute',
            top: -3,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: 'rgba(167,139,250,0.75)',
            boxShadow: '0 0 8px rgba(139,92,246,0.7)',
            display: 'block',
          }} />
        </div>

        {/* 중앙 성운 글로우 + 심볼 */}
        <div aria-hidden="true" style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.28) 0%, rgba(109,40,217,0.1) 55%, transparent 75%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'lp-nebula 3s ease-in-out infinite',
        }}>
          <span style={{
            fontSize: 16,
            color: 'rgba(196,181,253,0.95)',
            textShadow: '0 0 14px rgba(167,139,250,0.9), 0 0 28px rgba(139,92,246,0.4)',
            animation: 'lp-star 3s ease-in-out infinite',
          }}>✦</span>
        </div>
      </div>

      {/* 메시지 */}
      <p style={{
        fontSize: 13,
        color: 'rgba(196,181,253,0.6)',
        letterSpacing: '0.08em',
        fontWeight: 500,
      }}>
        {message}
      </p>

      <style>{`
        @keyframes lp-rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes lp-nebula {
          0%, 100% { transform: scale(0.92); opacity: 0.7; }
          50%       { transform: scale(1.12); opacity: 1; }
        }
        @keyframes lp-star {
          0%, 100% { opacity: 0.6; transform: scale(0.9) rotate(0deg); }
          50%       { opacity: 1;   transform: scale(1.1) rotate(20deg); }
        }
      `}</style>
    </div>
  );
}
