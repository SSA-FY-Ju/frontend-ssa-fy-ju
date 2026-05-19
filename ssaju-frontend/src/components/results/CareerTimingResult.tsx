'use client';

import type { CareerTimingResult as CareerTimingResultType } from '@/types/api';

interface CareerTimingResultProps {
  result: CareerTimingResultType;
}

function getScoreColor(score: number) {
  if (score >= 70) return { bar: 'bg-emerald-500', text: 'text-emerald-400', glow: 'rgba(16,185,129,0.4)' };
  if (score >= 40) return { bar: 'bg-amber-400', text: 'text-amber-400', glow: 'rgba(251,191,36,0.4)' };
  return { bar: 'bg-rose-500', text: 'text-rose-400', glow: 'rgba(244,63,94,0.4)' };
}

export function CareerTimingResult({ result }: CareerTimingResultProps) {
  const score = Math.max(0, Math.min(100, Math.round(result.confidenceScore)));
  const colors = getScoreColor(score);

  return (
    <div className="flex flex-col gap-5">

      {/* 추천 시기 배너 */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(251,191,36,0.1) 50%, rgba(234,179,8,0.08) 100%)',
          border: '1px solid rgba(245,158,11,0.45)',
        }}
      >
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)' }}
        />
        <p className="text-amber-400 text-xs tracking-widest uppercase mb-3 relative">
          ✦ 채용 운이 좋은 시기 ✦
        </p>
        <p className="text-white text-2xl font-bold relative">{result.favoredPeriod}</p>
      </div>

      {/* 신뢰도 카드 */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: 'rgba(8,12,24,0.7)',
          border: '1px solid rgba(30,41,59,0.8)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 text-sm">분석 신뢰도</span>
          <span
            className={`text-2xl font-bold ${colors.text}`}
            style={{ textShadow: `0 0 12px ${colors.glow}` }}
          >
            {score}%
          </span>
        </div>
        <div
          className="w-full h-3 rounded-full overflow-hidden"
          style={{ background: 'rgba(30,41,59,0.8)' }}
          role="meter"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="분석 신뢰도"
        >
          <div
            className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
            style={{
              width: `${score}%`,
              boxShadow: `0 0 8px ${colors.glow}`,
            }}
          />
        </div>
      </div>

      {/* 분석 근거 */}
      <div
        className="rounded-xl p-5"
        style={{
          background: 'rgba(15,23,42,0.6)',
          border: '1px solid rgba(71,85,105,0.5)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-violet-400 text-xs">★</span>
          <h3 className="text-violet-400 text-xs font-semibold tracking-wide uppercase">분석 근거</h3>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{result.reasoning}</p>
      </div>

    </div>
  );
}
