'use client';

/** 월별운세 탭 — 미니멀 헤더 + 캘린더 */

import type { MonthlyForecast } from '@/types/api';
import { MonthlyCalendar } from '@/components/visualization/MonthlyCalendar';

interface MonthlyForecastTabProps {
  forecasts: MonthlyForecast[];
}

const MOON_PHASES = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

export function MonthlyForecastTab({ forecasts }: MonthlyForecastTabProps) {
  const year = new Date().getFullYear();
  const moon = MOON_PHASES[new Date().getMonth() % 8];

  return (
    <div className="flex flex-col gap-6">
      {/* ── 헤더 ── */}
      <div
        className="animate-item"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          paddingBottom: 20,
          borderBottom: '1px solid rgba(168,85,247,0.15)',
          animationDelay: '0s',
        }}
      >
        <div>
          <p
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.22em',
              color: '#c084fc',
              opacity: 0.6,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            {year}년 월별 운세
          </p>
          <p
            style={{
              fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
              fontWeight: 800,
              color: 'rgba(255,255,255,0.9)',
              letterSpacing: '-0.01em',
            }}
          >
            별들이 전하는 한 해의 흐름
          </p>
        </div>
        <span
          style={{
            fontSize: 44,
            lineHeight: 1,
            filter: 'drop-shadow(0 0 12px rgba(168,85,247,0.6))',
            flexShrink: 0,
          }}
        >
          {moon}
        </span>
      </div>

      {/* ── 캘린더 ── */}
      <div className="animate-item" style={{ animationDelay: '0.1s' }}>
        <MonthlyCalendar forecasts={forecasts} />
      </div>
    </div>
  );
}
