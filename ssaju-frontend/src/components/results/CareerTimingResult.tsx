'use client';

/**
 * 관운 분석 결과 컴포넌트 (T057)
 *
 * 표시 내용:
 * - 추천 시기 하이라이트 배너
 * - H1 / H2 비교 카드 (신뢰도 포함)
 * - 분석 근거 텍스트
 */

import type { CareerTimingResult as CareerTimingResultType } from '@/types/api';

interface CareerTimingResultProps {
  result: CareerTimingResultType;
}

function getBarColor(score: number): string {
  if (score >= 70) return 'bg-emerald-500';
  if (score >= 40) return 'bg-amber-400';
  return 'bg-rose-500';
}

function getBarGlow(score: number): string {
  if (score >= 70) return 'shadow-emerald-500/40';
  if (score >= 40) return 'shadow-amber-400/40';
  return 'shadow-rose-500/40';
}

export function CareerTimingResult({ result }: CareerTimingResultProps) {
  const recommended = result.h1Confidence >= result.h2Confidence ? 'H1' : 'H2';
  const recommendedPeriod = recommended === 'H1' ? result.h1Period : result.h2Period;
  const h1Clamped = Math.max(0, Math.min(100, Math.round(result.h1Confidence)));
  const h2Clamped = Math.max(0, Math.min(100, Math.round(result.h2Confidence)));

  return (
    <div className="flex flex-col gap-5">
      {/* 추천 시기 배너 — 골드 계열로 추천 카드(보라)와 명확히 구분 */}
      <div className="relative overflow-hidden rounded-2xl p-6 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(251,191,36,0.1) 50%, rgba(234,179,8,0.08) 100%)',
          border: '1px solid rgba(245,158,11,0.45)',
        }}
      >
        {/* 배경 광원 */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)' }}
        />

        <p className="text-amber-400 text-xs tracking-widest uppercase mb-3 relative">
          ✦ 채용 운이 좋은 시기 ✦
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3 relative"
          style={{ background: 'rgba(245,158,11,0.25)', border: '1px solid rgba(251,191,36,0.5)' }}
        >
          <span className="text-amber-300 text-xs font-medium">{recommended} 권장</span>
        </div>
        <p className="text-white text-2xl font-bold relative">{recommendedPeriod}</p>
      </div>

      {/* H1 / H2 비교 카드 */}
      <div className="grid grid-cols-2 gap-3">
        {/* H1 카드 */}
        <PeriodCard
          label="H1"
          period={result.h1Period}
          score={h1Clamped}
          isRecommended={recommended === 'H1'}
        />
        {/* H2 카드 */}
        <PeriodCard
          label="H2"
          period={result.h2Period}
          score={h2Clamped}
          isRecommended={recommended === 'H2'}
        />
      </div>

      {/* 분석 근거 */}
      <div className="rounded-xl p-5"
        style={{
          background: 'rgba(15,23,42,0.6)',
          border: '1px solid rgba(71,85,105,0.5)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-star-400 text-xs">★</span>
          <h3 className="text-star-400 text-xs font-semibold tracking-wide uppercase">분석 근거</h3>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{result.recommendation}</p>
      </div>
    </div>
  );
}

interface PeriodCardProps {
  label: string;
  period: string;
  score: number;
  isRecommended: boolean;
}

function PeriodCard({ label, period, score, isRecommended }: PeriodCardProps) {
  const barColor = getBarColor(score);
  const barGlow = getBarGlow(score);

  return (
    <div
      className="relative rounded-xl p-4 flex flex-col gap-3 transition-all duration-300"
      style={
        isRecommended
          ? {
              background: 'linear-gradient(135deg, rgba(109,40,217,0.38) 0%, rgba(37,99,235,0.28) 100%)',
              border: '1px solid rgba(139,92,246,0.7)',
              boxShadow: '0 0 28px rgba(109,40,217,0.22), inset 0 1px 0 rgba(255,255,255,0.08)',
            }
          : {
              background: 'rgba(8,12,24,0.7)',
              border: '1px solid rgba(30,41,59,0.8)',
            }
      }
    >
      {isRecommended && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-xs font-medium"
          style={{ background: 'linear-gradient(90deg, #7c3aed, #2563eb)', color: '#fff' }}
        >
          추천
        </div>
      )}

      {/* 레이블 */}
      <div className="text-center pt-1">
        <span className={`text-xs font-bold tracking-widest ${isRecommended ? 'text-violet-300' : 'text-slate-400'}`}>
          {label}
        </span>
      </div>

      {/* 기간 */}
      <p className={`text-center text-sm font-medium leading-snug ${isRecommended ? 'text-white' : 'text-slate-400'}`}>
        {period}
      </p>

      {/* 신뢰도 바 */}
      <div className="flex flex-col gap-1.5"
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} 신뢰도`}
      >
        <div className="w-full h-2 rounded-full overflow-hidden"
          style={{ background: 'rgba(30,41,59,0.8)' }}
        >
          <div
            className={`h-full rounded-full transition-all duration-700 shadow-lg ${barColor} ${barGlow}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 text-xs">신뢰도</span>
          <span className={`text-xs font-bold ${isRecommended ? 'text-violet-300' : 'text-slate-400'}`}>
            {score}%
          </span>
        </div>
      </div>
    </div>
  );
}
