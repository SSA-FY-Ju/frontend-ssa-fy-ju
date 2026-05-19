'use client';

/** 강점 탭 — 대형 번호 + 텍스트, 라인 구분 */

interface StrengthsTabProps {
  strengths: string[];
}

const CHINESE = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

export function StrengthsTab({ strengths }: StrengthsTabProps) {
  return (
    <div className="flex flex-col">
      {strengths.map((strength, i) => (
        <div key={i}>
          {i > 0 && (
            <div style={{ height: 1, background: 'rgba(245,158,11,0.1)', margin: '0 0 28px' }} />
          )}
          <div
            className="animate-item"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 24,
              paddingBottom: 28,
              animationDelay: `${i * 0.1}s`,
            }}
          >
            {/* 한자 서수 — 대형 */}
            <span
              aria-hidden="true"
              style={{
                fontSize: i === 0 ? 64 : 44,
                fontWeight: 900,
                lineHeight: 1,
                fontFamily: 'serif',
                color: i === 0 ? 'rgba(251,191,36,0.6)' : 'rgba(245,158,11,0.25)',
                flexShrink: 0,
                marginTop: i === 0 ? -8 : -4,
                transition: 'all 0.2s',
              }}
            >
              {CHINESE[i] ?? String(i + 1)}
            </span>

            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: i === 0 ? 'clamp(1.1rem, 3vw, 1.35rem)' : '1rem',
                  fontWeight: i === 0 ? 800 : 600,
                  color: i === 0 ? '#fff' : 'rgba(255,255,255,0.8)',
                  lineHeight: 1.55,
                  letterSpacing: '-0.01em',
                  textShadow: i === 0 ? '0 0 24px rgba(251,191,36,0.2)' : 'none',
                }}
              >
                {strength}
              </p>
              {i === 0 && (
                <div
                  style={{
                    marginTop: 12,
                    height: 2,
                    width: 40,
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, #fbbf24, transparent)',
                  }}
                />
              )}
            </div>

            {i === 0 && (
              <span
                aria-hidden="true"
                style={{
                  fontSize: 18,
                  color: '#fbbf24',
                  filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.8))',
                  flexShrink: 0,
                  marginTop: 4,
                }}
              >
                ★
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
