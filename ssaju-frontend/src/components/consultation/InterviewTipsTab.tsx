'use client';

/** 면접팁 탭 — 인용구 플로우, 컨테이너 없음 */

interface InterviewTipsTabProps {
  tips: string[];
}

export function InterviewTipsTab({ tips }: InterviewTipsTabProps) {
  return (
    <div className="flex flex-col gap-0">
      {tips.map((tip, i) => (
        <div key={i}>
          <div
            className="animate-item"
            style={{
              padding: '24px 0',
              animationDelay: `${i * 0.1}s`,
            }}
          >
            {/* 장식 인용부호 */}
            <div
              className="animate-item"
              aria-hidden="true"
              style={{
                fontSize: 44,
                lineHeight: 0.8,
                color: 'rgba(59,130,246,0.22)',
                fontFamily: 'Georgia, serif',
                marginBottom: 8,
                userSelect: 'none',
                animationDelay: `${i * 0.1}s`,
              }}
            >
              &ldquo;
            </div>

            {/* 팁 텍스트 */}
            <p
              className="animate-item"
              style={{
                fontSize: '1rem',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.82)',
                lineHeight: 1.8,
                paddingLeft: 4,
                animationDelay: `${i * 0.1 + 0.07}s`,
              }}
            >
              {tip}
            </p>
          </div>

          {/* 구분선 (마지막 제외) */}
          {i < tips.length - 1 && (
            <div
              aria-hidden="true"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ flex: 1, height: 1, background: 'rgba(59,130,246,0.1)' }} />
              <span style={{ fontSize: 9, color: 'rgba(59,130,246,0.3)', letterSpacing: '0.3em' }}>
                ✦ ✦ ✦
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(59,130,246,0.1)' }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
