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
  const scoreColor = result.compatibilityScore >= 80 ? '#f59e0b' : result.compatibilityScore >= 60 ? '#22c55e' : '#06b6d4';

  return (
    <div className="flex flex-col gap-8">

      {/* 종합 점수 */}
      <Section label="종합 궁합 점수">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 48, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{result.compatibilityScore}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>/ 100</p>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: '성향 일치도', value: result.analysisBreakdown.characterMatch },
              { label: '잠재 시너지', value: result.analysisBreakdown.potentialSynergy },
              { label: '장기 안정성', value: result.analysisBreakdown.longTermStability },
            ].map(({ label, value }) => {
              const barColor = value >= 80 ? '#22c55e' : value >= 60 ? '#f59e0b' : '#ef4444';
              return (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                    <span style={{ color: barColor, fontWeight: 700 }}>{value}</span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${value}%`, height: '100%', background: barColor, borderRadius: 999 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* 직군 분석 */}
      <Section label="직군 분석">
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: 10 }}>
          {result.targetRoleAnalysis.synergy}
        </p>
        <p style={{ fontSize: '0.8rem', color: 'rgba(248,113,113,0.75)' }}>⚠ {result.targetRoleAnalysis.warning}</p>
      </Section>

      {/* 예상 면접 질문 */}
      <Section label="예상 면접 질문">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {result.expectedInterviewQuestions.map((q, i) => (
            <p key={i} style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
              Q{i + 1}. {q.question}
            </p>
          ))}
        </div>
      </Section>

      {/* 주의사항 */}
      <Section label="주의사항">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {result.cautions.map((c, i) => (
            <p key={i} style={{ fontSize: '0.875rem', color: 'rgba(248,113,113,0.75)' }}>⚠ {c}</p>
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
