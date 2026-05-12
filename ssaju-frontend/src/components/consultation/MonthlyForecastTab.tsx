'use client';

/** 월별운세 탭 (T074) */

import type { MonthlyForecast } from '@/types/api';
import { MonthlyCalendar } from '@/components/visualization/MonthlyCalendar';

interface MonthlyForecastTabProps {
  forecasts: MonthlyForecast[];
}

export function MonthlyForecastTab({ forecasts }: MonthlyForecastTabProps) {
  return <MonthlyCalendar forecasts={forecasts} />;
}
