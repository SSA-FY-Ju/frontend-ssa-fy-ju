'use client';

/**
 * 기업 궁합 분석 결과 컴포넌트 (스크롤형 — 마이페이지 기록 상세 등에서 사용)
 */

import type { CompatibilityResult as CompatibilityResultType } from '@/types/api';

interface CompatibilityResultProps {
  result: CompatibilityResultType;
  onReset?: () => void;
}

export function CompatibilityResult({ result, onReset }: CompatibilityResultProps) {
  const synergyColor = result.potentialSynergy >= 80 ? '#f59e0b' : result.potentialSynergy >= 60 ? '#22c55e' : '#06b6d4';
  const stabilityColor = result.longTermStability >= 80 ? '#f59e0b' : result.longTermStability >= 60 ? '#22c55e' : '#06b6d4';

  return (
    <div className="flex flex-col gap-8">

      {/* 점수 카드 2개 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <ScoreCard label="시너지 점수" score={result.potentialSynergy} color={synergyColor} />
        <ScoreCard label="장기 안정성" score={result.longTermStability} color={stabilityColor} />
      </div>

      {/* 면접 키워드 */}
      <Section label="면접 키워드">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {result.actionableStrategy.interviewKeywords.map((kw, i) => (
            <span key={i} style={{
              padding: '6px 14px', borderRadius: 999,
              background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)',
              color: '#06b6d4', fontSize: 13, fontWeight: 600,
            }}>{kw}</span>
          ))}
        </div>
      </Section>

      {/* 약점 방어 */}
      <Section label="약점 방어 전략">
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, fontStyle: 'italic' }}>
          {result.actionableStrategy.weaknessDefense}
        </p>
      </Section>

      {/* 최적 시기 */}
      <Section label="면접 최적 시기">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {result.actionableStrategy.bestTiming.luckyDays.map((day, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
            }}>
              <span style={{ fontSize: 16 }}>🌙</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{day}</span>
            </div>
          ))}
        </div>
      </Section>

      {onReset && (
        <button onClick={onReset} style={{
          width: '100%', padding: '12px', borderRadius: 10,
          border: '1px solid rgba(139,92,246,0.2)', background: 'transparent',
          color: 'rgba(196,181,253,0.5)', fontSize: 13, cursor: 'pointer',
        }}>
          새 분석 시작하기
        </button>
      )}
    </div>
  );
}

function ScoreCard({ label, score, color }: { label: string; score: number; color: string }) {
  const grade = score >= 80 ? '최상' : score >= 60 ? '양호' : score >= 40 ? '보통' : '주의';
  return (
    <div style={{
      padding: '16px', borderRadius: 12, textAlign: 'center',
      background: `${color}0e`, border: `1px solid ${color}2a`,
    }}>
      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{score}</p>
      <p style={{ fontSize: 11, color, opacity: 0.7, marginTop: 4 }}>{grade}</p>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', color: '#a78bfa', opacity: 0.6, textTransform: 'uppercase', marginBottom: 14 }}>
        {label}
      </p>
      {children}
    </div>
  );
}
