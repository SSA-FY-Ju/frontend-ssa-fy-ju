'use client';

/** 브랜딩 탭 (T073) */

import type { BrandingInfo } from '@/types/api';

interface BrandingTabProps {
  branding: BrandingInfo;
}

const cardBase: React.CSSProperties = {
  backdropFilter: 'blur(12px)',
  background: 'rgba(244,63,94,0.04)',
  border: '1px solid rgba(244,63,94,0.18)',
  borderRadius: 20,
};

export function BrandingTab({ branding }: BrandingTabProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* 파워 키워드 — hero, 가장 위에 크게 */}
      <div
        className="animate-item"
        style={{ ...cardBase, padding: '22px 24px', animationDelay: '0s' }}
      >
        <h3
          className="text-xs font-bold tracking-widest uppercase mb-3"
          style={{ color: '#fb7185', opacity: 0.7 }}
        >
          파워 키워드
        </h3>
        <div className="flex flex-wrap gap-2">
          {branding.powerKeywords.map((kw, i) => (
            <span
              key={kw}
              className="font-bold rounded-full"
              style={{
                background: i === 0
                  ? 'rgba(244,63,94,0.22)'
                  : 'rgba(244,63,94,0.10)',
                border: `1px solid rgba(244,63,94,${i === 0 ? '0.5' : '0.28'})`,
                color: i === 0 ? '#fda4af' : '#fda4af',
                fontSize: i === 0 ? '1rem' : '0.8rem',
                padding: i === 0 ? '6px 16px' : '4px 12px',
              }}
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* 추천 정장 색상 */}
      <div
        className="animate-item flex gap-4 items-start"
        style={{ ...cardBase, padding: '18px 24px', animationDelay: '0.1s' }}
      >
        <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>👔</span>
        <div>
          <h3 className="font-bold text-sm mb-1" style={{ color: '#fda4af' }}>추천 정장 색상</h3>
          <p className="text-white text-sm leading-relaxed" style={{ opacity: 0.85 }}>
            {branding.suitColor}
          </p>
        </div>
      </div>

      {/* 이미지 스타일 */}
      <div
        className="animate-item flex gap-4 items-start"
        style={{ ...cardBase, padding: '18px 24px', animationDelay: '0.2s' }}
      >
        <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>🪞</span>
        <div>
          <h3 className="font-bold text-sm mb-1" style={{ color: '#fda4af' }}>이미지 스타일</h3>
          <p className="text-white text-sm leading-relaxed" style={{ opacity: 0.85 }}>
            {branding.imageStyle}
          </p>
        </div>
      </div>

      {/* 헤어 & 메이크업 */}
      <div
        className="animate-item flex gap-4 items-start"
        style={{ ...cardBase, padding: '18px 24px', animationDelay: '0.3s' }}
      >
        <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>💄</span>
        <div>
          <h3 className="font-bold text-sm mb-1" style={{ color: '#fda4af' }}>헤어 &amp; 메이크업</h3>
          <p className="text-white text-sm leading-relaxed" style={{ opacity: 0.85 }}>
            {branding.hairMakeup}
          </p>
        </div>
      </div>
    </div>
  );
}
