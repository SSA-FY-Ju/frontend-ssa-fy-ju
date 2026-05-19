'use client';

/** 브랜딩 탭 — 키워드 콜라주 + 정의 목록 */

import type { BrandingInfo } from '@/types/api';

interface BrandingTabProps {
  branding: BrandingInfo;
}

const DETAIL_FIELDS: { key: keyof BrandingInfo; label: string }[] = [
  { key: 'suitColor',  label: '추천 정장 색상'  },
  { key: 'imageStyle', label: '이미지 스타일'   },
  { key: 'hairMakeup', label: '헤어 & 메이크업' },
];

function kwSize(i: number) {
  if (i === 0) return { fontSize: '2.2rem', fontWeight: 900, opacity: 1 };
  if (i === 1) return { fontSize: '1.5rem', fontWeight: 800, opacity: 0.85 };
  if (i === 2) return { fontSize: '1.1rem', fontWeight: 700, opacity: 0.7 };
  return { fontSize: '0.9rem', fontWeight: 600, opacity: 0.55 };
}

export function BrandingTab({ branding }: BrandingTabProps) {
  return (
    <div className="flex flex-col">
      {/* ── 파워 키워드 — 콜라주 ── */}
      <div
        className="animate-item"
        style={{ paddingBottom: 36, animationDelay: '0s' }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.22em',
            color: '#fb7185',
            opacity: 0.6,
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          파워 키워드
        </p>

        {/* 가변 크기 키워드 */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            gap: '8px 16px',
          }}
        >
          {branding.powerKeywords.map((kw, i) => {
            const s = kwSize(i);
            return (
              <span
                key={kw}
                className="animate-item"
                style={{
                  animationDelay: `${i * 0.08}s`,
                  fontSize: s.fontSize,
                  fontWeight: s.fontWeight,
                  color: '#fda4af',
                  opacity: s.opacity,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  textShadow: i === 0 ? '0 0 30px rgba(244,63,94,0.4)' : 'none',
                }}
              >
                {kw}
              </span>
            );
          })}
        </div>
      </div>

      {/* 구분선 */}
      <div style={{ height: 1, background: 'rgba(244,63,94,0.15)', marginBottom: 0 }} />

      {/* ── 나머지 필드 — 정의 목록 ── */}
      {DETAIL_FIELDS.map(({ key, label }, i) => (
        <div key={key}>
          <div
            className="animate-item"
            style={{
              padding: '22px 0',
              animationDelay: `${(i + 1) * 0.1}s`,
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.22em',
                color: '#fb7185',
                opacity: 0.6,
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              {label}
            </p>
            <p
              style={{
                fontSize: '0.95rem',
                color: 'rgba(255,255,255,0.82)',
                lineHeight: 1.65,
              }}
            >
              {branding[key] as string}
            </p>
          </div>
          {i < DETAIL_FIELDS.length - 1 && (
            <div style={{ height: 1, background: 'rgba(244,63,94,0.1)' }} />
          )}
        </div>
      ))}
    </div>
  );
}
