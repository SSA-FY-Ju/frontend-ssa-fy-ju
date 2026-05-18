'use client';

/** 추천산업 탭 — 에디토리얼 랭킹 리스트 */

import type { IndustryRecommendation } from '@/types/api';

interface IndustriesTabProps {
  industries: IndustryRecommendation[];
}

export function IndustriesTab({ industries }: IndustriesTabProps) {
  const [best, ...rest] = industries;

  return (
    <div className="flex flex-col">
      {/* ── #1 BEST FIT — 히어로 타이포 ── */}
      {best && (
        <div
          className="animate-item"
          style={{ paddingBottom: 36, animationDelay: '0s' }}
        >
          {/* 뱃지 */}
          <span
            className="animate-item"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.2em',
              color: '#10b981',
              textTransform: 'uppercase',
              marginBottom: 14,
              animationDelay: '0s',
            }}
          >
            <span style={{ fontSize: 14 }}>✦</span> BEST FIT
          </span>

          {/* 산업명 — 매우 크게 */}
          <h3
            className="animate-item"
            style={{
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              marginBottom: 16,
              textShadow: '0 0 40px rgba(16,185,129,0.35)',
              animationDelay: '0.08s',
            }}
          >
            {best.industryName}
          </h3>

          {/* 이유 */}
          <p
            className="animate-item"
            style={{
              fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.75,
              maxWidth: 480,
              marginBottom: 18,
              animationDelay: '0.16s',
            }}
          >
            {best.reason}
          </p>

          {/* 역할 태그 */}
          <div className="animate-item" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, animationDelay: '0.24s' }}>
            {best.recommendedRoles.map((role) => (
              <span
                key={role}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#34d399',
                  padding: '4px 14px',
                  borderRadius: 999,
                  border: '1px solid rgba(16,185,129,0.35)',
                  background: 'rgba(16,185,129,0.08)',
                }}
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── 나머지 산업 — 콤팩트 리스트 ── */}
      {rest.map((item, i) => (
        <div key={i + 1}>
          {/* 구분선 */}
          <div
            style={{
              height: 1,
              background: 'rgba(16,185,129,0.12)',
              marginBottom: 22,
            }}
          />
          <div
            className="animate-item"
            style={{
              display: 'flex',
              gap: 20,
              paddingBottom: 22,
              animationDelay: `${(i + 1) * 0.1}s`,
            }}
          >
            {/* 순위 번호 */}
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: 'rgba(16,185,129,0.45)',
                letterSpacing: '0.05em',
                flexShrink: 0,
                paddingTop: 3,
                minWidth: 20,
              }}
            >
              0{i + 2}
            </span>

            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.9)',
                  marginBottom: 6,
                  letterSpacing: '-0.01em',
                }}
              >
                {item.industryName}
              </h3>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: 'rgba(255,255,255,0.5)',
                  lineHeight: 1.65,
                  marginBottom: 10,
                }}
              >
                {item.reason}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {item.recommendedRoles.map((role) => (
                  <span
                    key={role}
                    style={{
                      fontSize: 11,
                      color: 'rgba(52,211,153,0.7)',
                      padding: '2px 10px',
                      borderRadius: 999,
                      border: '1px solid rgba(16,185,129,0.2)',
                    }}
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
