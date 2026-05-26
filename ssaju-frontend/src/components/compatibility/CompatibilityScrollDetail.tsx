'use client';

/**
 * 기업 궁합 분석 — 스크롤형 상세 뷰 (마이페이지 기록 상세용)
 * FullPageCompatibility의 모든 섹션을 세로 스크롤로 배치
 */

import type { CompatibilityResult, MonthlyForecast } from '@/types/api';

const SECTIONS = [
  { key: 'score',     label: '종합 점수',  color: '#f59e0b' },
  { key: 'role',      label: '직군 분석',  color: '#06b6d4' },
  { key: 'ohang',     label: '오행 분석',  color: '#10b981' },
  { key: 'interview', label: '면접 준비',  color: '#8b5cf6' },
  { key: 'monthly',   label: '월별 운세',  color: '#3b82f6' },
  { key: 'caution',   label: '주의사항',   color: '#f87171' },
] as const;

/* ── 섹션 카드 래퍼 ─────────────────────────────── */

function SectionCard({
  index, label, color, subtitle, children,
}: {
  index: number; label: string; color: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: `radial-gradient(ellipse at 80% 10%, ${color}10 0%, transparent 55%)`,
        border: `1px solid ${color}20`,
        borderRadius: 20,
        padding: '24px 22px',
      }}
    >
      {/* 섹션 헤더 */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ color, opacity: 0.6, fontSize: 11, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ opacity: 0.8 }}>✦</span>
          <span>&mdash;&nbsp;{String(index + 1).padStart(2, '0')}&nbsp;&mdash;</span>
          <span style={{ opacity: 0.8 }}>✦</span>
        </p>
        <h3 className="font-black text-white" style={{ fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', lineHeight: 1.1, marginBottom: 6, letterSpacing: '-0.02em' }}>
          {label}
        </h3>
        {subtitle && (
          <p style={{ fontSize: '0.78rem', color, opacity: 0.65, fontStyle: 'italic', letterSpacing: '0.04em' }}>{subtitle}</p>
        )}
        <div style={{ height: 1, background: `linear-gradient(90deg, ${color}99 0%, ${color}22 50%, transparent 100%)`, marginTop: 12 }} />
      </div>
      {children}
    </div>
  );
}

/* ── 1. 종합 점수 ──────────────────────────────── */

