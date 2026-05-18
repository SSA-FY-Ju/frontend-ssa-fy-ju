'use client';

/** 월별운세 탭 (T074) */

import type { MonthlyForecast } from '@/types/api';
import { MonthlyCalendar } from '@/components/visualization/MonthlyCalendar';

interface MonthlyForecastTabProps {
  forecasts: MonthlyForecast[];
}

export function MonthlyForecastTab({ forecasts }: MonthlyForecastTabProps) {
  return (
    <div
      className="animate-item"
      style={{
        backdropFilter: 'blur(12px)',
        background: 'rgba(168,85,247,0.04)',
        border: '1px solid rgba(168,85,247,0.18)',
        borderRadius: 20,
        padding: '24px',
      }}
    >
      <MonthlyCalendar forecasts={forecasts} />
    </div>
  );
}
