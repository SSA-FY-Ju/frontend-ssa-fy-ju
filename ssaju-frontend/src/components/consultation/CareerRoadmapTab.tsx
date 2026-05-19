'use client';

/** 경력로드맵 탭 — 가로 타임라인 → 수직 스텝, 라인 기반 */

import type { CareerRoadmap } from '@/types/api';

interface CareerRoadmapTabProps {
  roadmap: CareerRoadmap;
}

const STAGES = [
  { key: 'shortTerm' as const, label: '단기', period: '0 — 2년',  numeral: '一', color: '#34d399' },
  { key: 'midTerm'   as const, label: '중기', period: '3 — 5년',  numeral: '二', color: '#22d3ee' },
  { key: 'longTerm'  as const, label: '장기', period: '최종 목표', numeral: '三', color: '#c4b5fd' },
];

export function CareerRoadmapTab({ roadmap }: CareerRoadmapTabProps) {
  return (
    <div className="flex flex-col">
      {STAGES.map((stage, i) => (
        <div key={stage.key}>
          <div
            className="animate-item"
            style={{
              display: 'flex',
              gap: 28,
              padding: '24px 0',
              animationDelay: `${i * 0.12}s`,
            }}
          >
            {/* 좌측 컬럼 — 한자 + 라벨 + 기간 */}
            <div className="animate-item" style={{ flexShrink: 0, width: 64, textAlign: 'right', animationDelay: `${i * 0.12}s` }}>
              <span
                aria-hidden="true"
                style={{
                  display: 'block',
                  fontSize: 36,
                  fontWeight: 900,
                  fontFamily: 'serif',
                  color: stage.color,
                  opacity: 0.5,
                  lineHeight: 1,
                  marginBottom: 6,
                }}
              >
                {stage.numeral}
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 700,
                  color: stage.color,
                  letterSpacing: '0.05em',
                }}
              >
                {stage.label}
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: 10,
                  color: stage.color,
                  opacity: 0.45,
                  marginTop: 2,
                  letterSpacing: '0.03em',
                }}
              >
                {stage.period}
              </span>
            </div>

            {/* 세로 구분선 */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: 1,
                  height: '100%',
                  background: `linear-gradient(180deg, ${stage.color}55, ${stage.color}11)`,
                }}
              />
              {/* 점 */}
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: stage.color,
                  boxShadow: `0 0 8px ${stage.color}`,
                }}
              />
            </div>

            {/* 본문 */}
            <div className="animate-item" style={{ flex: 1, paddingTop: 4, animationDelay: `${i * 0.12 + 0.1}s` }}>
              <p
                style={{
                  fontSize: '0.92rem',
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.75,
                }}
              >
                {roadmap[stage.key]}
              </p>
            </div>
          </div>

          {/* 수평 구분선 (마지막 제외) */}
          {i < STAGES.length - 1 && (
            <div style={{ height: 1, background: 'rgba(6,182,212,0.08)', margin: '0 0 0 92px' }} />
          )}
        </div>
      ))}
    </div>
  );
}