function ScoreSection({
  score, companyName, breakdown, summary, color,
}: {
  score: number;
  companyName: string;
  breakdown: CompatibilityResult['analysisBreakdown'];
  summary?: string;
  color: string;
}) {
  const gradeColor = score >= 80 ? '#f59e0b' : score >= 60 ? '#22c55e' : score >= 40 ? '#06b6d4' : '#ef4444';
  const grade = score >= 80 ? '최상' : score >= 60 ? '양호' : score >= 40 ? '보통' : '주의';
  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - score / 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        {companyName && (
          <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', textShadow: `0 0 40px ${color}44` }}>
            {companyName}
          </p>
        )}
        <div style={{ position: 'relative', width: 140, height: 140 }}>
          <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <circle
              cx="70" cy="70" r="54" fill="none"
              stroke={gradeColor} strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)', filter: `drop-shadow(0 0 8px ${gradeColor}88)` }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>/ 100</span>
          </div>
        </div>
        <span style={{ display: 'inline-block', padding: '4px 16px', borderRadius: 999, background: `${gradeColor}22`, border: `1px solid ${gradeColor}55`, color: gradeColor, fontSize: 13, fontWeight: 800 }}>
          {grade}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { label: '성향 일치도',  value: breakdown.characterMatch },
          { label: '잠재 시너지', value: breakdown.potentialSynergy },
          { label: '장기 안정성', value: breakdown.longTermStability },
        ].map(({ label, value }) => {
          const barColor = value >= 80 ? '#22c55e' : value >= 60 ? '#f59e0b' : '#ef4444';
          return (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</span>
                <span style={{ color: barColor, fontWeight: 700 }}>{value}점</span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${value}%`, height: '100%', background: barColor, borderRadius: 999, boxShadow: `0 0 6px ${barColor}66`, transition: 'width 0.7s ease' }} />
              </div>
            </div>
          );
        })}
      </div>

      {summary && (
        <div style={{ padding: '14px 18px', borderRadius: 12, background: `${color}0c`, border: `1px solid ${color}25`, textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontStyle: 'italic' }}>{summary}</p>
        </div>
      )}
    </div>
  );
}

/* ── 2. 직군 분석 ──────────────────────────────── */

function RoleSection({ analysis, color }: { analysis: CompatibilityResult['targetRoleAnalysis']; color: string }) {
  const gradeColor = analysis.matchScore >= 80 ? '#22c55e' : analysis.matchScore >= 60 ? '#f59e0b' : '#ef4444';
  const matchGrade = analysis.matchScore >= 80 ? '최상' : analysis.matchScore >= 60 ? '양호' : '보통';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '18px 20px', borderRadius: 14, background: `${color}10`, border: `1px solid ${color}22` }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 40, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{analysis.matchScore}</p>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>직군 매칭</p>
        </div>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        <span style={{ fontSize: 13, fontWeight: 800, color: gradeColor, padding: '4px 14px', borderRadius: 999, background: `${gradeColor}20`, border: `1px solid ${gradeColor}44` }}>
          {matchGrade}
        </span>
      </div>
      <div>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color, opacity: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>시너지</p>
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.75 }}>{analysis.synergy}</p>
      </div>
      <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)' }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color: '#f87171', opacity: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>주의</p>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65 }}>{analysis.warning}</p>
      </div>
    </div>
  );
}

/* ── 3. 오행 분석 ──────────────────────────────── */

const ELEMENT_COLORS: Record<string, string> = {
  '木': '#22c55e', '火': '#ef4444', '土': '#f59e0b', '金': '#e2e8f0', '水': '#3b82f6',
};

function OhangSection({ data, color }: { data: CompatibilityResult['fiveElements']; color: string }) {
  const elements = ['木', '火', '土', '金', '水'];
  const userEl = data?.userDistribution ?? {};
  const companyEl = data?.companyDistribution ?? {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {elements.map((el) => {
          const userVal = userEl[el] ?? 0;
          const companyVal = companyEl[el] ?? 0;
          const elColor = ELEMENT_COLORS[el] ?? color;
          const maxVal = Math.max(...elements.map((e) => Math.max(userEl[e] ?? 0, companyEl[e] ?? 0, 1)));
          return (
            <div key={el} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 16, width: 24, textAlign: 'center', color: elColor }}>{el}</span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', width: 28 }}>나</span>
                  <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${(userVal / maxVal) * 100}%`, height: '100%', background: elColor, borderRadius: 999, opacity: 0.9 }} />
                  </div>
                  <span style={{ fontSize: 10, color: elColor, fontWeight: 700, width: 12 }}>{userVal}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', width: 28 }}>기업</span>
                  <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${(companyVal / maxVal) * 100}%`, height: '100%', background: elColor, borderRadius: 999, opacity: 0.5 }} />
                  </div>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700, width: 12 }}>{companyVal}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: '16px', borderRadius: 12, background: `${color}0a`, border: `1px solid ${color}22` }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color, opacity: 0.55, textTransform: 'uppercase', marginBottom: 10 }}>종합 분석</p>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.75 }}>{data?.synergyDescription}</p>
      </div>
    </div>
  );
}

/* ── 4. 면접 준비 ──────────────────────────────── */

function InterviewSection({
  questions, roles, strategy, color,
}: {
  questions: CompatibilityResult['expectedInterviewQuestions'];
  roles: CompatibilityResult['roleCompatibility'];
  strategy?: CompatibilityResult['actionableStrategy'];
  color: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {strategy?.interviewKeywords && strategy.interviewKeywords.length > 0 && (
        <div>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color, opacity: 0.55, textTransform: 'uppercase', marginBottom: 10 }}>핵심 키워드</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {strategy.interviewKeywords.map((kw, i) => (
              <span key={i} style={{ padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: `${color}15`, border: `1px solid ${color}35`, color }}>
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {strategy?.weaknessDefense && (
        <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.18)' }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color: '#f87171', opacity: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>약점 방어 전략</p>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>{strategy.weaknessDefense}</p>
        </div>
      )}

      <div>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color, opacity: 0.55, textTransform: 'uppercase', marginBottom: 12 }}>예상 면접 질문</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {questions.map((q, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 14px', borderRadius: 10, background: `${color}0a`, border: `1px solid ${color}1a` }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color, opacity: 0.5, flexShrink: 0, paddingTop: 2 }}>Q{i + 1}</span>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.65 }}>{q.question}</p>
              </div>
              {q.intent && (
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5, paddingLeft: 24 }}>{q.intent}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {roles.length > 0 && (
        <div>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color, opacity: 0.55, textTransform: 'uppercase', marginBottom: 12 }}>직군별 궁합</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {roles.map((role, i) => {
              const roleColor = role.score >= 80 ? '#22c55e' : role.score >= 60 ? '#f59e0b' : '#f87171';
              return (
                <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ textAlign: 'center', minWidth: 36 }}>
                    <p style={{ fontSize: 18, fontWeight: 900, color: roleColor, lineHeight: 1 }}>{role.score}</p>
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>점</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>{role.roleName}</p>
                      {role.tag && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: `${roleColor}20`, color: roleColor }}>{role.tag}</span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>{role.reason}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 5. 월별 운세 ──────────────────────────────── */

function MonthlySection({
  forecasts, bestTiming, color,
}: {
  forecasts: MonthlyForecast[];
  bestTiming?: NonNullable<CompatibilityResult['actionableStrategy']>['bestTiming'];
  color: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {bestTiming && (
        <div style={{ padding: '14px 16px', borderRadius: 12, background: `${color}0c`, border: `1px solid ${color}25`, marginBottom: 4 }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color, opacity: 0.55, textTransform: 'uppercase', marginBottom: 10 }}>행운의 날</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: bestTiming.preferredTime ? 10 : 0 }}>
            {bestTiming.luckyDays.map((day, i) => (
              <span key={i} style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: `${color}18`, border: `1px solid ${color}35`, color }}>
                {day}
              </span>
            ))}
          </div>
          {bestTiming.preferredTime && (
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>
              ⏰ 추천 시간대: <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{bestTiming.preferredTime}</span>
            </p>
          )}
        </div>
      )}

      {forecasts.map((f, i) => {
        const isLucky = f.status === 'LUCKY';
        const isCaution = f.status === 'CAUTION';
        const barColor = isLucky ? '#22c55e' : isCaution ? '#f87171' : '#06b6d4';
        const dotsFilled = Math.round(f.score / 10);
        return (
          <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 12, background: `${color}08`, border: `1px solid ${color}18` }}>
            <div style={{ minWidth: 56 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color, opacity: 0.7 }}>{f.month}월</p>
              <div style={{ display: 'flex', gap: 2, marginTop: 6 }}>
                {Array.from({ length: 10 }).map((_, j) => (
                  <div key={j} style={{ width: 4, height: 4, borderRadius: 999, background: j < dotsFilled ? barColor : 'rgba(255,255,255,0.08)' }} />
                ))}
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, flex: 1 }}>{f.advice}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ── 6. 주의사항 ───────────────────────────────── */

function CautionSection({ cautions, color }: { cautions: string[]; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {cautions.map((c, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 16px', borderRadius: 12, background: `${color}08`, border: `1px solid ${color}20` }}>
          <span style={{ fontSize: 16, flexShrink: 0, opacity: 0.7 }}>⚠</span>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>{c}</p>
        </div>
      ))}
    </div>
  );
}

/* ── 메인 컴포넌트 ─────────────────────────────── */

interface CompatibilityScrollDetailProps {
  data: CompatibilityResult;
}

export function CompatibilityScrollDetail({ data }: CompatibilityScrollDetailProps) {
  const companyName = data.requestContext?.companyName ?? '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionCard index={0} label={SECTIONS[0].label} color={SECTIONS[0].color} subtitle="사주가 말하는 당신과 이 기업의 에너지 궁합">
        <ScoreSection
          score={data.compatibilityScore}
          companyName={companyName}
          breakdown={data.analysisBreakdown}
          summary={data.summary}
          color={SECTIONS[0].color}
        />
      </SectionCard>

      <SectionCard index={1} label={SECTIONS[1].label} color={SECTIONS[1].color} subtitle="당신의 별자리가 이 직군과 만나는 방식">
        <RoleSection analysis={data.targetRoleAnalysis} color={SECTIONS[1].color} />
      </SectionCard>

      <SectionCard index={2} label={SECTIONS[2].label} color={SECTIONS[2].color} subtitle="우주의 다섯 기운이 빚어낸 조화">
        <OhangSection data={data.fiveElements} color={SECTIONS[2].color} />
      </SectionCard>

      <SectionCard index={3} label={SECTIONS[3].label} color={SECTIONS[3].color} subtitle="별이 예고하는 면접의 흐름">
        <InterviewSection
          questions={data.expectedInterviewQuestions}
          roles={data.roleCompatibility}
          strategy={data.actionableStrategy}
          color={SECTIONS[3].color}
        />
      </SectionCard>

      {data.monthlyForecast?.length > 0 && (
        <SectionCard index={4} label={SECTIONS[4].label} color={SECTIONS[4].color} subtitle="시간이 열어주는 기회의 문">
          <MonthlySection
            forecasts={data.monthlyForecast}
            bestTiming={data.actionableStrategy?.bestTiming}
            color={SECTIONS[4].color}
          />
        </SectionCard>
      )}

      {data.cautions?.length > 0 && (
        <SectionCard index={5} label={SECTIONS[5].label} color={SECTIONS[5].color} subtitle="별이 당부하는 말들">
          <CautionSection cautions={data.cautions} color={SECTIONS[5].color} />
        </SectionCard>
      )}
    </div>
  );
}
