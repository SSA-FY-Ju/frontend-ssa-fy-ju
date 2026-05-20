'use client';

/**
 * 월별 운세 캘린더 (T076)
 *
 * - 12개월 데이터 표시 (점수, 조언, 행운/주의/일반 색상)
 * - 데스크톱: 4×3 격자 (한눈에 조회)
 * - 모바일: 카드 리스트
 * - 이전/다음 분기 네비게이션
 */

import { useState } from 'react';

interface MonthlyForecast {
  month: number;
  score: number;
  type: 'LUCKY' | 'CAUTION' | 'NORMAL';
  advice: string;
}

const TYPE_STYLES: Record<MonthlyForecast['type'], string> = {
  LUCKY: 'bg-star-500/20 border-star-500 text-star-300',
  CAUTION: 'bg-red-900/30 border-red-500 text-red-300',
  NORMAL: 'bg-night-800 border-night-700 text-white',
};

const TYPE_ICON: Record<MonthlyForecast['type'], string> = {
  LUCKY: '★',
  CAUTION: '⚠️',
  NORMAL: '',
};

interface MonthlyCalendarProps {
  forecasts: MonthlyForecast[];
}

export function MonthlyCalendar({ forecasts }: MonthlyCalendarProps) {
  // 분기 네비게이션: 0=1~4월, 1=5~8월, 2=9~12월
  const [quarter, setQuarter] = useState(0);

  const quarters = [
    forecasts.slice(0, 4),
    forecasts.slice(4, 8),
    forecasts.slice(8, 12),
  ];

  const quarterLabels = ['1~4월', '5~8월', '9~12월'];

  return (
    <div className="flex flex-col gap-4">
      {/* 네비게이션 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setQuarter((q) => Math.max(0, q - 1))}
          disabled={quarter === 0}
          aria-label="이전 분기"
          className="px-3 py-1 text-star-300 disabled:text-night-700 hover:text-star-500 transition-colors"
        >
          ‹ 이전
        </button>
        <span className="text-star-400 text-sm font-medium">{quarterLabels[quarter]}</span>
        <button
          onClick={() => setQuarter((q) => Math.min(2, q + 1))}
          disabled={quarter === 2}
          aria-label="다음 분기"
          className="px-3 py-1 text-star-300 disabled:text-night-700 hover:text-star-500 transition-colors"
        >
          다음 ›
        </button>
      </div>

      {/* 월별 카드 그리드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quarters[quarter]?.map((f) => (
          <div
            key={f.month}
            className={`rounded-lg border p-3 flex flex-col gap-1 ${TYPE_STYLES[f.type]}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">{f.month}월</span>
              <span className="text-xs" aria-hidden="true">{TYPE_ICON[f.type]}</span>
            </div>
            <div className="text-lg font-bold">{f.score}점</div>
            <p className="text-xs leading-relaxed opacity-80">{f.advice}</p>
          </div>
        ))}
      </div>

      {/* 범례 */}
      <div className="flex gap-4 text-xs justify-center" style={{ color: 'rgba(255,255,255,0.45)' }}>
        <span><span className="text-star-500">★</span> 행운</span>
        <span><span className="text-red-400">⚠</span> 주의</span>
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>● 일반</span>
      </div>
    </div>
  );
}
