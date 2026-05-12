'use client';

/**
 * 신뢰도 진행 바 컴포넌트 (T058)
 *
 * - 0-100 점수를 진행 바로 시각화 (Recharts 대신 CSS 진행 바)
 * - 색상: 높음(초록) / 중간(주황) / 낮음(빨강) 동적 변경
 * - 수치 표시 (예: "85 / 100")
 */

interface ConfidenceBarProps {
  /** 신뢰도 점수 (0-100) */
  score: number;
  /** 레이블 (예: "H1 신뢰도") */
  label?: string;
}

function getBarColor(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

export function ConfidenceBar({ score, label }: ConfidenceBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const barColor = getBarColor(clamped);

  return (
    <div className="w-full" role="meter" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      {label && (
        <div className="flex justify-between text-sm text-star-300 mb-1">
          <span>{label}</span>
          <span className="text-white font-medium">{clamped} / 100</span>
        </div>
      )}
      <div className="w-full h-3 bg-night-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
